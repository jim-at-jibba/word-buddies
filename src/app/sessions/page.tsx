'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CatMascot from '@/components/CatMascot';
import SessionsTable from '@/components/SessionsTable';
import { StoredSession } from '@/lib/storage/types';
import { browserDB } from '@/lib/storage/browser-db';
import { logger } from '@/lib/logger';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await browserDB.getAllSessions();
        setSessions(allSessions);
      } catch (err) {
        logger.error('Error loading sessions:', err);
        setError('Failed to load session history');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

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
            Loading your session history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-cat-lg p-8 shadow-cat max-w-md">
          <CatMascot mood="encouraging" size="large" />
          <h2 className="font-kid-friendly text-2xl font-bold text-cat-dark mt-4 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="font-kid-friendly text-cat-gray mb-6">
            {error}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="cat-button w-full"
            >
              Try Again
            </button>
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

  const totalSessions = sessions.length;
  const totalWords = sessions.reduce((sum, session) => sum + session.wordsAttempted, 0);
  const totalCorrect = sessions.reduce((sum, session) => sum + session.correctWords, 0);
  const averageScore = totalSessions > 0 ? Math.round((totalCorrect / totalWords) * 100) || 0 : 0;

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
            📚 Session History
          </h1>
          <p className="font-kid-friendly text-cat-gray">
            Track your spelling progress over time
          </p>
        </motion.div>

        {/* Stats Summary */}
        {totalSessions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-cat-lg p-6 shadow-cat">
              <div className="text-center mb-6">
                <CatMascot mood="happy" size="medium" />
                <h2 className="font-kid-friendly text-xl font-bold text-cat-dark mt-4">
                  Your Progress Summary
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-cat-success/10 rounded-cat p-4 border border-cat-success/20">
                  <div className="text-2xl font-bold text-cat-success font-kid-friendly">
                    {totalSessions}
                  </div>
                  <div className="text-sm text-cat-gray font-kid-friendly">
                    Sessions
                  </div>
                </div>
                
                <div className="text-center bg-cat-orange/10 rounded-cat p-4 border border-cat-orange/20">
                  <div className="text-2xl font-bold text-cat-orange font-kid-friendly">
                    {totalWords}
                  </div>
                  <div className="text-sm text-cat-gray font-kid-friendly">
                    Words Practiced
                  </div>
                </div>
                
                <div className="text-center bg-cat-warning/10 rounded-cat p-4 border border-cat-warning/20">
                  <div className="text-2xl font-bold text-cat-warning font-kid-friendly">
                    {totalCorrect}
                  </div>
                  <div className="text-sm text-cat-gray font-kid-friendly">
                    Words Correct
                  </div>
                </div>
                
                <div className="text-center bg-cat-gray/10 rounded-cat p-4 border border-cat-gray/20">
                  <div className="text-2xl font-bold text-cat-gray font-kid-friendly">
                    {averageScore}%
                  </div>
                  <div className="text-sm text-cat-gray font-kid-friendly">
                    Average Score
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sessions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SessionsTable sessions={sessions} />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8 space-y-4"
        >
          <div className="space-x-4">
            <Link href="/practice">
              <motion.button
                className="cat-button text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>✏️</span>
                  <span>Practice Now</span>
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