'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isElevenLabsAvailable } from '@/lib/elevenlabs-speech';

interface TTSStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export default function TTSStatusIndicator({ 
  className = '', 
  showLabel = true 
}: TTSStatusIndicatorProps) {
  const [ttsService, setTtsService] = useState<'elevenlabs' | 'browser' | 'checking'>('checking');

  useEffect(() => {
    const checkTTSService = async () => {
      try {
        const elevenLabsAvailable = await isElevenLabsAvailable();
        setTtsService(elevenLabsAvailable ? 'elevenlabs' : 'browser');
      } catch (error) {
        console.error('Error checking TTS service:', error);
        setTtsService('browser');
      }
    };

    checkTTSService();
  }, []);

  if (ttsService === 'checking') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-cat-gray rounded-full animate-pulse" />
        {showLabel && (
          <span className="font-kid-friendly text-cat-gray text-xs">
            Checking...
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center space-x-2 ${className}`}
    >
      <div 
        className={`w-2 h-2 rounded-full ${
          ttsService === 'elevenlabs' ? 'bg-cat-success' : 'bg-cat-warning'
        }`}
      />
      {showLabel && (
        <span className={`font-kid-friendly text-xs ${
          ttsService === 'elevenlabs' ? 'text-cat-success' : 'text-cat-warning'
        }`}>
          {ttsService === 'elevenlabs' ? 'ElevenLabs Active' : 'Browser TTS Active'}
        </span>
      )}
    </motion.div>
  );
}