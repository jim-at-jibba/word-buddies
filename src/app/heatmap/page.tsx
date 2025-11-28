'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CatMascot from '@/components/CatMascot';
import { getWordHeatmapData, WordHeatmapData } from '@/lib/client-quest-logic';
import { logger } from '@/lib/logger';

type FilterLevel = 'all' | 0 | 1 | 2 | 3 | 4 | 5;

function HeatmapContent() {
  const [heatmapData, setHeatmapData] = useState<WordHeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterLevel>('all');

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
    return word.masteryLevel === filter;
  });

  const getLevelColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-green-700 text-white'; // Dark Green - MASTERED
      case 4: return 'bg-green-400 text-white'; // Light Green - Almost There
      case 3: return 'bg-orange-500 text-white'; // Orange - Doing Well
      case 2: return 'bg-yellow-400 text-gray-800'; // Yellow - Building Confidence
      case 1: return 'bg-yellow-200 text-gray-800'; // Light Yellow - Getting Started
      case 0: return 'bg-red-500 text-white'; // Red - Need to Practice
      default: return 'bg-cat-gray text-white';
    }
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 5: return '🟩'; // Dark Green
      case 4: return '🟢'; // Light Green
      case 3: return '🟠'; // Orange
      case 2: return '🟡'; // Yellow
      case 1: return '🟡'; // Light Yellow (same emoji)
      case 0: return '🔴'; // Red
      default: return '⚪';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 5: return 'MASTERED!';
      case 4: return 'Almost There';
      case 3: return 'Doing Well';
      case 2: return 'Building Confidence';
      case 1: return 'Getting Started';
      case 0: return 'Need to Practice';
      default: return 'Not Started';
    }
  };



  const getStats = () => {
    const level0 = heatmapData.filter(w => w.masteryLevel === 0).length;
    const level1 = heatmapData.filter(w => w.masteryLevel === 1).length;
    const level2 = heatmapData.filter(w => w.masteryLevel === 2).length;
    const level3 = heatmapData.filter(w => w.masteryLevel === 3).length;
    const level4 = heatmapData.filter(w => w.masteryLevel === 4).length;
    const level5 = heatmapData.filter(w => w.masteryLevel === 5).length;

    return { level0, level1, level2, level3, level4, level5 };
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-green-700">
                  {stats.level5}
                </div>
                <div className="text-xs font-kid-friendly text-cat-gray">
                  🟩 Mastered
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-green-400">
                  {stats.level4}
                </div>
                <div className="text-xs font-kid-friendly text-cat-gray">
                  🟢 Almost There
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-orange-500">
                  {stats.level3}
                </div>
                <div className="text-xs font-kid-friendly text-cat-gray">
                  🟠 Doing Well
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-yellow-600">
                  {stats.level2}
                </div>
                <div className="text-xs font-kid-friendly text-cat-gray">
                  🟡 Building
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-yellow-400">
                  {stats.level1}
                </div>
                <div className="text-xs font-kid-friendly text-cat-gray">
                  🟡 Getting Started
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-kid-friendly font-bold text-red-600">
                  {stats.level0}
                </div>
                <div className="text-xs font-kid-friendly text-cat-gray">
                  🔴 Need Practice
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
              Filter by Mastery Level
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
                onClick={() => setFilter(5)}
                className={`px-3 py-2 rounded-cat font-kid-friendly text-sm transition-all ${
                  filter === 5 ? 'bg-green-700 text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🟩 Lvl 5 ({stats.level5})
              </button>
              <button
                onClick={() => setFilter(4)}
                className={`px-3 py-2 rounded-cat font-kid-friendly text-sm transition-all ${
                  filter === 4 ? 'bg-green-400 text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🟢 Lvl 4 ({stats.level4})
              </button>
              <button
                onClick={() => setFilter(3)}
                className={`px-3 py-2 rounded-cat font-kid-friendly text-sm transition-all ${
                  filter === 3 ? 'bg-orange-500 text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🟠 Lvl 3 ({stats.level3})
              </button>
              <button
                onClick={() => setFilter(2)}
                className={`px-3 py-2 rounded-cat font-kid-friendly text-sm transition-all ${
                  filter === 2 ? 'bg-yellow-400 text-gray-800' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🟡 Lvl 2 ({stats.level2})
              </button>
              <button
                onClick={() => setFilter(1)}
                className={`px-3 py-2 rounded-cat font-kid-friendly text-sm transition-all ${
                  filter === 1 ? 'bg-yellow-200 text-gray-800' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🟡 Lvl 1 ({stats.level1})
              </button>
              <button
                onClick={() => setFilter(0)}
                className={`px-3 py-2 rounded-cat font-kid-friendly text-sm transition-all ${
                  filter === 0 ? 'bg-red-500 text-white' : 'bg-cat-gray/20 text-cat-gray'
                }`}
              >
                🔴 Lvl 0 ({stats.level0})
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
                    className={`rounded-cat p-4 ${getLevelColor(word.masteryLevel)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl">{getLevelIcon(word.masteryLevel)}</span>
                          <span className="font-kid-friendly font-bold text-lg">
                            {word.word}
                          </span>
                        </div>
                        <div className="text-sm opacity-90 mb-1">
                          Level {word.masteryLevel}: {getLevelLabel(word.masteryLevel)}
                        </div>
                        <div className="text-xs opacity-80">
                          {word.attempts > 0 ? (
                            <>
                              {word.correctAttempts}/{word.attempts} correct ({word.successRate}%)
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
