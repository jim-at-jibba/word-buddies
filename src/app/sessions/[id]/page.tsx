'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import CatMascot from '@/components/CatMascot';
import SessionDetailCard from '@/components/SessionDetailCard';
import { StoredSession, StoredWordAttempt } from '@/lib/storage/types';
import { browserDB } from '@/lib/storage/browser-db';
import { formatDateTime, formatDuration } from '@/lib/session-utils';
import { logger } from '@/lib/logger';

function SessionDetailContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<StoredSession | null>(null);
  const [wordAttempts, setWordAttempts] = useState<StoredWordAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        if (!sessionId) {
          router.push('/sessions');
          return;
        }

        // Load session and word attempts in parallel
        const [sessionData, attemptsData] = await Promise.all([
          browserDB.getSessionById(sessionId),
          browserDB.getWordAttemptsBySession(sessionId)
        ]);

        if (sessionData) {
          setSession(sessionData);
          setWordAttempts(attemptsData);
        } else {
          setError('Session not found');
        }
      } catch (err) {
        logger.error('Error loading session data:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId, router]);

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
            Loading session details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-cat-lg p-8 shadow-cat max-w-md">
          <CatMascot mood="encouraging" size="large" />
          <h2 className="font-kid-friendly text-2xl font-bold text-cat-dark mt-4 mb-4">
            {error || 'Session not found'}
          </h2>
          <p className="font-kid-friendly text-cat-gray mb-6">
            We couldn&apos;t find the details for this practice session.
          </p>
          <div className="space-y-4">
            <Link href="/sessions">
              <button className="cat-button w-full">
                Back to Sessions
              </button>
            </Link>
            <Link href="/">
              <button className="w-full bg-white text-cat-orange border-2 border-cat-orange font-kid-friendly font-bold py-3 px-6 rounded-cat hover:bg-cat-orange hover:text-white transition-all duration-200">
                Go Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Convert StoredWordAttempt to SpellingAttempt format for SessionDetailCard
  const spellingAttempts = wordAttempts.map(attempt => ({
    word: attempt.word,
    userSpelling: attempt.userSpelling,
    isCorrect: attempt.isCorrect,
    attempts: attempt.attempts
  }));

  const getCelebrationMessage = (score: number) => {
    if (score >= 80) {
      return {
        title: "🌟 Amazing Work!",
        message: "You're becoming a spelling superstar!",
        mood: 'excited' as const
      };
    } else if (score >= 60) {
      return {
        title: "🎯 Well Done!",
        message: "Great progress with your spelling!",
        mood: 'happy' as const
      };
    } else {
      return {
        title: "💪 Keep Going!",
        message: "Every practice makes you stronger!",
        mood: 'encouraging' as const
      };
    }
  };

  const celebration = getCelebrationMessage(session.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <nav className="flex items-center space-x-2 text-sm font-kid-friendly">
            <Link href="/" className="text-cat-orange hover:text-cat-orange-dark">
              Home
            </Link>
            <span className="text-cat-gray">→</span>
            <Link href="/sessions" className="text-cat-orange hover:text-cat-orange-dark">
              Sessions
            </Link>
            <span className="text-cat-gray">→</span>
            <span className="text-cat-gray">
              {formatDateTime(session.date).split(', ')[0]}
            </span>
          </nav>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-kid-friendly font-bold text-cat-dark mb-2">
            📝 Session Details
          </h1>
          <p className="font-kid-friendly text-cat-gray">
            {formatDateTime(session.date)}
          </p>
        </motion.div>

        {/* Session Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="bg-white rounded-cat-lg p-8 shadow-cat">
            <div className="text-center mb-6">
              <CatMascot mood={celebration.mood} size="large" />
              
              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mt-6 mb-2">
                {celebration.title}
              </h2>
              
              <p className="font-kid-friendly text-cat-gray mb-6">
                {celebration.message}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-cat-success/20 rounded-cat p-4 text-center">
                <div className="text-2xl font-bold text-cat-success font-kid-friendly">
                  {session.score}%
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Score
                </div>
              </div>
              
              <div className="bg-cat-orange/20 rounded-cat p-4 text-center">
                <div className="text-2xl font-bold text-cat-orange font-kid-friendly">
                  {session.correctWords}
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Correct
                </div>
              </div>
              
              <div className="bg-cat-warning/20 rounded-cat p-4 text-center">
                <div className="text-2xl font-bold text-cat-warning font-kid-friendly">
                  {session.wordsAttempted}
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Total Words
                </div>
              </div>
              
              <div className="bg-cat-gray/20 rounded-cat p-4 text-center">
                <div className="text-2xl font-bold text-cat-gray font-kid-friendly">
                  {formatDuration(session.duration)}
                </div>
                <div className="text-sm text-cat-gray font-kid-friendly">
                  Duration
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Word Attempts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-6xl mx-auto mb-8"
        >
          <h3 className="text-xl font-kid-friendly font-bold text-cat-dark text-center mb-6">
            📚 Words You Practiced
          </h3>
          
          {spellingAttempts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spellingAttempts.map((attempt, index) => (
                <SessionDetailCard 
                  key={`${attempt.word}-${index}`}
                  attempt={attempt} 
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤔</div>
              <p className="font-kid-friendly text-cat-gray">
                No word attempts found for this session.
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="space-x-4">
            <Link href="/sessions">
              <motion.button
                className="cat-button text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>📚</span>
                  <span>All Sessions</span>
                </span>
              </motion.button>
            </Link>
            
            <Link href="/practice">
              <motion.button
                className="bg-white text-cat-orange border-2 border-cat-orange font-kid-friendly font-bold py-4 px-8 rounded-cat hover:bg-cat-orange hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>✏️</span>
                  <span>Practice Again</span>
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

export default function SessionDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <p className="font-kid-friendly text-cat-gray text-lg mt-4">
            Loading session...
          </p>
        </div>
      </div>
    }>
      <SessionDetailContent />
    </Suspense>
  );
}