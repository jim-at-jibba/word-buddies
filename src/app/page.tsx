"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CatMascot from "@/components/CatMascot";
import { ProgressStats } from "@/types";
import { getProgressStats } from "@/lib/client-spelling-logic";
import { useUserName, useYearGroup } from "@/hooks/useSettings";

// Lazy load the ProgressTracker component
const ProgressTracker = lazy(() => import("@/components/ProgressTracker"));

export default function Home() {
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const { name } = useUserName();
  const { canPlayHomophones } = useYearGroup();

  useEffect(() => {
    fetchProgressStats();
  }, []);

  const fetchProgressStats = async () => {
    try {
      const stats = await getProgressStats();
      setProgressStats(stats);
    } catch (error) {
      console.error("Error fetching progress:", error);
      // Set default stats on error
      setProgressStats({
        totalWordsLearned: 0,
        averageScore: 0,
        streakDays: 0,
        totalPracticeSessions: 0,
        wordsNeedingReview: 0,
        masteredWords: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-kid-friendly font-bold text-cat-dark mb-4">
            🐱 Word Buddies
          </h1>
          {name ? (
            <p className="text-lg md:text-xl font-kid-friendly text-cat-gray max-w-2xl mx-auto mb-2">
              Welcome back, {name}! 🌟
            </p>
          ) : null}
          <p className="text-lg md:text-xl font-kid-friendly text-cat-gray max-w-2xl mx-auto">
            Learn spelling with our friendly cat! Perfect for Years 1-4
            students (ages 5-9)
          </p>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-cat-lg p-8 shadow-cat text-center"
            >
              <div className="flex justify-center">
                <CatMascot mood="happy" size="large" />
              </div>

              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mt-6 mb-4">
                {name
                  ? `Ready to Practice, ${name}?`
                  : "Ready to Practice Spelling?"}
              </h2>

              <p className="font-kid-friendly text-cat-gray mb-6">
                Choose a game to start your learning adventure! I&apos;ll help you
                learn new words and practice the ones you already know.
              </p>

              <div className="space-y-4">
                <Link href="/practice">
                  <motion.button
                    className="cat-button text-xl px-8 py-4 w-full"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>✏️</span>
                      <span>Spelling Practice</span>
                    </span>
                  </motion.button>
                </Link>

                {canPlayHomophones && (
                  <Link href="/homophones">
                    <motion.button
                      className="bg-cat-success hover:bg-cat-success/90 text-white font-bold py-4 px-8 rounded-cat shadow-cat hover:shadow-cat-hover transition-all duration-200 text-xl w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>🔄</span>
                        <span>Homophones Game</span>
                        <span className="text-sm bg-white text-cat-success px-2 py-1 rounded-full ml-2 font-kid-friendly">
                          Year 3+
                        </span>
                      </span>
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {loading ? (
                <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-8 h-8 border-4 border-cat-orange border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="font-kid-friendly text-cat-gray">
                    Loading your progress...
                  </p>
                </div>
              ) : progressStats ? (
                <Suspense
                  fallback={
                    <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-6 h-6 border-2 border-cat-orange border-t-transparent rounded-full mx-auto mb-4"
                      />
                      <p className="font-kid-friendly text-cat-gray">
                        Loading progress...
                      </p>
                    </div>
                  }
                >
                  <ProgressTracker stats={progressStats} />
                </Suspense>
              ) : (
                <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center">
                  <p className="font-kid-friendly text-cat-gray">
                    Unable to load progress. Please try again later.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Link href="/review">
                <motion.div
                  className="bg-white rounded-cat p-4 shadow-cat text-center hover:shadow-cat-hover transition-all duration-200 cursor-pointer relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {progressStats && progressStats.wordsNeedingReview > 0 && (
                    <div className="absolute -top-2 -right-2 bg-cat-error text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {progressStats.wordsNeedingReview}
                    </div>
                  )}
                  <div className="text-3xl mb-2">🔄</div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark text-sm">
                    Review Words
                  </h4>
                </motion.div>
              </Link>

              <Link href="/sessions">
                <motion.div
                  className="bg-white rounded-cat p-4 shadow-cat text-center hover:shadow-cat-hover transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-2">📚</div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark text-sm">
                    Session History
                  </h4>
                </motion.div>
              </Link>

              <Link href="/word-list">
                <motion.div
                  className="bg-white rounded-cat p-4 shadow-cat text-center hover:shadow-cat-hover transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark text-sm">
                    Word List
                  </h4>
                </motion.div>
              </Link>

              <Link href="/parents">
                <motion.div
                  className="bg-white rounded-cat p-4 shadow-cat text-center hover:shadow-cat-hover transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark text-sm">
                    Parents
                  </h4>
                </motion.div>
              </Link>

              <Link href="/settings">
                <motion.div
                  className="bg-white rounded-cat p-4 shadow-cat text-center hover:shadow-cat-hover transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-2">⚙️</div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark text-sm">
                    Settings
                  </h4>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-kid-friendly font-bold text-cat-dark text-center mb-8">
              🌟 What Makes Word Buddies Special?
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🔊",
                  title: "Listen & Learn",
                  description:
                    "Hear each word spoken clearly to help with pronunciation",
                },
                {
                  icon: "🎯",
                  title: "Smart Practice",
                  description: "Focus on words you need to practice most",
                },
                {
                  icon: "🏆",
                  title: "Track Progress",
                  description:
                    "See how you're improving with detailed statistics",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                  className="bg-white rounded-cat p-6 shadow-cat text-center hover:shadow-cat-hover transition-all duration-200"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark mb-2">
                    {feature.title}
                  </h4>
                  <p className="font-kid-friendly text-cat-gray text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

