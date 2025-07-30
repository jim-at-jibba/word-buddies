// Centralized logging utility for Word Buddies
// Reduces console noise in production while maintaining debug capabilities

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  // Development-only logs (removed in production)
  debug: isDev ? console.log : () => {},
  info: isDev ? console.info : () => {},
  trace: isDev ? console.trace : () => {},
  
  // Always show warnings and errors
  warn: console.warn,
  error: console.error,
  
  // Specific logging methods for common patterns
  tts: isDev ? (message: string, ...args: unknown[]) => console.log(`🎙️ ${message}`, ...args) : () => {},
  storage: isDev ? (message: string, ...args: unknown[]) => console.log(`💾 ${message}`, ...args) : () => {},
  ui: isDev ? (message: string, ...args: unknown[]) => console.log(`🎨 ${message}`, ...args) : () => {},
  api: isDev ? (message: string, ...args: unknown[]) => console.log(`🌐 ${message}`, ...args) : () => {},
};

// Performance timing utility for development
export const perfLogger = {
  start: (label: string) => isDev ? console.time(label) : undefined,
  end: (label: string) => isDev ? console.timeEnd(label) : undefined,
};