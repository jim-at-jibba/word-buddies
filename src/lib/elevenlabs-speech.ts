// ElevenLabs Text-to-Speech service for reliable cross-platform audio
import { logger } from './logger';
import { retryElevenLabsCall, elevenLabsCircuitBreaker } from './retry-utils';

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

// Generate speech audio using ElevenLabs API with retry logic
async function generateSpeechAudio(text: string): Promise<string> {
  const config = getElevenLabsConfig();
  if (!config) {
    throw new Error('ElevenLabs not configured');
  }

  return elevenLabsCircuitBreaker.execute(async () => {
    return retryElevenLabsCall(async () => {
      logger.debug(`Making ElevenLabs API call for: "${text}"`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
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
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
          
          // Try to get more specific error info
          try {
            const errorData = await response.json();
            if (errorData.detail) {
              errorMessage += ` - ${errorData.detail}`;
            }
          } catch {
            // Ignore JSON parsing errors
          }
          
          throw new Error(errorMessage);
        }

        const audioBlob = await response.blob();
        
        // Validate that we received audio data
        if (audioBlob.size === 0) {
          throw new Error('Received empty audio blob from ElevenLabs');
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        logger.debug(`Successfully generated audio for: "${text}" (${audioBlob.size} bytes)`);
        
        return audioUrl;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('ElevenLabs API request timeout');
          }
          throw error;
        }
        
        throw new Error('Unknown error in ElevenLabs API call');
      }
    }, `ElevenLabs speech generation for "${text}"`);
  });
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

// Preload common words to improve performance with retry logic
export async function preloadCommonWords(words: string[]): Promise<void> {
  if (!isElevenLabsAvailable()) {
    logger.warn('ElevenLabs not available for preloading');
    return;
  }

  logger.info('🔄 Preloading common words with ElevenLabs...');
  
  // Preload in smaller batches to be more API-friendly
  const batchSize = 3;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
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
            
            logger.debug('✅ Preloaded audio for:', word);
            return word;
          } catch (error) {
            logger.warn('Failed to preload word:', word, error);
            throw error;
          }
        } else {
          logger.debug('⏭️ Skipping cached word:', word);
          return word;
        }
      })
    );
    
    // Count results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else {
        errorCount++;
        logger.error(`Failed to preload "${batch[index]}":`, result.reason);
      }
    });
    
    // Longer delay between batches to respect API rate limits
    if (i + batchSize < words.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  logger.info(`🎉 Finished preloading: ${successCount} successful, ${errorCount} failed`);
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