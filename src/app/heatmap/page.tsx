'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CatMascot from '@/components/CatMascot';
import { getWordHeatmapData, WordHeatmapData } from '@/lib/client-quest-logic';
import { logger } from '@/lib/logger';

type FilterStatus = 'all' | 'mastered' | 'practicing' | 'needs-work' | 'not-started';

function HeatmapContent() {
  const [heatmapData, setHeatmapData] = useState<WordHeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    loadHeatmapData();
  }, []);

  const loadHeatmapData = async () => {
    try {
      const data = await getWordHeatmapData();
      setHeatmapData(data);
    } catch (error) {
      logger.error('Error loading heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = heatmapData.filter(word => {
    if (filter === 'all') return true;
    return word.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-cat-success text-white';
      case 'practicing': return 'bg-yellow-500 text-white';
      case 'needs-work': return 'bg-red-500 text-white';
      case 'not-started': return 'bg-cat-gray text-white';
      default: return 'bg-cat-gray text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return '✅';
      case 'practicing': return '🟡';
      case 'needs-work': return '🔴';
      case 'not-started': return '⚪';
      default: return '⚪';
    }
  };



  const getStats = () => {
    const mastered = heatmapData.filter(w => w.status === 'mastered').length;
    const practicing = heatmapData.filter(w => w.status === 'practicing').length;
    const needsWork = heatmapData.filter(w => w.status === 'needs-work').length;
    const notStarted = heatmapData.filter(w => w.status === 'not-started').length;

    return { mastered, practicing, needsWork, notStarted };
  };

  const stats = getStats();

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
            Loading your heatmap...
          </p>
        </div>
      </div>
    );
  }

  if (heatmapData.length === 0 || heatmapData.every(w => w.attempts === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
        <div className="container mx-auto px-4 py-8">
          <motion.header
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/" className="inline-block mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-cat-gray hover:text-cat-dark transition-colors font-kid-friendly"
              >
                <span>←</span>
                <span>Back to Home</span>
              </motion.button>
            </Link>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-kid-friendly font-bold text-cat-dark mb-4">
                🔥 Word Heatmap
              </h1>
            </div>
          </motion.header>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-cat-lg p-8 shadow-cat text-center"
            >
              <CatMascot mood="encouraging" size="large" />
              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4 mt-6">
                Start Practicing!
              </h2>
              <p className="font-kid-friendly text-cat-gray mb-8">
                Start practicing to see your word mastery heatmap! The heatmap shows which words you&apos;ve mastered and which need more practice.
              </p>
              <Link href="/practice">
                <motion.button
                  className="cat-button text-lg px-6 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✏️ Start Practice
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      <div className="container mx-auto px-4 py-8">
        
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/" className="inline-block mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-cat-gray hover:text-cat-dark transition-colors font-kid-friendly"
            >
              <span>←</span>
              <span>Back to Home</span>
            </motion.button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-kid-friendly font-bold text-cat-dark mb-4">
              🔥 Word Heatmap
            </h1>
            <p className="text-lg md:text-xl font-kid-friendly text-cat-gray max-w-2xl mx-auto">
              Track your progress with color-coded words based on your success rate
            </p>
          </div>
        </motion.header>

        <div className="max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-cat-lg p-6 shadow-cat mb-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-cat-success">
                  {stats.mastered}
                </div>
                <div className="text-sm font-kid-friendly text-cat-gray">
                  ✅ Mastered
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-yellow-600">
                  {stats.practicing}
                </div>
                <div className="text-sm font-kid-friendly text-cat-gray">
                  🟡 Practicing
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-red-600">
                  {stats.needsWork}
                </div>
                <div className="text-sm font-kid-friendly text-cat-gray">
                  🔴 Needs Work
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-cat-gray">
                  {stats.notStarted}
                </div>
                <div className="text-sm font-kid-friendly text-cat-gray">
                  ⚪ Not Started
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-cat-lg p-6 shadow-cat mb-6"
          >
            <h3 className="text-lg font-kid-friendly font-bold text-cat-dark mb-4">
              Filter by Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-cat font-kid-friendly transition-all ${
                  filter === 'all' ? 'bg-cat-orange text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                All ({heatmapData.length})
              </button>
              <button
                onClick={() => setFilter('mastered')}
                className={`px-4 py-2 rounded-cat font-kid-friendly transition-all ${
                  filter === 'mastered' ? 'bg-cat-success text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                ✅ Mastered ({stats.mastered})
              </button>
              <button
                onClick={() => setFilter('practicing')}
                className={`px-4 py-2 rounded-cat font-kid-friendly transition-all ${
                  filter === 'practicing' ? 'bg-yellow-500 text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🟡 Practicing ({stats.practicing})
              </button>
              <button
                onClick={() => setFilter('needs-work')}
                className={`px-4 py-2 rounded-cat font-kid-friendly transition-all ${
                  filter === 'needs-work' ? 'bg-red-500 text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🔴 Needs Work ({stats.needsWork})
              </button>
              <button
                onClick={() => setFilter('not-started')}
                className={`px-4 py-2 rounded-cat font-kid-friendly transition-all ${
                  filter === 'not-started' ? 'bg-cat-gray text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                ⚪ Not Started ({stats.notStarted})
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-cat-lg p-6 shadow-cat"
          >
            <h3 className="text-lg font-kid-friendly font-bold text-cat-dark mb-4">
              Your Words ({filteredData.length})
            </h3>
            
            {filteredData.length === 0 ? (
              <p className="text-center font-kid-friendly text-cat-gray py-8">
                No words match this filter
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredData.map((word, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={`rounded-cat p-4 ${getStatusColor(word.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl">{getStatusIcon(word.status)}</span>
                          <span className="font-kid-friendly font-bold text-lg">
                            {word.word}
                          </span>
                        </div>
                        <div className="text-sm opacity-90">
                          {word.attempts > 0 ? (
                            <>
                              {word.successRate}% success • {word.correctAttempts}/{word.attempts} correct
                            </>
                          ) : (
                            'Not yet attempted'
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-center mt-8"
          >
            <CatMascot mood="happy" size="medium" />
            <p className="font-kid-friendly text-cat-gray mt-4">
              Keep practicing to turn more words green!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function HeatmapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <p className="font-kid-friendly text-cat-gray text-lg mt-4">
            Loading heatmap...
          </p>
        </div>
      </div>
    }>
      <HeatmapContent />
    </Suspense>
  );
}
