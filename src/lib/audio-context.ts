// iOS-compatible AudioContext management for TTS
import { logger } from './logger';

let audioContext: AudioContext | null = null;
let isAudioContextInitialized = false;

// Detect iOS
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Get or create AudioContext
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    // Use appropriate AudioContext constructor
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
    
    audioContext = new AudioContextClass();
    logger.debug('AudioContext created, state:', audioContext.state);
  }
  
  return audioContext;
}

// Initialize audio context with user interaction (required for iOS)
export async function initializeAudioContext(): Promise<void> {
  if (isAudioContextInitialized) {
    logger.debug('AudioContext already initialized');
    return;
  }

  try {
    const ctx = getAudioContext();
    
    // iOS requires resuming the context after user interaction
    if (ctx.state === 'suspended') {
      logger.debug('Resuming suspended AudioContext...');
      
      // Add timeout for resume operation
      await Promise.race([
        ctx.resume(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AudioContext resume timeout')), 2000)
        )
      ]);
      
      logger.debug('AudioContext resumed, state:', ctx.state);
    }
    
    // Create a silent buffer to "unlock" audio on iOS
    if (isIOS()) {
      logger.debug('iOS detected, creating unlock buffer...');
      
      try {
        // Create empty buffer
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        // Play silent sound
        if (source.start) {
          source.start(0);
        } else {
          (source as any).noteOn(0);
        }
        
        logger.debug('iOS audio unlock buffer played');
      } catch (bufferError) {
        logger.warn('Failed to play unlock buffer:', bufferError);
        // Continue anyway - some iOS versions might not need this
      }
    }
    
    isAudioContextInitialized = true;
    logger.info('AudioContext initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize AudioContext:', error);
    // Mark as initialized anyway to prevent retry loops
    isAudioContextInitialized = true;
    throw error;
  }
}

// Play audio using Web Audio API (more reliable on iOS)
export async function playAudioWithContext(audioUrl: string): Promise<void> {
  const ctx = getAudioContext();
  
  // Ensure context is running
  if (ctx.state === 'suspended') {
    logger.debug('AudioContext suspended, resuming...');
    await ctx.resume();
  }
  
  return new Promise((resolve, reject) => {
    // Fetch the audio data
    fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        logger.debug('Audio decoded, duration:', audioBuffer.duration);
        
        // Create source
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        // Create gain node for volume control
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Set playback rate (slightly slower for clarity)
        source.playbackRate.value = 0.9;
        
        // Handle completion
        source.onended = () => {
          logger.debug('Audio playback completed');
          resolve();
        };
        
        // Start playback
        if (source.start) {
          source.start(0);
        } else {
          (source as any).noteOn(0);
        }
        
        logger.debug('Audio playback started');
      })
      .catch(error => {
        logger.error('Error playing audio with context:', error);
        reject(error);
      });
  });
}

// Check if AudioContext is available and working
export function isAudioContextSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

// Get current AudioContext state
export function getAudioContextState(): AudioContextState | null {
  return audioContext?.state || null;
}