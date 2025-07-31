'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SpellingAttempt } from '@/types';
import SpellingComparison from './SpellingComparison';
import { speakWithElevenLabs } from '@/lib/elevenlabs-speech';
import { speakWord } from '@/lib/speech';
import { logger } from '@/lib/logger';

interface SessionDetailCardProps {
  attempt: SpellingAttempt;
  index: number;
  showComparison?: boolean;
}

export default function SessionDetailCard({ 
  attempt, 
  index, 
  showComparison = false 
}: SessionDetailCardProps) {
  const [showingComparison, setShowingComparison] = useState(showComparison);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayWord = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      // Try ElevenLabs first, fallback to browser TTS
      try {
        await speakWithElevenLabs(attempt.word);
      } catch (error) {
        logger.warn('ElevenLabs TTS failed, using browser TTS:', error);
        await speakWord(attempt.word);
      }
    } catch (error) {
      logger.error('Failed to play word:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const getStatusIcon = () => {
    if (attempt.isCorrect) {
      return '✅';
    } else if (attempt.attempts > 1) {
      return '🔄';
    } else {
      return '❌';
    }
  };

  const getStatusColor = () => {
    if (attempt.isCorrect) {
      return 'border-cat-success bg-cat-success/10';
    } else if (attempt.attempts > 1) {
      return 'border-cat-warning bg-cat-warning/10';
    } else {
      return 'border-cat-error bg-cat-error/10';
    }
  };

  const getStatusText = () => {
    if (attempt.isCorrect) {
      return attempt.attempts === 1 ? 'Perfect!' : `Correct (${attempt.attempts} tries)`;
    } else {
      return `Incorrect (${attempt.attempts} tries)`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`rounded-cat-lg border-2 ${getStatusColor()} p-4 space-y-3`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <h3 className="font-kid-friendly font-bold text-cat-dark text-lg">
              {attempt.word}
            </h3>
            <p className="font-kid-friendly text-sm text-cat-gray">
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <button
          onClick={handlePlayWord}
          disabled={isPlaying}
          className="p-2 rounded-cat bg-cat-orange/20 hover:bg-cat-orange/30 transition-all duration-200 disabled:opacity-50"
          title="Listen to pronunciation"
        >
          <span className={`text-xl ${isPlaying ? 'animate-pulse' : ''}`}>
            🔊
          </span>
        </button>
      </div>

      {/* User's spelling if incorrect */}
      {!attempt.isCorrect && (
        <div className="bg-white rounded-cat p-3 border border-cat-gray/20">
          <div className="text-sm font-kid-friendly text-cat-gray mb-1">
            Your spelling:
          </div>
          <div className="font-kid-friendly text-lg text-cat-dark font-semibold">
            {attempt.userSpelling}
          </div>
        </div>
      )}

      {/* Spelling comparison toggle */}
      {!attempt.isCorrect && (
        <div className="space-y-3">
          <button
            onClick={() => setShowingComparison(!showingComparison)}
            className="text-sm font-kid-friendly text-cat-orange hover:text-cat-orange-dark font-semibold flex items-center space-x-2"
          >
            <span>{showingComparison ? '📖' : '🔍'}</span>
            <span>
              {showingComparison ? 'Hide comparison' : 'Show spelling mistakes'}
            </span>
          </button>

          {showingComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SpellingComparison
                correctWord={attempt.word}
                userSpelling={attempt.userSpelling}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Correct spelling celebration */}
      {attempt.isCorrect && attempt.attempts === 1 && (
        <div className="bg-cat-success/10 rounded-cat p-3 border border-cat-success/20">
          <p className="font-kid-friendly text-cat-success font-semibold text-center">
            🌟 Perfect spelling on first try! 🌟
          </p>
        </div>
      )}
    </motion.div>
  );
}