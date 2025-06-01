/**
 * Encryption Service Tests
 * 
 * Tests for the encryption service using Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the encryption service directly to avoid ESM issues
let encryptionService: any;

beforeEach(async () => {
  // Dynamically import the encryption service to avoid ESM issues
  try {
    // Reset the module between tests
    vi.resetModules();
    encryptionService = await import('../services/encryptionService');
  } catch (error) {
    console.error('Error importing encryption service:', error);
  }
});

describe('Encryption Service', () => {
  const testPassword = 'test-password-123';
  const testData = 'This is sensitive data';

  // Helper function to check if tests can run
  const canRunCryptoTests = () => {
    if (!encryptionService.isCryptoAvailable()) {
      console.warn('Web Crypto API not available, skipping encryption tests');
      return false;
    }
    return true;
  };

  describe('Basic Encryption/Decryption', () => {
    it('should encrypt and decrypt data correctly', async () => {
      if (!canRunCryptoTests()) return;

      const encrypted = await encryptionService.encrypt(testData, testPassword);
      
      // Encrypted data should be a base64 string
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(testData.length);
      
      const decrypted = await encryptionService.decrypt(encrypted, testPassword);
      expect(decrypted).toBe(testData);
    });
  });

  describe('Safe Encryption/Decryption', () => {
    it('should handle string values', async () => {
      if (!canRunCryptoTests()) return;

      const value = 'Hello World';
      const encrypted = await encryptionService.safeEncrypt(value, testPassword);
      const decrypted = await encryptionService.safeDecrypt(encrypted, testPassword);
      expect(decrypted).toBe(value);
    });

    it('should handle number values', async () => {
      if (!canRunCryptoTests()) return;

      const value = 42;
      const encrypted = await encryptionService.safeEncrypt(value, testPassword);
      const decrypted = await encryptionService.safeDecrypt(encrypted, testPassword);
      expect(decrypted).toBe(value);
    });

    it('should handle boolean values', async () => {
      if (!canRunCryptoTests()) return;

      const value = true;
      const encrypted = await encryptionService.safeEncrypt(value, testPassword);
      const decrypted = await encryptionService.safeDecrypt(encrypted, testPassword);
      expect(decrypted).toBe(value);
    });

    it('should handle object values', async () => {
      if (!canRunCryptoTests()) return;

      const value = { name: 'John', age: 30 };
      const encrypted = await encryptionService.safeEncrypt(value, testPassword);
      const decrypted = await encryptionService.safeDecrypt(encrypted, testPassword);
      expect(decrypted).toEqual(value);
    });

    it('should handle null values', async () => {
      if (!canRunCryptoTests()) return;

      const value = null;
      const encrypted = await encryptionService.safeEncrypt(value, testPassword);
      const decrypted = await encryptionService.safeDecrypt(encrypted, testPassword);
      expect(decrypted).toBe(value);
    });

    it('should handle undefined values', async () => {
      if (!canRunCryptoTests()) return;

      const value = undefined;
      const encrypted = await encryptionService.safeEncrypt(value, testPassword);
      const decrypted = await encryptionService.safeDecrypt(encrypted, testPassword);
      expect(decrypted).toBe(value);
    });
  });

  describe('Utility Functions', () => {
    it('should detect encrypted strings correctly', async () => {
      if (!canRunCryptoTests()) return;

      const plaintext = 'plaintext';
      const encrypted = await encryptionService.encrypt('test', testPassword);
      
      expect(encryptionService.isEncrypted(plaintext)).toBe(false);
      expect(encryptionService.isEncrypted(encrypted)).toBe(true);
    });

    it('should check for Web Crypto API availability', () => {
      // This test can always run
      const result = encryptionService.isCryptoAvailable();
      expect(typeof result).toBe('boolean');
    });

    it('should generate secure passwords', () => {
      if (!canRunCryptoTests()) return;

      const password = encryptionService.generateSecurePassword(16);
      expect(password.length).toBe(16);
      expect(typeof password).toBe('string');
    });
  });
});
