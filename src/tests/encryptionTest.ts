/**
 * Encryption Test
 * 
 * This file contains a simple test for the encryption service.
 * Run with: npm test
 */

// Let's create a simple browser-like environment for testing
// since the encryption service is designed to run in a browser environment
global.crypto = require('crypto').webcrypto;

// Import the encryption service
const encryptionService = require('../services/encryptionService');

async function testEncryption() {
  console.log('Testing encryption service...');
  
  // Test basic encryption/decryption
  const testString = 'This is a test string';
  const password = 'test-password-123';
  
  console.log(`Original: "${testString}"`);
  
  try {
    // Encrypt
    const encrypted = await encryptionService.encrypt(testString, password);
    console.log(`Encrypted: "${encrypted}"`);
    
    // Decrypt
    const decrypted = await encryptionService.decrypt(encrypted, password);
    console.log(`Decrypted: "${decrypted}"`);
    
    // Verify
    console.log(`Successful: ${testString === decrypted}`);
  } catch (error) {
    console.error('Basic encryption test failed:', error);
  }
  
  // Test safe encryption/decryption with different data types
  console.log('\nTesting safe encryption with different data types:');
  
  const testCases = [
    { type: 'string', value: 'Hello World' },
    { type: 'number', value: 42 },
    { type: 'boolean', value: true },
    { type: 'object', value: { name: 'John', age: 30 } },
    { type: 'array', value: [1, 2, 3, 4, 5] },
    { type: 'date', value: new Date() },
    { type: 'null', value: null },
    { type: 'undefined', value: undefined }
  ];
  
  for (const test of testCases) {
    try {
      console.log(`\nTesting ${test.type}: ${JSON.stringify(test.value)}`);
      
      // Safe encrypt
      const encrypted = await encryptionService.safeEncrypt(test.value, password);
      console.log(`Encrypted: ${encrypted}`);
      
      // Safe decrypt
      const decrypted = await encryptionService.safeDecrypt(encrypted, password);
      console.log(`Decrypted: ${JSON.stringify(decrypted)}`);
      
      // Verify (for objects we need to compare JSON strings)
      const original = test.value === null || test.value === undefined 
        ? test.value 
        : typeof test.value === 'object' 
          ? JSON.stringify(test.value) 
          : test.value;
          
      const result = decrypted === null || decrypted === undefined 
        ? decrypted 
        : typeof decrypted === 'object' 
          ? JSON.stringify(decrypted) 
          : decrypted;
          
      console.log(`Successful: ${original === result}`);
    } catch (error) {
      console.error(`Test for ${test.type} failed:`, error);
    }
  }
  
  // Test error handling
  console.log('\nTesting error handling:');
  
  try {
    // Try to decrypt with wrong password
    const encrypted = await encryptionService.encrypt('Secret message', 'correct-password');
    const decryptedWrongPassword = await encryptionService.decrypt(encrypted, 'wrong-password');
    console.log('Decryption with wrong password should have failed but succeeded:', decryptedWrongPassword);
  } catch (error: any) {
    console.log('Successfully caught error when using wrong password:', error.message);
  }
  
  // Test the isEncrypted function
  console.log('\nTesting isEncrypted function:');
  
  const testValues = [
    { value: 'plaintext', expected: false },
    { value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', expected: true },
    { value: await encryptionService.encrypt('test', 'password'), expected: true },
    { value: 123, expected: false },
    { value: null, expected: false }
  ];
  
  for (const test of testValues) {
    try {
      const result = typeof test.value === 'string' 
        ? encryptionService.isEncrypted(test.value) 
        : false;
      console.log(`Value: ${test.value}, isEncrypted: ${result}, Expected: ${test.expected}, Correct: ${result === test.expected}`);
    } catch (error) {
      console.error(`Test for isEncrypted failed:`, error);
    }
  }
  
  console.log('\nEncryption tests completed!');
}

// Run the tests
testEncryption().catch(console.error);
