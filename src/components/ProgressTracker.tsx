'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import { ProgressStats } from '@/types';

interface ProgressTrackerProps {
  stats: ProgressStats;
  className?: string;
}

const ProgressTracker = memo(function ProgressTracker({ stats, className = '' }: ProgressTrackerProps) {
  const {
    totalWordsLearned,
    averageScore,
    wordsNeedingReview,
    totalPracticeSessions,
    streakDays
  } = stats;

  const progressItems = [
    {
      label: "Words Learned",
      value: totalWordsLearned,
      icon: "📚",
      color: "cat-orange",
      bgColor: "cat-orange/20"
    },
    {
      label: "Average Score",
      value: `${averageScore}%`,
      icon: "⭐",
      color: "cat-success",
      bgColor: "cat-success/20"
    },
    {
      label: "Streak Days",
      value: streakDays,
      icon: "🔥",
      color: "cat-warning",
      bgColor: "cat-warning/20"
    },
    {
      label: "Need Review",
      value: wordsNeedingReview,
      icon: "🔄",
      color: "cat-error",
      bgColor: "cat-error/20"
    }
  ];

  return (
    <div className={`bg-white rounded-cat-lg p-6 shadow-cat ${className}`}>
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-kid-friendly font-bold text-cat-dark text-center mb-6"
      >
        🐱 Your Progress
      </motion.h3>

      <div className="grid grid-cols-2 gap-4">
        {progressItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            className={`rounded-cat p-4 text-center border-2 border-transparent transition-all duration-200 ${
              item.label === 'Words Learned' ? 'bg-cat-orange/20 hover:border-cat-orange' :
              item.label === 'Average Score' ? 'bg-cat-success/20 hover:border-cat-success' :
              item.label === 'Streak Days' ? 'bg-cat-warning/20 hover:border-cat-warning' :
              'bg-cat-error/20 hover:border-cat-error'
            }`}
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            
            <div className={`text-2xl font-bold font-kid-friendly ${
              item.label === 'Words Learned' ? 'text-cat-orange' :
              item.label === 'Average Score' ? 'text-cat-success' :
              item.label === 'Streak Days' ? 'text-cat-warning' :
              'text-cat-error'
            }`}>
              {item.value}
            </div>
            
            <div className="text-sm text-cat-gray font-kid-friendly mt-1">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar for Average Score */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-kid-friendly text-cat-gray">Overall Progress</span>
          <span className="text-sm font-kid-friendly font-bold text-cat-orange">{averageScore}%</span>
        </div>
        
        <div className="w-full bg-cat-gray/20 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${averageScore}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-gradient-to-r from-cat-orange to-cat-success h-3 rounded-full relative overflow-hidden"
          >
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Encouragement Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-center"
      >
        <p className="text-sm font-kid-friendly text-cat-gray">
          {averageScore >= 80 && "🌟 Amazing work! You're a spelling superstar!"}
          {averageScore >= 60 && averageScore < 80 && "🎯 Great progress! Keep practicing!"}
          {averageScore >= 40 && averageScore < 60 && "💪 You're getting better! Keep it up!"}
          {averageScore < 40 && totalPracticeSessions > 0 && "🌱 Every practice session helps you grow!"}
          {totalPracticeSessions === 0 && "🚀 Start your spelling adventure!"}
        </p>
      </motion.div>
    </div>
  );
});

export default ProgressTracker;