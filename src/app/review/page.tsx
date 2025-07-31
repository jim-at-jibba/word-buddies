'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CatMascot from '@/components/CatMascot';
import ReviewWordsList from '@/components/ReviewWordsList';
import { WordWithStats } from '@/types';
import { getWordsNeedingReview } from '@/lib/client-spelling-logic';

export default function ReviewPage() {
  const router = useRouter();
  const [reviewWords, setReviewWords] = useState<WordWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewWords();
  }, []);

  const fetchReviewWords = async () => {
    try {
      const words = await getWordsNeedingReview();
      setReviewWords(words);
    } catch (error) {
      console.error('Error fetching review words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = () => {
    router.push('/practice?mode=review');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
              🔄 Review Time!
            </h1>
            <p className="text-lg md:text-xl font-kid-friendly text-cat-gray max-w-2xl mx-auto">
              These words are ready for review. Practice them to improve your memory!
            </p>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-cat-lg p-8 shadow-cat text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="w-8 h-8 border-4 border-cat-orange border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="font-kid-friendly text-cat-gray">
                Loading review words...
              </p>
            </motion.div>
          ) : reviewWords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-cat-lg p-8 shadow-cat text-center"
            >
              <div className="flex justify-center mb-6">
                <CatMascot mood="happy" size="large" />
              </div>
              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
                🌟 All Caught Up!
              </h2>
              <p className="font-kid-friendly text-cat-gray mb-6">
                Great job! You don&apos;t have any words that need review right now. 
                Keep practicing to maintain your spelling skills!
              </p>
              <Link href="/practice">
                <motion.button
                  className="cat-button text-lg px-6 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue Practicing
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Review Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-cat-lg p-6 shadow-cat mb-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-kid-friendly font-bold text-cat-dark mb-2">
                      Words Ready for Review
                    </h2>
                    <p className="font-kid-friendly text-cat-gray">
                      You have {reviewWords.length} word{reviewWords.length !== 1 ? 's' : ''} to review
                    </p>
                  </div>
                  <motion.button
                    onClick={handleStartReview}
                    className="cat-button text-lg px-6 py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center space-x-2">
                      <span>🚀</span>
                      <span>Start Review Session</span>
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Words List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <ReviewWordsList words={reviewWords} />
              </motion.div>

              {/* Cat Mascot */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-8 text-center"
              >
                <CatMascot mood="encouraging" size="medium" />
                <p className="font-kid-friendly text-cat-gray mt-4">
                  Ready to review? I&apos;ll help you remember these words!
                </p>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}