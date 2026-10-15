import axios from 'axios';
import { CONFIG } from '../config';

export class ElevenLabsService {
  /**
   * Synthesize text into speech audio MP3 buffer/base64 using ElevenLabs API
   */
  async generateSpeech(text: string, voiceId?: string): Promise<{ audioBase64: string | null; mimeType: string }> {
    const targetVoiceId = voiceId || CONFIG.ELEVENLABS_VOICE_ID || 'Gfpl8Yo74Is0W6cPUWWT';
    const apiKey = CONFIG.ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY;

    if (!apiKey) {
      console.log('ℹ️ ElevenLabs API Key not set. Client will use browser Web Speech API fallback.');
      return { audioBase64: null, mimeType: 'audio/mp3' };
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.42,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
          timeout: 10000,
        }
      );

      const buffer = Buffer.from(response.data);
      const audioBase64 = `data:audio/mp3;base64,${buffer.toString('base64')}`;
      return { audioBase64, mimeType: 'audio/mp3' };
    } catch (err: any) {
      console.warn('ElevenLabs TTS synthesis primary model attempt failed, trying fallback:', err.message);
      try {
        const fallbackRes = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`,
          {
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          },
          {
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
            },
            responseType: 'arraybuffer',
            timeout: 10000,
          }
        );
        const buffer = Buffer.from(fallbackRes.data);
        const audioBase64 = `data:audio/mp3;base64,${buffer.toString('base64')}`;
        return { audioBase64, mimeType: 'audio/mp3' };
      } catch (fallbackErr: any) {
        console.warn('ElevenLabs TTS synthesis fallback error:', fallbackErr.message);
        return { audioBase64: null, mimeType: 'audio/mp3' };
      }
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
