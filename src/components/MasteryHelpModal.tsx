'use client';

import { motion } from 'framer-motion';
import CatMascot from './CatMascot';

interface MasteryHelpModalProps {
  onClose: () => void;
}

export default function MasteryHelpModal({ onClose }: MasteryHelpModalProps) {
  const levels = [
    { level: 0, color: 'bg-red-500', emoji: '🔴', label: 'Need to Practice', streak: '0 correct' },
    { level: 1, color: 'bg-yellow-300', emoji: '🟡', label: 'Getting Started', streak: '1 in a row' },
    { level: 2, color: 'bg-yellow-500', emoji: '🟡', label: 'Building Confidence', streak: '2 in a row' },
    { level: 3, color: 'bg-orange-500', emoji: '🟠', label: 'Doing Well!', streak: '3 in a row' },
    { level: 4, color: 'bg-green-400', emoji: '🟢', label: 'Almost There!', streak: '4 in a row' },
    { level: 5, color: 'bg-green-700', emoji: '🟩', label: 'MASTERED!', streak: '5+ in a row' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-cat-lg p-8 max-w-2xl w-full shadow-cat-hover max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <CatMascot mood="thinking" size="medium" />
          <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mt-4">
            🎯 How to Master Words
          </h2>
        </div>

        <div className="space-y-3 mb-6">
          {levels.map((level) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: level.level * 0.1 }}
              className="flex items-center gap-4 p-3 bg-cat-cream rounded-cat"
            >
              <div className={`w-12 h-12 ${level.color} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
                {level.emoji}
              </div>
              <div className="flex-1">
                <div className="font-kid-friendly font-bold text-cat-dark">
                  {level.label}
                </div>
                <div className="font-kid-friendly text-sm text-cat-gray">
                  {level.streak}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-cat-warning/10 border-2 border-cat-warning rounded-cat p-4 mb-6">
          <p className="font-kid-friendly text-cat-dark">
            <span className="font-bold">⚠️ Important:</span> If you get a word wrong, you drop back down 2 levels. 
            But don&apos;t worry - you can always practice again!
          </p>
        </div>

        <div className="bg-cat-success/10 border-2 border-cat-success rounded-cat p-4 mb-6">
          <p className="font-kid-friendly text-cat-dark">
            <span className="font-bold">🌟 Goal:</span> Turn all your words dark green by spelling them correctly 
            5 times in a row. Keep practicing and you&apos;ll get there!
          </p>
        </div>

        <div className="text-center">
          <motion.button
            onClick={onClose}
            className="cat-button px-8 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Got it! 👍
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
