export type SpeechState = 'idle' | 'listening' | 'speaking' | 'processing';

export class SpeechEngine {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
      this.isSupported = !!(this.recognition || this.synthesis);
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  /**
   * Play ElevenLabs audio base64 MP3 stream
   */
  public playAudioBase64(
    audioBase64: string,
    onStart?: () => void,
    onEnd?: () => void
  ): boolean {
    this.stopSpeaking();
    try {
      const audio = new Audio(audioBase64);
      this.currentAudio = audio;
      
      audio.onplay = () => {
        if (onStart) onStart();
      };

      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn('ElevenLabs Audio element play error:', err);
          this.currentAudio = null;
          if (onEnd) onEnd();
        });
      }
      return true;
    } catch (e) {
      if (onEnd) onEnd();
      return false;
    }
  }

  /**
   * Primary Speech synthesis method preferring ElevenLabs AI Voice base64 stream.
   * If audioBase64 is null, attempts to fetch from backend TTS endpoint or falls back to Web Speech API.
   */
  public async speakElevenLabs(
    text: string,
    audioBase64?: string | null,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();

    // 1. If ElevenLabs Audio Base64 is already provided by turn response
    if (audioBase64 && audioBase64.startsWith('data:audio')) {
      const success = this.playAudioBase64(audioBase64, onStart, onEnd);
      if (success) return;
    }

    // 2. Otherwise request ElevenLabs audio synthesis from backend TTS route
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
      const res = await fetch(`${backendUrl}/api/interview/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        const played = this.playAudioBase64(data.audioBase64, onStart, onEnd);
        if (played) return;
      }
    } catch (err) {
      console.warn('Failed to fetch ElevenLabs TTS from backend, falling back to Web Speech API.');
    }

    // 3. Fallback to Web Speech API
    this.speak(text, onStart, onEnd);
  }

  /**
   * Speak text out loud using browser Web Speech Synthesis (fallback)
   */
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick natural English voice if available
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Start listening to mic and return continuous transcript via callback
   */
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void
  ): void {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported in this browser.');
      return;
    }

    try {
      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        onResult(currentText, !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        if (onError) onError(event.error);
      };

      this.recognition.start();
    } catch (e: any) {
      if (onError) onError(e.message);
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

export const speechEngine = new SpeechEngine();
