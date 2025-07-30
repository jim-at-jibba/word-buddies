// ElevenLabs Text-to-Speech service for reliable cross-platform audio
import { logger } from './logger';

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  apiUrl: string;
}

// Audio cache for repeated words
const audioCache = new Map<string, string>(); // text -> blob URL

// Configuration
function getElevenLabsConfig(): ElevenLabsConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
  const apiUrl = process.env.NEXT_PUBLIC_ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1';

  if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
    logger.warn('ElevenLabs API key not configured');
    return null;
  }

  return { apiKey, voiceId, apiUrl };
}

// Check if ElevenLabs is available and configured
export function isElevenLabsAvailable(): boolean {
  return getElevenLabsConfig() !== null;
}

// Generate speech audio using ElevenLabs API
async function generateSpeechAudio(text: string): Promise<string> {
  const config = getElevenLabsConfig();
  if (!config) {
    throw new Error('ElevenLabs not configured');
  }

  const response = await fetch(`${config.apiUrl}/text-to-speech/${config.voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': config.apiKey
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  
  return audioUrl;
}

// Play audio from URL
function playAudioFromUrl(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    // Configure audio for children's content
    audio.volume = 1.0;
    audio.playbackRate = 0.9; // Slightly slower for clarity
    
    audio.onloadeddata = () => {
      console.log('Audio loaded successfully');
    };
    
    audio.onended = () => {
      console.log('Audio playback completed');
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      reject(new Error('Audio playback failed'));
    };
    
    // Start playback
    audio.play().catch(reject);
  });
}

// Main speech function using ElevenLabs
export async function speakWithElevenLabs(text: string): Promise<void> {
  try {
    logger.tts('Speaking with ElevenLabs:', text);
    
    // Check cache first
    let audioUrl = audioCache.get(text);
    
    if (!audioUrl) {
      logger.debug('Generating new audio for:', text);
      audioUrl = await generateSpeechAudio(text);
      
      // Cache the audio URL
      audioCache.set(text, audioUrl);
      
      // Clean up cache after 10 minutes to prevent memory leaks
      setTimeout(() => {
        const cachedUrl = audioCache.get(text);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
          audioCache.delete(text);
        }
      }, 10 * 60 * 1000);
    } else {
      logger.debug('Using cached audio for:', text);
    }
    
    // Play the audio
    await playAudioFromUrl(audioUrl);
    logger.debug('ElevenLabs speech completed for:', text);
    
  } catch (error) {
    logger.error('ElevenLabs speech error:', error);
    throw error;
  }
}

// Preload common words to improve performance
export async function preloadCommonWords(words: string[]): Promise<void> {
  if (!isElevenLabsAvailable()) {
    console.warn('ElevenLabs not available for preloading');
    return;
  }

  console.log('🔄 Preloading common words with ElevenLabs...');
  
  // Preload in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async (word) => {
        if (!audioCache.has(word)) {
          try {
            const audioUrl = await generateSpeechAudio(word);
            audioCache.set(word, audioUrl);
            
            // Clean up cache after 10 minutes
            setTimeout(() => {
              const cachedUrl = audioCache.get(word);
              if (cachedUrl) {
                URL.revokeObjectURL(cachedUrl);
                audioCache.delete(word);
              }
            }, 10 * 60 * 1000);
            
            console.log('✅ Preloaded audio for:', word);
          } catch (error) {
            console.warn('Failed to preload word:', word, error);
          }
        }
      })
    );
    
    // Small delay between batches
    if (i + batchSize < words.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('🎉 Finished preloading common words');
}

// Clear audio cache (useful for memory management)
export function clearAudioCache(): void {
  console.log('🧹 Clearing audio cache');
  
  audioCache.forEach((audioUrl) => {
    URL.revokeObjectURL(audioUrl);
  });
  
  audioCache.clear();
}

// Get cache statistics
export function getAudioCacheStats(): { size: number; words: string[] } {
  return {
    size: audioCache.size,
    words: Array.from(audioCache.keys())
  };
}