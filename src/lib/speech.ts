export class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  public isSpeechSupported(): boolean {
    return this.isSupported;
  }

  public async speakWord(word: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice | null;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      
      // Set child-friendly speech settings
      utterance.rate = options?.rate || 0.7; // Slower for children
      utterance.pitch = options?.pitch || 1.1; // Slightly higher pitch
      utterance.volume = options?.volume || 0.8;
      
      // Try to use a specific voice if provided
      if (options?.voice) {
        utterance.voice = options.voice;
      } else {
        // Try to find a suitable voice for children
        const voices = this.synthesis.getVoices();
        const childFriendlyVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Female') || voice.name.includes('Karen') || voice.name.includes('Samantha'))
        );
        if (childFriendlyVoice) {
          utterance.voice = childFriendlyVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      // Add a small delay to ensure voices are loaded
      setTimeout(() => {
        this.synthesis!.speak(utterance);
      }, 100);
    });
  }

  public async speakEncouragement(type: 'correct' | 'incorrect' | 'try-again'): Promise<void> {
    const encouragements = {
      correct: [
        'Great job!',
        'Well done!',
        'Excellent!',
        'Perfect!',
        'You got it!',
        'Fantastic!'
      ],
      incorrect: [
        'Good try!',
        'Almost there!',
        'Keep trying!',
        'You can do it!',
        'Try again!'
      ],
      'try-again': [
        'Let\'s try another word!',
        'Ready for the next one?',
        'Here comes another word!',
        'Let\'s keep going!'
      ]
    };

    const messages = encouragements[type];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.speakWord(randomMessage, {
      rate: 0.8,
      pitch: 1.2,
    });
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis || !this.isSupported) {
      return [];
    }
    return this.synthesis.getVoices();
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// Convenience functions for easy use throughout the app
export const speechService = SpeechService.getInstance();

export const speakWord = (word: string) => speechService.speakWord(word);

export const speakEncouragement = (type: 'correct' | 'incorrect' | 'try-again') => 
  speechService.speakEncouragement(type);

export const isSpeechSupported = () => speechService.isSpeechSupported();

export const stopSpeaking = () => speechService.stopSpeaking();