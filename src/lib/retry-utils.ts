import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    // Don't retry on client-side errors (4xx), but retry on server errors (5xx) and network issues
    if (error.message.includes('4')) {
      return false; // Client errors like 401, 403, 404 shouldn't be retried
    }
    return true; // Retry network errors, timeouts, and server errors
  },
  onRetry: (attempt: number, error: Error) => {
    logger.warn(`Retry attempt ${attempt}:`, error.message);
  }
};

/**
 * Utility function to retry async operations with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry this error
      if (config.shouldRetry && !config.shouldRetry(lastError)) {
        logger.debug('Error not retryable:', lastError.message);
        throw lastError;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === config.maxAttempts) {
        logger.error(`All ${config.maxAttempts} retry attempts failed:`, lastError.message);
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      // Call retry callback
      config.onRetry?.(attempt, lastError);
      
      logger.debug(`Retrying in ${Math.round(jitteredDelay)}ms (attempt ${attempt}/${config.maxAttempts})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError!;
}

/**
 * Specialized retry function for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return retryWithBackoff(apiCall, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    shouldRetry: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      
      // Don't retry authentication or authorization errors
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        return false;
      }
      
      // Don't retry bad request errors
      if (errorMessage.includes('400')) {
        return false;
      }
      
      // Retry on network errors, timeouts, and server errors
      if (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('503') ||
        errorMessage.includes('502') ||
        errorMessage.includes('500') ||
        errorMessage.includes('429') || // Rate limiting
        errorMessage.includes('fetch')
      ) {
        return true;
      }
      
      // Default to retrying
      return true;
    },
    onRetry: (attempt: number, error: Error) => {
      logger.warn(`API call retry attempt ${attempt}:`, error.message);
    },
    ...options
  });
}

/**
 * Specialized retry function for ElevenLabs API calls
 */
export async function retryElevenLabsCall<T>(
  apiCall: () => Promise<T>,
  context: string = 'ElevenLabs API'
): Promise<T> {
  return retryApiCall(apiCall, {
    maxAttempts: 2, // Fewer retries for paid API
    initialDelay: 2000,
    maxDelay: 5000,
    shouldRetry: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      
      // Don't retry on authentication issues
      if (errorMessage.includes('401') || errorMessage.includes('invalid api key')) {
        logger.error('ElevenLabs authentication error - check API key');
        return false;
      }
      
      // Don't retry on quota exceeded
      if (errorMessage.includes('quota') || errorMessage.includes('402')) {
        logger.error('ElevenLabs quota exceeded');
        return false;
      }
      
      // Retry on rate limiting and server errors
      if (errorMessage.includes('429') || errorMessage.includes('5')) {
        return true;
      }
      
      // Retry on network issues
      return errorMessage.includes('network') || errorMessage.includes('fetch');
    },
    onRetry: (attempt: number, error: Error) => {
      logger.warn(`${context} retry attempt ${attempt}:`, error.message);
    }
  });
}

/**
 * Circuit breaker pattern for API calls
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private maxFailures: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'half-open';
        logger.debug('Circuit breaker moving to half-open state');
      } else {
        throw new Error('Circuit breaker is open - service temporarily unavailable');
      }
    }
    
    try {
      const result = await operation();
      
      if (this.state === 'half-open') {
        this.reset();
        logger.info('Circuit breaker reset to closed state');
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.maxFailures) {
      this.state = 'open';
      logger.warn(`Circuit breaker opened after ${this.failures} failures`);
    }
  }
  
  private reset() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Global circuit breaker for ElevenLabs API
export const elevenLabsCircuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s reset