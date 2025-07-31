'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';

interface IOSAudioInitProps {
  onInitialized: () => void;
}

// Detect iOS
function isIOS(): boolean {
  return typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function IOSAudioInit({ onInitialized }: IOSAudioInitProps) {
  const [needsInit, setNeedsInit] = useState(false);
  
  useEffect(() => {
    // Only show on iOS devices
    if (isIOS()) {
      logger.debug('iOS device detected, showing audio init prompt');
      setNeedsInit(true);
    } else {
      logger.debug('Non-iOS device, skipping audio init prompt');
      onInitialized();
    }
  }, [onInitialized]);
  
  const handleInitialize = () => {
    logger.debug('User tapped Enable Sound button');
    
    // Try to play a silent sound to unlock audio (but don't wait for it)
    try {
      // Method 1: Create an audio element
      const audio = new Audio();
      audio.volume = 0;
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=';
      audio.play().catch(() => {});
      
      // Method 2: Speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
      }
      
      // Method 3: AudioContext
      if (window.AudioContext || (window as any).webkitAudioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    } catch (error) {
      logger.debug('Audio unlock attempt error (expected):', error);
    }
    
    // Immediately proceed without waiting
    setNeedsInit(false);
    onInitialized();
  };
  
  if (!needsInit) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-cat shadow-lg p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">🔊</div>
            <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
              Enable Sound
            </h2>
            <p className="font-kid-friendly text-cat-gray mb-6">
              Tap the button below to enable sound for spelling practice
            </p>
            
            <button
              onClick={handleInitialize}
              className="cat-button px-8 py-3 text-lg"
            >
              Enable Sound
            </button>
            
            <p className="text-sm text-cat-gray mt-4 font-kid-friendly">
              This helps audio work better on iOS devices
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}