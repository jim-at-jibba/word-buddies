'use client';

import { motion } from 'framer-motion';
import { WordWithStats } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ReviewWordsListProps {
  words: WordWithStats[];
}

export default function ReviewWordsList({ words }: ReviewWordsListProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-cat-success';
    if (difficulty <= 3) return 'text-cat-warning';
    return 'text-cat-error';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-cat-success';
    if (rate >= 60) return 'text-cat-warning';
    return 'text-cat-error';
  };

  return (
    <div className="bg-white rounded-cat-lg shadow-cat overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-cat-light/50 border-b border-cat-gray/20">
              <th className="px-4 py-3 text-left font-kid-friendly font-bold text-cat-dark">
                Word
              </th>
              <th className="px-4 py-3 text-center font-kid-friendly font-bold text-cat-dark hidden sm:table-cell">
                Difficulty
              </th>
              <th className="px-4 py-3 text-center font-kid-friendly font-bold text-cat-dark">
                Success Rate
              </th>
              <th className="px-4 py-3 text-center font-kid-friendly font-bold text-cat-dark hidden md:table-cell">
                Attempts
              </th>
              <th className="px-4 py-3 text-right font-kid-friendly font-bold text-cat-dark">
                Last Practiced
              </th>
            </tr>
          </thead>
          <tbody>
            {words.map((word, index) => (
              <motion.tr
                key={word.word}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-cat-gray/10 hover:bg-cat-cream/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-kid-friendly text-cat-dark font-medium text-lg">
                    {word.word}
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span
                    className={`font-kid-friendly font-medium ${getDifficultyColor(
                      word.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(word.difficulty)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`font-kid-friendly font-bold ${getSuccessRateColor(
                      word.successRate
                    )}`}
                  >
                    {word.successRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <div className="font-kid-friendly text-cat-gray">
                    <span className="text-cat-success font-medium">
                      {word.correctAttempts}
                    </span>
                    <span className="mx-1">/</span>
                    <span>{word.attempts}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-kid-friendly text-cat-gray text-sm">
                    {word.lastAttempted
                      ? formatDistanceToNow(new Date(word.lastAttempted), {
                          addSuffix: true,
                        })
                      : 'Never'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile-friendly view for small screens */}
      <div className="sm:hidden">
        {words.map((word, index) => (
          <motion.div
            key={word.word}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 border-b border-cat-gray/10"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-kid-friendly text-cat-dark font-medium text-lg">
                {word.word}
              </span>
              <span
                className={`font-kid-friendly font-bold ${getSuccessRateColor(
                  word.successRate
                )}`}
              >
                {word.successRate}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-kid-friendly text-cat-gray">
                {word.correctAttempts}/{word.attempts} correct
              </span>
              <span className="font-kid-friendly text-cat-gray">
                {word.lastAttempted
                  ? formatDistanceToNow(new Date(word.lastAttempted), {
                      addSuffix: true,
                    })
                  : 'Never practiced'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}