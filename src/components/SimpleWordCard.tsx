'use client';

import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { speakWord } from '@/lib/speech';

interface SimpleWordCardProps {
  word: string;
  index: number;
}

const SimpleWordCard = memo(function SimpleWordCard({ word, index }: SimpleWordCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playWord = useCallback(async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      await speakWord(word);
    } catch (error) {
      console.error('Error playing word:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [word, isPlaying]);

  return (
    <div className="bg-cat-cream rounded-cat p-4 flex items-center justify-between">
      <span className="font-kid-friendly text-lg text-cat-dark font-bold">
        {index + 1}. {word}
      </span>
      <motion.button
        onClick={playWord}
        disabled={isPlaying}
        aria-label={`Play the word ${word}`}
        className={`bg-cat-orange text-white rounded-full w-10 h-10 flex items-center justify-center ${
          isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cat-orange/90'
        }`}
        whileHover={!isPlaying ? { scale: 1.1 } : {}}
        whileTap={!isPlaying ? { scale: 0.9 } : {}}
      >
        {isPlaying ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <span className="text-lg">🔊</span>
        )}
      </motion.button>
    </div>
  );
});

export default SimpleWordCard;
