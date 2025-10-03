'use client';

import { motion } from 'framer-motion';
import { useTimer } from '@/hooks/useTimer';

const TIMER_PRESETS = [5, 10, 15, 20];

export default function TimerConfig() {
  const { isActive, startTimer } = useTimer();

  if (isActive) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-cat-lg p-6 shadow-cat"
    >
      <div className="text-center mb-4">
        <h3 className="text-xl font-kid-friendly font-bold text-cat-dark mb-2">
          ⏰ Set Practice Timer
        </h3>
        <p className="font-kid-friendly text-cat-gray text-sm">
          Choose how long you want to practice today!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TIMER_PRESETS.map((minutes) => (
          <motion.button
            key={minutes}
            onClick={() => startTimer(minutes)}
            className="bg-cat-orange hover:bg-cat-orange/90 text-white font-bold py-3 px-4 rounded-cat shadow-cat hover:shadow-cat-hover transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="font-kid-friendly">
              <div className="text-2xl">{minutes}</div>
              <div className="text-xs">minutes</div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
