// Speech synthesis utilities for the spelling app

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}

export function speakWord(word: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    
    // Configure speech settings for children
    utterance.rate = 0.7; // Slower speech for clarity
    utterance.pitch = 1.1; // Slightly higher pitch
    utterance.volume = 1.0;

    // Try to use a voice suitable for children
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Woman'))
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      reject(event);
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function speakEncouragement(type: 'correct' | 'incorrect' | 'try-again'): Promise<void> {
  const encouragements = {
    correct: [
      "Great job!",
      "Excellent!",
      "Perfect!",
      "Well done!",
      "Fantastic!",
      "Amazing work!",
      "You got it!"
    ],
    incorrect: [
      "Good try!",
      "Almost there!",
      "Keep trying!",
      "You're doing great!",
      "Don't give up!",
      "Try again!"
    ],
    'try-again': [
      "Keep practicing!",
      "You're getting better!",
      "Don't worry, keep going!",
      "Practice makes perfect!",
      "You can do it!",
      "Keep up the good work!"
    ]
  };

  const messages = encouragements[type];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return speakText(randomMessage);
}

export function speakText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    // Try to use a child-friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Woman'))
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      reject(event);
    };

    window.speechSynthesis.speak(utterance);
  });
}

// Utility to load voices (some browsers need this)
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Some browsers load voices asynchronously
    const handleVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(voices);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Fallback timeout
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}