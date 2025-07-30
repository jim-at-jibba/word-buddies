'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import { SpellingAttempt } from '@/types';

interface ResultsCardProps {
  attempt: SpellingAttempt;
  index: number;
}

const ResultsCard = memo(function ResultsCard({ attempt, index }: ResultsCardProps) {
  const { word, userSpelling, isCorrect } = attempt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className={`p-4 rounded-cat border-2 transition-all duration-200 ${
        isCorrect 
          ? 'bg-cat-success/20 border-cat-success hover:bg-cat-success/30' 
          : 'bg-cat-error/20 border-cat-error hover:bg-cat-error/30'
      }`}
    >
      <div className="text-center space-y-2">
        {/* Correct/Incorrect Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="text-3xl"
        >
          {isCorrect ? '✅' : '❌'}
        </motion.div>

        {/* Word Display */}
        <div className="space-y-1">
          <p className="font-kid-friendly text-lg font-bold text-cat-dark">
            Word: <span className="text-cat-orange">{word}</span>
          </p>
          
          <p className="font-kid-friendly text-md">
            You typed: 
            <span className={`ml-2 font-bold ${
              isCorrect ? 'text-cat-success' : 'text-cat-error'
            }`}>
              {userSpelling}
            </span>
          </p>
        </div>

        {/* Feedback Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          className={`text-sm font-kid-friendly p-2 rounded-lg ${
            isCorrect 
              ? 'bg-cat-success/10 text-cat-success' 
              : 'bg-cat-error/10 text-cat-error'
          }`}
        >
          {isCorrect ? (
            <span className="flex items-center justify-center space-x-1">
              <span>🎉</span>
              <span>Perfect!</span>
            </span>
          ) : (
            <div className="space-y-1">
              <p className="flex items-center justify-center space-x-1">
                <span>💪</span>
                <span>Good try!</span>
              </p>
              {word !== userSpelling && (
                <p className="text-xs">
                  Correct spelling: <span className="font-bold">{word}</span>
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
});

export default ResultsCard;