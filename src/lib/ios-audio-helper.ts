// Simplified iOS audio initialization helper
import { logger } from './logger';

let audioInitialized = false;

// Detect iOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Simple audio initialization for iOS
export async function initializeIOSAudio(): Promise<void> {
  if (audioInitialized) {
    logger.debug('Audio already initialized');
    return;
  }

  logger.debug('Initializing iOS audio...');
  
  try {
    // Method 1: Try AudioContext
    const win = window as Window & { webkitAudioContext?: typeof AudioContext };
    if (window.AudioContext || win.webkitAudioContext) {
      const AudioContextClass = window.AudioContext || win.webkitAudioContext;
      const ctx = new AudioContextClass();
      
      // Resume if suspended
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Play a silent buffer
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      
      logger.debug('AudioContext initialized');
    }
  } catch (error) {
    logger.warn('AudioContext initialization failed:', error);
  }

  try {
    // Method 2: Try Speech Synthesis
    if ('speechSynthesis' in window) {
      // Create and speak a silent utterance
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      utterance.rate = 1;
      
      // Use a very short timeout to prevent hanging
      const speakPromise = new Promise<void>((resolve) => {
        let resolved = false;
        
        const resolveOnce = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };
        
        utterance.onend = resolveOnce;
        utterance.onerror = resolveOnce;
        
        // Timeout after 1 second
        setTimeout(resolveOnce, 1000);
        
        window.speechSynthesis.speak(utterance);
      });
      
      await speakPromise;
      logger.debug('Speech synthesis initialized');
    }
  } catch (error) {
    logger.warn('Speech synthesis initialization failed:', error);
  }

  try {
    // Method 3: Try HTML5 Audio
    const audio = new Audio();
    audio.volume = 0;
    audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=';
    
    const playPromise = audio.play();
    if (playPromise) {
      await playPromise.catch(() => {});
    }
    
    logger.debug('HTML5 Audio initialized');
  } catch (error) {
    logger.warn('HTML5 Audio initialization failed:', error);
  }

  audioInitialized = true;
  logger.info('iOS audio initialization complete');
}