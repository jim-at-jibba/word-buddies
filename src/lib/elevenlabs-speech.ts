// ElevenLabs Text-to-Speech service for reliable cross-platform audio
import { logger } from './logger';
import { retryElevenLabsCall, elevenLabsCircuitBreaker } from './retry-utils';
import { getUserSettings } from './storage';
import { decryptApiKey, isEncryptionSupported, clearApiKeyFromMemory, validateApiKeyFormat } from './encryption';

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  apiUrl: string;
}

// Audio cache for repeated words
const audioCache = new Map<string, string>(); // text -> blob URL

// Configuration - now uses user-provided API keys only
async function getElevenLabsConfig(): Promise<ElevenLabsConfig | null> {
  try {
    // Get user settings
    const settings = await getUserSettings();
    
    if (!settings.elevenLabsApiKey) {
      logger.debug('No user ElevenLabs API key configured - will use browser TTS fallback');
      return null;
    }

    // Check if encryption is supported
    if (!isEncryptionSupported()) {
      logger.warn('Encryption not supported in this browser - cannot decrypt API key');
      return null;
    }

    // Decrypt the user's API key
    let apiKey: string;
    try {
      apiKey = await decryptApiKey(settings.elevenLabsApiKey);
    } catch (error) {
      logger.error('Failed to decrypt user API key:', error);
      return null;
    }

    // Default voice and API URL (can be made configurable later)
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice - clear and child-friendly
    const apiUrl = 'https://api.elevenlabs.io/v1';

    const config = { apiKey, voiceId, apiUrl };
    
    // Clear the decrypted key from memory after a short delay
    setTimeout(() => clearApiKeyFromMemory(apiKey), 1000);
    
    return config;
  } catch (error) {
    logger.error('Error getting ElevenLabs configuration:', error);
    return null;
  }
}

// Check if ElevenLabs is available and configured
export async function isElevenLabsAvailable(): Promise<boolean> {
  const config = await getElevenLabsConfig();
  return config !== null;
}

// Generate speech audio using ElevenLabs API with retry logic
async function generateSpeechAudio(text: string): Promise<string> {
  const config = await getElevenLabsConfig();
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
      logger.debug('Audio loaded successfully');
    };
    
    audio.onended = () => {
      logger.debug('Audio playback completed');
      resolve();
    };
    
    audio.onerror = (error) => {
      logger.error('Audio playback error:', error);
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
  if (!(await isElevenLabsAvailable())) {
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

// Test if an API key is valid by making a simple request
export async function testApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  console.log('🔍 Testing API key...');
  
  // First do basic format validation
  if (!validateApiKeyFormat(apiKey)) {
    return {
      valid: false,
      error: 'Invalid API key format (should start with "sk_" followed by 40-60 characters)'
    };
  }
  
  try {
    const apiUrl = 'https://api.elevenlabs.io/v1';
    
    // Try making a simple request - ElevenLabs may block CORS so this might not work in browser
    console.log('📡 Making request to ElevenLabs API...');
    
    // Set up request with CORS handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(`${apiUrl}/user`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      },
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    console.log('📡 Response status:', response.status, response.statusText);

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ API key validation successful:', userData);
      return { valid: true };
    } else {
      console.log('❌ API key validation failed with status:', response.status);
      
      let errorMessage = 'Invalid API key';
      
      // Try to get more specific error info
      try {
        const errorText = await response.text();
        console.log('📄 Error response text:', errorText);
        
        if (errorText) {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' 
              ? errorData.detail 
              : errorData.detail.message || errorMessage;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      } catch {
        console.log('❌ Could not parse error response');
        // Use status-based messages
        if (response.status === 401) errorMessage = 'Invalid API key';
        else if (response.status === 403) errorMessage = 'API key access denied';
        else if (response.status === 429) errorMessage = 'Rate limit exceeded';
      }
      
      return { valid: false, error: errorMessage };
    }
  } catch (error) {
    console.error('💥 API key validation error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { valid: false, error: 'Request timed out - please try again' };
      } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        // CORS error - ElevenLabs likely blocks browser requests
        // In this case, we'll do a "soft validation" - format check only
        console.log('🚨 CORS error detected - falling back to format validation');
        return {
          valid: true, // Assume valid if format is correct
          error: undefined
        };
      }
    }
    
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}