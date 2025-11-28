'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CatMascot from '@/components/CatMascot';
import { useYearGroup } from '@/hooks/useSettings';
import { getQuestProgress } from '@/lib/client-quest-logic';
import { QuestProgress } from '@/lib/storage';
import { logger } from '@/lib/logger';

function QuestsContent() {
  const router = useRouter();
  useYearGroup();
  const [questProgress, setQuestProgress] = useState<QuestProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestProgress();
  }, []);

  const loadQuestProgress = async () => {
    try {
      const progress = await getQuestProgress();
      setQuestProgress(progress);
    } catch (error) {
      logger.error('Error loading quest progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChapter = (chapter: number) => {
    router.push(`/quests/${chapter}`);
  };

  const isChapterAvailable = (chapter: number) => {
    if (!questProgress) return false;
    if (chapter === 1) return true;
    return false;
  };

  const isChapterComplete = (chapter: number) => {
    return questProgress?.completedChapters.includes(chapter) || false;
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
            Loading your quest progress...
          </p>
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
              🗺️ Quest Mode
            </h1>
            <p className="text-lg md:text-xl font-kid-friendly text-cat-gray max-w-2xl mx-auto">
              Complete chapters to master your spelling words! Each chapter has different challenges.
            </p>
          </div>
        </motion.header>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-cat-lg p-6 shadow-cat opacity-60"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-kid-friendly font-bold text-cat-gray mb-2">
                  Chapter 2
                </h3>
                <p className="text-sm font-kid-friendly text-cat-gray mb-4">
                  Medium Mode
                </p>
                <div className="space-y-2 text-sm font-kid-friendly text-cat-gray text-left">
                  <p>• No word preview</p>
                  <p>• 10 word challenge</p>
                  <p>• Coming soon!</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-cat-lg p-6 shadow-cat opacity-60"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-kid-friendly font-bold text-cat-gray mb-2">
                  Chapter 3
                </h3>
                <p className="text-sm font-kid-friendly text-cat-gray mb-4">
                  Hard Mode
                </p>
                <div className="space-y-2 text-sm font-kid-friendly text-cat-gray text-left">
                  <p>• No word preview</p>
                  <p>• 20 word challenge</p>
                  <p>• Coming soon!</p>
                </div>
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
