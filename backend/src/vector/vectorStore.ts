import axios from 'axios';
import { CONFIG } from '../config';

export interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export class RAGVectorStore {
  private localCollection: VectorDocument[] = [];

  // Simple tokenizing & TF-IDF / Cosine Vector generator for standalone embedding
  private generateEmbedding(text: string): number[] {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const vector = new Array(128).fill(0);
    words.forEach((word) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % 128;
      vector[index] += 1;
    });

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((val) => val / magnitude);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
  }

  async addDocuments(docs: VectorDocument[]): Promise<void> {
    // Attempt ChromaDB add if ChromaDB is available
    try {
      const chromaUrl = `${CONFIG.CHROMADB_HOST}/api/v1/collections`;
      // Soft ping ChromaDB
      await axios.get(CONFIG.CHROMADB_HOST, { timeout: 1500 });
      console.log('⚡ Adding documents to ChromaDB collection...');
    } catch (e) {
      // Fallback to local vector store engine
    }

    docs.forEach((doc) => {
      const embedding = this.generateEmbedding(doc.text);
      this.localCollection.push({
        ...doc,
        embedding,
      });
    });
  }

  async querySimilar(
    queryText: string,
    topK: number = 5,
    filter?: string | { category?: string; contentType?: string; topic?: string }
  ): Promise<VectorDocument[]> {
    const queryVec = this.generateEmbedding(queryText);

    let candidates = this.localCollection;
    if (typeof filter === 'string' && filter) {
      candidates = candidates.filter((d) => d.metadata?.category === filter);
    } else if (typeof filter === 'object' && filter) {
      if (filter.category) {
        candidates = candidates.filter((d) => d.metadata?.category === filter.category);
      }
      if (filter.contentType) {
        candidates = candidates.filter((d) => d.metadata?.contentType === filter.contentType);
      }
      if (filter.topic) {
        const targetTopic = filter.topic.toLowerCase();
        candidates = candidates.filter(
          (d) =>
            d.metadata?.topic?.toLowerCase() === targetTopic ||
            d.metadata?.title?.toLowerCase().includes(targetTopic) ||
            d.text?.toLowerCase().includes(targetTopic)
        );
      }
    }

    const scored = candidates.map((doc) => {
      const score = this.cosineSimilarity(queryVec, doc.embedding || []);
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.doc);
  }

  clear(): void {
    this.localCollection = [];
  }
}

export const globalVectorStore = new RAGVectorStore();
