import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock IndexedDB for browser storage tests
const indexedDBMock = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock,
});

// Mock speech synthesis for TTS tests
const speechSynthesisMock = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(window, 'speechSynthesis', {
  value: speechSynthesisMock,
});

// Mock audio context for audio tests
class MockAudio {
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  volume = 1;
  playbackRate = 1;
  currentTime = 0;
  duration = 0;
  ended = false;
  error = null;
}

Object.defineProperty(window, 'Audio', {
  value: MockAudio,
});

// Mock URL.createObjectURL and revokeObjectURL for blob tests
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-blob-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
});