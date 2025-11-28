'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CatMascot from '@/components/CatMascot';
import MasteryTutorial from '@/components/MasteryTutorial';
import MasteryHelpModal from '@/components/MasteryHelpModal';
import { useSettings } from '@/hooks/useSettings';
import { getQuestProgress, getUnlockedChapters } from '@/lib/client-quest-logic';
import { QuestProgress } from '@/lib/storage';
import { logger } from '@/lib/logger';

function QuestsContent() {
  const router = useRouter();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [questProgress, setQuestProgress] = useState<QuestProgress | null>(null);
  const [unlockedChapters, setUnlockedChapters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [masteryStats, setMasteryStats] = useState<{
    total: number;
    mastered: number;
    percentage: number;
    byLevel: Record<number, number>;
  } | null>(null);

  useEffect(() => {
    loadQuestProgress();
  }, []);

  useEffect(() => {
    // Show tutorial on first visit
    if (!settingsLoading && settings && !settings.hasSeenMasteryTutorial) {
      setShowTutorial(true);
    }
  }, [settings, settingsLoading]);

  const loadQuestProgress = async () => {
    try {
      const [progress, unlocked] = await Promise.all([
        getQuestProgress(),
        getUnlockedChapters()
      ]);
      setQuestProgress(progress);
      setUnlockedChapters(unlocked);
      
      // Load mastery stats
      const { browserDB } = await import('@/lib/storage');
      const { getMasteryProgress } = await import('@/lib/mastery-system');
      const allWords = await browserDB.getAllWords();
      const stats = getMasteryProgress(allWords);
      setMasteryStats(stats);
    } catch (error) {
      logger.error('Error loading quest progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    try {
      await updateSettings({ hasSeenMasteryTutorial: true });
    } catch (error) {
      logger.error('Error saving tutorial flag:', error);
    }
  };

  const handleStartChapter = (chapter: number) => {
    router.push(`/quests/${chapter}`);
  };

  const isChapterAvailable = (chapter: number) => {
    return unlockedChapters.includes(chapter);
  };

  const isChapterComplete = (chapter: number) => {
    return questProgress?.completedChapters.includes(chapter) || false;
  };

  if (loading || settingsLoading) {
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
            Loading your quest progress...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showTutorial && (
        <MasteryTutorial onComplete={handleTutorialComplete} />
      )}
      {showHelpModal && (
        <MasteryHelpModal onClose={() => setShowHelpModal(false)} />
      )}
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

          <div className="text-center relative">
            <h1 className="text-4xl md:text-5xl font-kid-friendly font-bold text-cat-dark mb-4">
              🗺️ Quest Mode
            </h1>
            <p className="text-lg md:text-xl font-kid-friendly text-cat-gray max-w-2xl mx-auto">
              Complete chapters to master your spelling words! Each chapter has different challenges.
            </p>
            <motion.button
              onClick={() => setShowHelpModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-0 right-0 md:right-8 w-10 h-10 rounded-full bg-cat-orange text-white font-bold text-xl shadow-cat hover:shadow-cat-hover transition-shadow"
              title="Learn about Mastery System"
            >
              ?
            </motion.button>
          </div>
        </motion.header>

        <div className="max-w-4xl mx-auto">
          {/* Global Mastery Progress Widget */}
          {masteryStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-r from-cat-orange/10 via-cat-light to-cat-cream rounded-cat-lg p-6 shadow-cat mb-8"
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-2">
                  📊 Your Mastery Progress
                </h2>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-4xl font-bold text-cat-orange">{masteryStats.mastered}</span>
                  <span className="text-2xl text-cat-gray">/</span>
                  <span className="text-2xl text-cat-gray">{masteryStats.total}</span>
                  <span className="text-lg text-cat-gray">words mastered</span>
                </div>
                <div className="text-xl font-kid-friendly text-cat-dark mt-2">
                  ({masteryStats.percentage}%)
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white rounded-full h-6 overflow-hidden shadow-inner mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${masteryStats.percentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-cat-orange to-cat-success flex items-center justify-end pr-2"
                >
                  {masteryStats.percentage > 5 && (
                    <span className="text-white font-bold text-sm">
                      {masteryStats.percentage}%
                    </span>
                  )}
                </motion.div>
              </div>
              
              {/* Level Breakdown */}
              <div className="grid grid-cols-6 gap-2 text-center text-xs font-kid-friendly">
                {[0, 1, 2, 3, 4, 5].map(level => (
                  <div key={level} className="bg-white rounded-cat p-2">
                    <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                      level === 0 ? 'bg-red-500' :
                      level === 1 ? 'bg-yellow-300' :
                      level === 2 ? 'bg-yellow-500' :
                      level === 3 ? 'bg-orange-500' :
                      level === 4 ? 'bg-green-400' :
                      'bg-green-700'
                    }`} />
                    <div className="text-cat-dark font-bold">{masteryStats.byLevel[level]}</div>
                    <div className="text-cat-gray">L{level}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            
            {/* Chapter 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`bg-white rounded-cat-lg p-6 shadow-cat ${
                isChapterAvailable(1) ? 'cursor-pointer hover:shadow-cat-hover' : 'opacity-60'
              }`}
              onClick={() => isChapterAvailable(1) && handleStartChapter(1)}
              whileHover={isChapterAvailable(1) ? { scale: 1.02 } : {}}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {isChapterComplete(1) ? '✅' : '📘'}
                </div>
                <h3 className="text-xl font-kid-friendly font-bold text-cat-dark mb-2">
                  Chapter 1
                </h3>
                <p className="text-sm font-kid-friendly text-cat-gray mb-4">
                  Easy Mode
                </p>
                <div className="space-y-2 text-sm font-kid-friendly text-cat-gray text-left">
                  <p>• Preview 10 words first</p>
                  <p>• Practice spelling each one</p>
                  <p>• Get up to 3 tries!</p>
                </div>
                {isChapterComplete(1) && (
                  <div className="mt-4 text-cat-success font-kid-friendly font-bold">
                    ⭐ Completed!
                  </div>
                )}
              </div>
            </motion.div>

            {/* Chapter 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`bg-white rounded-cat-lg p-6 shadow-cat ${
                isChapterAvailable(2) ? 'cursor-pointer hover:shadow-cat-hover' : 'opacity-60'
              }`}
              onClick={() => isChapterAvailable(2) && handleStartChapter(2)}
              whileHover={isChapterAvailable(2) ? { scale: 1.02 } : {}}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {isChapterComplete(2) ? '✅' : isChapterAvailable(2) ? '📗' : '🔒'}
                </div>
                <h3 className={`text-xl font-kid-friendly font-bold mb-2 ${
                  isChapterAvailable(2) ? 'text-cat-dark' : 'text-cat-gray'
                }`}>
                  Chapter 2
                </h3>
                <p className={`text-sm font-kid-friendly mb-4 ${
                  isChapterAvailable(2) ? 'text-cat-gray' : 'text-cat-gray'
                }`}>
                  Medium Mode
                </p>
                <div className="space-y-2 text-sm font-kid-friendly text-cat-gray text-left">
                  <p>• No word preview</p>
                  <p>• 10 word challenge</p>
                  <p>• Listen & Spell</p>
                </div>
                {!isChapterAvailable(2) && (
                  <div className="mt-4 text-cat-orange font-kid-friendly text-sm">
                    🔓 Unlock: 10 mastered words
                  </div>
                )}
                {isChapterComplete(2) && (
                  <div className="mt-4 text-cat-success font-kid-friendly font-bold">
                    ⭐ Completed!
                  </div>
                )}
              </div>
            </motion.div>

            {/* Chapter 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className={`bg-white rounded-cat-lg p-6 shadow-cat ${
                isChapterAvailable(3) ? 'cursor-pointer hover:shadow-cat-hover' : 'opacity-60'
              }`}
              onClick={() => isChapterAvailable(3) && handleStartChapter(3)}
              whileHover={isChapterAvailable(3) ? { scale: 1.02 } : {}}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {isChapterComplete(3) ? '✅' : isChapterAvailable(3) ? '📕' : '🔒'}
                </div>
                <h3 className={`text-xl font-kid-friendly font-bold mb-2 ${
                  isChapterAvailable(3) ? 'text-cat-dark' : 'text-cat-gray'
                }`}>
                  Chapter 3
                </h3>
                <p className={`text-sm font-kid-friendly mb-4 ${
                  isChapterAvailable(3) ? 'text-cat-gray' : 'text-cat-gray'
                }`}>
                  Hard Mode
                </p>
                <div className="space-y-2 text-sm font-kid-friendly text-cat-gray text-left">
                  <p>• No word preview</p>
                  <p>• 20 word challenge</p>
                  <p>• 10s timer + speed bonus</p>
                </div>
                {!isChapterAvailable(3) && (
                  <div className="mt-4 text-cat-orange font-kid-friendly text-sm">
                    🔓 Unlock: 25 mastered words
                  </div>
                )}
                {isChapterComplete(3) && (
                  <div className="mt-4 text-cat-success font-kid-friendly font-bold">
                    ⭐ Completed!
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center"
          >
            <CatMascot mood="happy" size="medium" />
            <p className="font-kid-friendly text-cat-gray mt-4">
              Ready for an adventure? Start with Chapter 1!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function QuestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <p className="font-kid-friendly text-cat-gray text-lg mt-4">
            Loading quests...
          </p>
        </div>
      </div>
    }>
      <QuestsContent />
    </Suspense>
  );
}
