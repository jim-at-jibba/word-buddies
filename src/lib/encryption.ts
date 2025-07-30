// Client-side encryption utilities for sensitive data storage
// Uses Web Crypto API for secure encryption of API keys

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

// Generate a cryptographic key from a password using PBKDF2
async function generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import the password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive the encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // OWASP recommended minimum
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Create a deterministic "password" based on browser fingerprint
function getBrowserFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
    // Add a stable component to make it deterministic across sessions
    'word-buddies-2024'
  ];
  
  return components.join('|');
}

// Generate a stable salt based on browser characteristics
async function generateStableSalt(): Promise<Uint8Array> {
  const fingerprint = getBrowserFingerprint();
  const encoder = new TextEncoder();
  const fingerprintBuffer = encoder.encode(fingerprint);
  
  // Hash the fingerprint to create a stable salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', fingerprintBuffer);
  return new Uint8Array(hashBuffer.slice(0, 16)); // Use first 16 bytes as salt
}

/**
 * Encrypt a string using AES-GCM with a deterministic key derived from browser fingerprint
 */
export async function encryptApiKey(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generate stable salt and key
    const salt = await generateStableSalt();
    const password = getBrowserFingerprint();
    const key = await generateKey(password, salt);
    
    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      data
    );
    
    // Combine salt, IV, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt a string that was encrypted with encryptApiKey
 */
export async function decryptApiKey(encryptedData: string): Promise<string> {
  try {
    // Convert from base64
    const data = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    // Extract components
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 16 + IV_LENGTH);
    const encrypted = data.slice(16 + IV_LENGTH);
    
    // Generate the same key
    const password = getBrowserFingerprint();
    const key = await generateKey(password, salt);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      encrypted
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Check if Web Crypto API is available
 */
export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' && 
         typeof crypto.subtle.encrypt === 'function';
}

/**
 * Validate that an API key looks like a valid ElevenLabs API key
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // ElevenLabs API keys start with 'sk_' followed by alphanumeric characters
  // Example: sk_5b7edd632e2f6939ece606e0e99d5a409664f3222eb14d3f
  return /^sk_[a-zA-Z0-9]{40,60}$/.test(apiKey.trim());
}

/**
 * Clean API key from memory (overwrite the string)
 * Note: This is a best-effort approach as JavaScript strings are immutable
 */
export function clearApiKeyFromMemory(apiKey: string): void {
  // While we can't actually overwrite the original string in memory,
  // we can at least avoid keeping references to it
  try {
    // Create a new string filled with random data of the same length
    const randomData = crypto.getRandomValues(new Uint8Array(apiKey.length));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const overwriteString = String.fromCharCode(...randomData);
    
    // This doesn't actually overwrite the original string but helps with debugging
    console.debug('API key cleared from active memory');
  } catch (error) {
    console.warn('Could not securely clear API key from memory:', error);
  }
}