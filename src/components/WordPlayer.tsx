'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { speakWord, isSpeechSupported } from '@/lib/speech';
import CatMascot from './CatMascot';

interface WordPlayerProps {
  word: string;
  autoPlay?: boolean;
  onPlayComplete?: () => void;
  className?: string;
}

export default function WordPlayer({ 
  word, 
  autoPlay = false, 
  onPlayComplete,
  className = '' 
}: WordPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
  }, []);

  useEffect(() => {
    if (autoPlay && speechSupported && word && !hasPlayedOnce) {
      console.log('WordPlayer: Auto-playing word:', word);
      playWord();
      setHasPlayedOnce(true);
    }
  }, [word, autoPlay, speechSupported, hasPlayedOnce]);

  const playWord = async () => {
    if (!speechSupported || !word || isPlaying) return;

    setIsPlaying(true);
    try {
      await speakWord(word);
      onPlayComplete?.();
    } catch (error) {
      console.error('Error playing word:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  if (!speechSupported) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="bg-cat-warning/20 border-2 border-cat-warning rounded-cat p-4">
          <p className="text-cat-warning font-kid-friendly">
            🔊 Speech not supported in your browser
          </p>
          <p className="text-sm text-cat-gray mt-2">
            The word is: <span className="font-bold text-cat-dark">{word}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <CatMascot 
          mood={isPlaying ? 'excited' : 'thinking'} 
          size="large"
          onClick={playWord}
        />
        
        <motion.button
          onClick={playWord}
          disabled={isPlaying}
          aria-label={isPlaying ? 'Playing word' : `Play the word ${word}`}
          className={`cat-button text-lg px-8 py-4 ${
            isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-cat-hover'
          }`}
          whileHover={!isPlaying ? { scale: 1.05 } : {}}
          whileTap={!isPlaying ? { scale: 0.95 } : {}}
        >
          {isPlaying ? (
            <span className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Playing...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span>🔊</span>
              <span>Play Word</span>
            </span>
          )}
        </motion.button>

        <motion.button
          onClick={playWord}
          className="text-cat-orange hover:text-cat-orange/80 font-kid-friendly text-sm underline"
          whileHover={{ scale: 1.05 }}
          disabled={isPlaying}
        >
          🔄 Play Again
        </motion.button>
      </div>
      
      {/* Visual feedback for playing state */}
      {isPlaying && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="mt-4"
        >
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-6 bg-cat-orange rounded"
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}