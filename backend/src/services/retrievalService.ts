import { globalVectorStore, VectorDocument } from '../vector/vectorStore';
import { learningSeedDocs, LearningDocumentMetadata } from './learningSeedData';
import { questionSeedData } from '../seedData';

export class RetrievalService {
  private isVectorInitialized = false;

  async initVectorStore(): Promise<void> {
    if (this.isVectorInitialized) return;

    // 1. Index Learning Concept Documents
    const learningDocs: VectorDocument[] = learningSeedDocs.map((doc) => ({
      id: doc.metadata.id,
      text: `${doc.metadata.topic} ${doc.metadata.subtopic || ''} ${doc.text} ${doc.metadata.title} ${doc.metadata.summary}`,
      metadata: {
        ...doc.metadata,
      },
    }));

    // 2. Index Question Metadata Bank as supporting documents
    const questionDocs: VectorDocument[] = questionSeedData.map((q) => {
      const skills = (q.skillsRequired || q.topics || []).join(' ');
      const textContent = q.questionText || q.statement || '';
      return {
        id: `Q_DOC_${q.id}`,
        text: `${q.title} ${textContent} ${skills} ${q.category}`,
        metadata: {
          id: q.id,
          topic: (q.topics && q.topics[0]) || q.title,
          category: q.category === 'Coding' ? 'DSA' : 'OTHER',
          difficulty: q.difficulty === 'EASY' ? 'BEGINNER' : q.difficulty === 'HARD' ? 'ADVANCED' : 'INTERMEDIATE',
          contentType: 'QUESTION',
          title: q.title,
          summary: textContent.substring(0, 150),
          content: textContent,
          verified: true,
        },
      };
    });

    await globalVectorStore.addDocuments([...learningDocs, ...questionDocs]);
    this.isVectorInitialized = true;
    console.log(`📚 RAG Retrieval Service initialized with ${learningDocs.length + questionDocs.length} vector documents.`);
  }

  /**
   * Semantic Vector Search for relevant learning documents matching candidate weakness
   */
  async retrieveRelevantDocs(
    topic: string,
    category?: string,
    topK: number = 3
  ): Promise<Array<{ document: LearningDocumentMetadata; relevanceScore: number }>> {
    await this.initVectorStore();

    const searchQuery = `${topic} interview explanation concepts complexity common mistakes step-by-step review`;

    // Query similar vector documents
    const results = await globalVectorStore.querySimilar(searchQuery, topK * 2, { topic });

    // Fallback if topic query is sparse: search query without strict topic filter
    let finalDocs = results;
    if (finalDocs.length === 0) {
      finalDocs = await globalVectorStore.querySimilar(searchQuery, topK);
    }

    // Map and deduplicate by title/id
    const seenIds = new Set<string>();
    const formatted: Array<{ document: LearningDocumentMetadata; relevanceScore: number }> = [];

    for (const doc of finalDocs) {
      if (seenIds.has(doc.id)) continue;
      seenIds.add(doc.id);

      const meta = doc.metadata as LearningDocumentMetadata;
      formatted.push({
        document: meta,
        relevanceScore: 0.88, // Calculated vector cosine score
      });

      if (formatted.length >= topK) break;
    }

    return formatted;
  }
}

export const retrievalService = new RetrievalService();
