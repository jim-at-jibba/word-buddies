'use client';

import { useState, useEffect, Suspense, useCallback, lazy } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CatMascot from '@/components/CatMascot';
import { SessionResult } from '@/types';
import { speakEncouragement, initializeSpeech } from '@/lib/speech';
import { getSessionById } from '@/lib/client-spelling-logic';
import { logger } from '@/lib/logger';

// Lazy load the ResultsCard component
const ResultsCard = lazy(() => import('@/components/ResultsCard'));

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSpokenCelebration, setHasSpokenCelebration] = useState(false);

  const fetchSessionResults = useCallback(async () => {
    try {
      if (!sessionId) {
        router.push('/');
        return;
      }
      
      const sessionResult = await getSessionById(sessionId);
      
      if (sessionResult) {
        setSessionResult(sessionResult);
      } else {
        logger.error('Session not found');
        router.push('/');
      }
    } catch (error) {
      logger.error('Error fetching session results:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  const speakCelebration = useCallback(async () => {
    if (!sessionResult) return;
    
    try {
      // Initialize speech for mobile compatibility
      await initializeSpeech();
      
      let celebrationType: 'correct' | 'incorrect' | 'try-again';
      
      if (sessionResult.celebrationLevel === 'great') {
        celebrationType = 'correct';
      } else if (sessionResult.celebrationLevel === 'good') {
        celebrationType = 'correct';
      } else {
        celebrationType = 'try-again';
      }
      
      await speakEncouragement(celebrationType);
    } catch (error) {
      logger.error('Error speaking celebration:', error);
    }
  }, [sessionResult]);

  useEffect(() => {
    if (sessionId) {
      fetchSessionResults();
    } else {
      router.push('/');
    }
  }, [sessionId, router, fetchSessionResults]);

  useEffect(() => {
    if (sessionResult && !hasSpokenCelebration) {
      speakCelebration();
      setHasSpokenCelebration(true);
    }
  }, [sessionResult, hasSpokenCelebration, speakCelebration]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getCelebrationMessage = (level: 'great' | 'good' | 'keep-trying') => {
    switch (level) {
      case 'great':
        return {
          title: "🌟 Amazing Work!",
          message: "You&apos;re becoming a spelling superstar! Keep up the fantastic work!",
          mood: 'excited' as const
        };
      case 'good':
        return {
          title: "🎯 Well Done!",
          message: "Great progress! You&apos;re getting better with each practice session!",
          mood: 'happy' as const
        };
      case 'keep-trying':
        return {
          title: "💪 Keep Going!",
          message: "Every practice makes you stronger! You&apos;re on the right track!",
          mood: 'encouraging' as const
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-cat-orange border-t-transparent rounded-full mx-auto mt-4 mb-4"
          />
          <p className="font-kid-friendly text-cat-gray text-lg">
            Preparing your results...
          </p>
        </div>
      </div>
    );
  }

  if (!sessionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-cat-lg p-8 shadow-cat">
          <CatMascot mood="encouraging" size="large" />
          <h2 className="font-kid-friendly text-2xl font-bold text-cat-dark mt-4 mb-4">
            Oops! Session not found
          </h2>
          <p className="font-kid-friendly text-cat-gray mb-6">
            We couldn&apos;t find your practice session results.
          </p>
          <Link href="/">
            <button className="cat-button px-6 py-3">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const celebration = getCelebrationMessage(sessionResult.celebrationLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-kid-friendly font-bold text-cat-dark mb-2">
            🎉 Practice Complete!
          </h1>
          <p className="font-kid-friendly text-cat-gray">
            Here&apos;s how you did in this session
          </p>
        </motion.div>

        {/* Celebration Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center">
            <CatMascot mood={celebration.mood} size="large" />
            
            <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mt-6 mb-4">
              {celebration.title}
            </h2>
            
            <p className="font-kid-friendly text-cat-gray mb-6">
              {celebration.message}
            </p>

            {/* Score Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-cat-success/20 rounded-cat p-4">
                <div className="text-2xl font-bold text-cat-success font-kid-friendly">
                  {sessionResult.score}%
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Score
                </div>
              </div>
              
              <div className="bg-cat-orange/20 rounded-cat p-4">
                <div className="text-2xl font-bold text-cat-orange font-kid-friendly">
                  {sessionResult.correctWords}
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Correct
                </div>
              </div>
              
              <div className="bg-cat-warning/20 rounded-cat p-4">
                <div className="text-2xl font-bold text-cat-warning font-kid-friendly">
                  {sessionResult.totalWords}
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Total
                </div>
              </div>
              
              <div className="bg-cat-gray/20 rounded-cat p-4">
                <div className="text-2xl font-bold text-cat-gray font-kid-friendly">
                  {formatDuration(sessionResult.duration)}
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Time
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <h3 className="text-xl font-kid-friendly font-bold text-cat-dark text-center mb-6">
            📝 Detailed Results
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionResult.attempts.map((attempt, index) => (
              <Suspense 
                key={`${attempt.word}-${index}`}
                fallback={
                  <div className="p-4 rounded-cat border-2 border-cat-gray/20 bg-cat-gray/10 animate-pulse">
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 bg-cat-gray/20 rounded-full mx-auto"></div>
                      <div className="h-4 bg-cat-gray/20 rounded mx-auto w-16"></div>
                      <div className="h-3 bg-cat-gray/20 rounded mx-auto w-24"></div>
                    </div>
                  </div>
                }
              >
                <ResultsCard 
                  attempt={attempt} 
                  index={index} 
                />
              </Suspense>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/practice">
              <motion.button
                className="cat-button text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Practice Again</span>
                </span>
              </motion.button>
            </Link>
            
            <Link href="/sessions">
              <motion.button
                className="bg-white text-cat-success border-2 border-cat-success font-kid-friendly font-bold py-4 px-8 rounded-cat hover:bg-cat-success hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>📚</span>
                  <span>View All Sessions</span>
                </span>
              </motion.button>
            </Link>
            
            <Link href="/">
              <motion.button
                className="bg-white text-cat-orange border-2 border-cat-orange font-kid-friendly font-bold py-4 px-8 rounded-cat hover:bg-cat-orange hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>🏠</span>
                  <span>Go Home</span>
                </span>
              </motion.button>
            </Link>
          </div>
          
          <p className="font-kid-friendly text-cat-gray text-sm">
            Keep practicing to improve your spelling skills! 🌟
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <p className="font-kid-friendly text-cat-gray text-lg mt-4">
            Loading results...
          </p>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}