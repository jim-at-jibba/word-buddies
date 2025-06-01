/**
 * Encryption Service
 * Handles encryption and decryption of sensitive data using Web Crypto API
 * Implements AES-256-GCM encryption as specified in the requirements
 * 
 * This service provides a secure way to encrypt and decrypt sensitive user data
 * before storing it in the browser's local storage or IndexedDB.
 */

/**
 * Check if code is running in browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Constants for encryption
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // AES-256
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATION_COUNT = 100000;

/**
 * Generate a cryptographic key from a password
 * @param password - The password to derive the key from
 * @param salt - Optional salt for key derivation
 * @returns An object containing the key and salt
 */
async function deriveKey(password: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  // Generate a random salt if not provided
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  // Convert password to a key using PBKDF2
  const passwordBuffer = new TextEncoder().encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATION_COUNT,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return { key, salt };
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - The data to encrypt
 * @param password - The password to use for encryption
 * @returns The encrypted data as a base64 string, with IV and salt embedded
 */
export async function encrypt(data: string, password: string): Promise<string> {
  try {
    // Generate a random initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Derive the key from the password
    const { key, salt } = await deriveKey(password);
    
    // Convert data to buffer
    const dataBuffer = new TextEncoder().encode(data);
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      dataBuffer
    );
    
    // Combine salt, IV, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - The encrypted data as a base64 string
 * @param password - The password used for encryption
 * @returns The decrypted data as a string
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
  try {
    // Convert from base64
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract salt, IV, and encrypted data
    const salt = encryptedBuffer.slice(0, SALT_LENGTH);
    const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const data = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH);
    
    // Derive the key from the password and salt
    const { key } = await deriveKey(password, salt);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      data
    );
    
    // Convert buffer to string
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data. Incorrect password or corrupted data.');
  }
}

/**
 * Generate a secure random password
 * @param length - The length of the password to generate
 * @returns A random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  
  // Return a fallback password during server-side rendering
  if (!isBrowser()) {
    return 'temp-password-' + new Date().getTime().toString().slice(-8);
  }
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(randomValues[i] % charset.length);
  }
  
  return result;
}

/**
 * Check if the Web Crypto API is available
 * @returns True if the Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return isBrowser() && 
         typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' && 
         typeof crypto.getRandomValues !== 'undefined';
}

/**
 * Checks if a string appears to be encrypted (base64 format)
 * @param value - The string to check
 * @returns True if the string appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  // Check if the value is a string and matches base64 pattern
  return typeof value === 'string' && 
         /^[A-Za-z0-9+/=]+$/.test(value) && 
         value.length > 24; // Minimum length for our encrypted format
}

/**
 * Safely encrypts a value, handling non-string values
 * @param value - The value to encrypt
 * @param password - The password to use for encryption
 * @returns The encrypted value or the original value if encryption fails
 */
export async function safeEncrypt(value: any, password: string): Promise<any> {
  if (value === null || value === undefined) {
    return value;
  }
  
  try {
    // Convert non-string values to JSON strings
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return await encrypt(stringValue, password);
  } catch (error) {
    console.error('Safe encryption error:', error);
    return value; // Return original value if encryption fails
  }
}

/**
 * Safely decrypts a value, handling non-encrypted values
 * @param value - The value to decrypt
 * @param password - The password to use for decryption
 * @returns The decrypted value or the original value if decryption fails
 */
export async function safeDecrypt(value: any, password: string): Promise<any> {
  if (value === null || value === undefined || !isEncrypted(value)) {
    return value;
  }
  
  try {
    const decrypted = await decrypt(value, password);
    
    // Try to parse as JSON if it looks like a JSON string
    if (typeof decrypted === 'string') {
      // Check if it's a JSON object or array
      if ((decrypted.startsWith('{') && decrypted.endsWith('}')) || 
          (decrypted.startsWith('[') && decrypted.endsWith(']'))) {
        try {
          return JSON.parse(decrypted);
        } catch {
          // If parsing fails, return as string
          return decrypted;
        }
      }
      
      // Handle primitive types that were stringified
      // Try to convert back to number if it looks like a number
      if (/^-?\d+(\.\d+)?$/.test(decrypted)) {
        const num = Number(decrypted);
        return isNaN(num) ? decrypted : num;
      }
      
      // Try to convert back to boolean if it's 'true' or 'false'
      if (decrypted === 'true') return true;
      if (decrypted === 'false') return false;
    }
    
    return decrypted;
  } catch (error) {
    console.warn('Safe decryption error:', error);
    return value; // Return original value if decryption fails
  }
}
