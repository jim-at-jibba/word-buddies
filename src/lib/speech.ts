// Speech synthesis utilities for the spelling app
import { speakWithElevenLabs, isElevenLabsAvailable } from './elevenlabs-speech';

// Track if speech has been initialized with user interaction
let speechInitialized = false;
let voicesLoaded = false;
let availableVoices: SpeechSynthesisVoice[] = [];

// Detect iOS/iPhone
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Detect iOS Chrome specifically
function isIOSChrome(): boolean {
  return isIOS() && /CriOS/.test(navigator.userAgent);
}

export function isSpeechSupported(): boolean {
  // ElevenLabs is always preferred if available
  if (isElevenLabsAvailable()) {
    return true;
  }
  
  // Fallback to browser speech synthesis
  if (!('speechSynthesis' in window)) {
    return false;
  }
  
  // iOS Chrome has poor speech synthesis support
  if (isIOSChrome()) {
    console.warn('iOS Chrome detected - speech synthesis may be unreliable');
  }
  
  return true;
}

// Initialize speech synthesis with user interaction (required for mobile)
export function initializeSpeech(): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }

    // Create a silent utterance to initialize speech on mobile
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    
    utterance.onstart = () => {
      speechInitialized = true;
      window.speechSynthesis.cancel(); // Cancel the silent utterance
    };
    
    utterance.onend = () => {
      speechInitialized = true;
      resolve();
    };

    utterance.onerror = () => {
      speechInitialized = true;
      resolve();
    };

    // Load voices
    loadVoices().then((voices) => {
      availableVoices = voices;
      voicesLoaded = true;
      window.speechSynthesis.speak(utterance);
    });
  });
}

// Enhanced voice loading for mobile
function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (voicesLoaded && availableVoices.length > 0) {
      resolve(availableVoices);
      return;
    }

    const loadVoicesWithRetry = (retries = 3) => {
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        availableVoices = voices;
        voicesLoaded = true;
        resolve(voices);
        return;
      }

      if (retries > 0) {
        setTimeout(() => loadVoicesWithRetry(retries - 1), 100);
      } else {
        // Fallback: resolve with empty array
        resolve([]);
      }
    };

    // Try immediate load
    loadVoicesWithRetry();

    // Also listen for voiceschanged event
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        availableVoices = voices;
        voicesLoaded = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(voices);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Timeout fallback
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1500);
  });
}

export async function speakWord(word: string): Promise<void> {
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis not supported');
    return;
  }

  try {
    // Try ElevenLabs first if available
    if (isElevenLabsAvailable()) {
      console.log('🎙️ Using ElevenLabs for:', word);
      await speakWithElevenLabs(word);
      return;
    }

    // Fallback to browser speech synthesis
    console.log('🔊 Using browser speech synthesis for:', word);
    await speakWordWithBrowserAPI(word);

  } catch (error) {
    console.error('Error in speakWord:', error);
    // Try fallback if ElevenLabs failed
    if (isElevenLabsAvailable()) {
      console.log('🔄 ElevenLabs failed, trying browser speech fallback');
      try {
        await speakWordWithBrowserAPI(word);
      } catch (fallbackError) {
        console.error('Both speech methods failed:', fallbackError);
      }
    }
  }
}

// Browser API speech implementation (fallback)
async function speakWordWithBrowserAPI(word: string): Promise<void> {
  return new Promise(async (resolve) => {
    try {
      // Initialize speech if not already done (important for mobile)
      if (!speechInitialized) {
        await initializeSpeech();
      }

      // Ensure voices are loaded
      const voices = await ensureVoicesLoaded();

      // Cancel any ongoing speech with retry for mobile
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        // Wait a bit for cancellation on mobile
        await new Promise(r => setTimeout(r, 100));
      }

      const utterance = new SpeechSynthesisUtterance(word);
      
      // Configure speech settings for children
      utterance.rate = 0.7; // Slower speech for clarity
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 1.0;

      // Enhanced voice selection for mobile compatibility
      let preferredVoice = null;
      
      if (voices.length > 0) {
        // Try to find Martha specifically first
        preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('martha') && voice.lang.includes('GB')
        );

        // If Flo not found, try other British women's voices
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.toLowerCase().includes('kate') ||      // UK voice on some systems
             voice.name.toLowerCase().includes('serena') ||    // UK voice on some systems  
             voice.name.toLowerCase().includes('fiona') ||     // Scottish/UK voice
             voice.name.toLowerCase().includes('moira') ||     // UK voice on some systems
             voice.name.toLowerCase().includes('tessa') ||     // UK voice on some systems
             voice.lang.includes('GB') ||                      // British English
             voice.lang.includes('UK'))                        // UK English
          );
        }

        // Fallback to generic female voices
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.toLowerCase().includes('female') || 
             voice.name.toLowerCase().includes('woman') ||
             voice.name.toLowerCase().includes('karen') ||
             voice.name.toLowerCase().includes('victoria') ||
             voice.name.toLowerCase().includes('samantha'))
          );
        }

        // Fallback to any English voice
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => voice.lang.startsWith('en'));
        }

        // Final fallback to first available voice
        if (!preferredVoice && voices.length > 0) {
          preferredVoice = voices[0];
        }
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Enhanced error handling for mobile
      let resolved = false;
      
      utterance.onstart = () => {
        console.log('Browser speech started:', word);
      };

      utterance.onend = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      utterance.onerror = (event) => {
        console.error('Browser speech synthesis error:', event);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      // iOS-specific timeout (very short for iOS Chrome issues)
      const timeoutDuration = isIOSChrome() ? 800 : (isIOS() ? 2000 : 5000);
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('Browser speech timeout, resolving');
          // Force cancel on iOS
          if (isIOS()) {
            try {
              window.speechSynthesis.cancel();
            } catch (e) {
              // Ignore errors
            }
          }
          resolve();
        }
      }, timeoutDuration);

      // Speak the utterance
      window.speechSynthesis.speak(utterance);
      
      // iOS Chrome fallback - if no events fire within 500ms, just resolve
      if (isIOSChrome()) {
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            console.warn('iOS Chrome browser speech fallback triggered');
            try {
              window.speechSynthesis.cancel();
            } catch (e) {
              // Ignore errors
            }
            resolve();
          }
        }, 500);
      }

    } catch (error) {
      console.error('Error in browser speech:', error);
      resolve();
    }
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

export async function speakText(text: string): Promise<void> {
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis not supported');
    return;
  }

  try {
    // Try ElevenLabs first if available
    if (isElevenLabsAvailable()) {
      console.log('🎙️ Using ElevenLabs for text:', text);
      await speakWithElevenLabs(text);
      return;
    }

    // Fallback to browser speech synthesis
    console.log('🔊 Using browser speech synthesis for text:', text);
    await speakTextWithBrowserAPI(text);

  } catch (error) {
    console.error('Error in speakText:', error);
    // Try fallback if ElevenLabs failed
    if (isElevenLabsAvailable()) {
      console.log('🔄 ElevenLabs failed, trying browser speech fallback');
      try {
        await speakTextWithBrowserAPI(text);
      } catch (fallbackError) {
        console.error('Both speech methods failed:', fallbackError);
      }
    }
  }
}

// Browser API text speech implementation (fallback)
async function speakTextWithBrowserAPI(text: string): Promise<void> {
  return new Promise(async (resolve) => {
    try {
      // Initialize speech if not already done (important for mobile)
      if (!speechInitialized) {
        await initializeSpeech();
      }

      // Ensure voices are loaded
      const voices = await ensureVoicesLoaded();

      // Cancel any ongoing speech with retry for mobile
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        await new Promise(r => setTimeout(r, 100));
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure speech settings
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      // Enhanced voice selection for mobile compatibility
      let preferredVoice = null;
      
      if (voices.length > 0) {
        // Try to find Martha specifically first
        preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('martha') && voice.lang.includes('GB')
        );

        // If Flo not found, try other British women's voices
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.toLowerCase().includes('kate') ||      // UK voice on some systems
             voice.name.toLowerCase().includes('serena') ||    // UK voice on some systems  
             voice.name.toLowerCase().includes('fiona') ||     // Scottish/UK voice
             voice.name.toLowerCase().includes('moira') ||     // UK voice on some systems
             voice.name.toLowerCase().includes('tessa') ||     // UK voice on some systems
             voice.lang.includes('GB') ||                      // British English
             voice.lang.includes('UK'))                        // UK English
          );
        }

        // Fallback to generic female voices
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.toLowerCase().includes('female') || 
             voice.name.toLowerCase().includes('woman') ||
             voice.name.toLowerCase().includes('karen') ||
             voice.name.toLowerCase().includes('victoria') ||
             voice.name.toLowerCase().includes('samantha'))
          );
        }

        // Fallback to any English voice or first voice
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        }
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Enhanced error handling for mobile
      let resolved = false;
      
      utterance.onend = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      utterance.onerror = (event) => {
        console.error('Browser speech synthesis error:', event);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      // iOS-specific timeout (very short for iOS Chrome issues)
      const timeoutDuration = isIOSChrome() ? 800 : (isIOS() ? 2000 : 10000);
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('Browser speech text timeout, resolving');
          // Force cancel on iOS
          if (isIOS()) {
            try {
              window.speechSynthesis.cancel();
            } catch (e) {
              // Ignore errors
            }
          }
          resolve();
        }
      }, timeoutDuration);

      window.speechSynthesis.speak(utterance);
      
      // iOS Chrome fallback - if no events fire within 500ms, just resolve
      if (isIOSChrome()) {
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            console.warn('iOS Chrome browser speech text fallback triggered');
            try {
              window.speechSynthesis.cancel();
            } catch (e) {
              // Ignore errors
            }
            resolve();
          }
        }, 500);
      }

    } catch (error) {
      console.error('Error in browser speech text:', error);
      resolve();
    }
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