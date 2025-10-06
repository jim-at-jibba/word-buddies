'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimer } from '@/hooks/useTimer';
import { useEffect, useState } from 'react';

export default function FloatingTimer() {
  const { isActive, timeRemaining, stopTimer } = useTimer();
  const [showExpired, setShowExpired] = useState(false);
  const [wasActive, setWasActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      setWasActive(true);
    }
    
    if (wasActive && !isActive && timeRemaining === 0) {
      setShowExpired(true);
      setWasActive(false);
      const timeout = setTimeout(() => {
        setShowExpired(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, timeRemaining, wasActive]);

  if (!isActive && !showExpired) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 60 && timeRemaining > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <div
          className={`bg-white rounded-cat shadow-cat-hover px-4 py-3 ${
            isLowTime ? 'border-2 border-cat-warning' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="font-kid-friendly text-xs text-cat-gray mb-1">
                Time Left
              </div>
              <div
                className={`font-kid-friendly font-bold text-2xl ${
                  isLowTime ? 'text-cat-warning' : 'text-cat-dark'
                }`}
              >
                {String(minutes).padStart(2, '0')}:
                {String(seconds).padStart(2, '0')}
              </div>
            </div>
            <button
              onClick={stopTimer}
              className="bg-cat-gray/20 hover:bg-cat-gray/30 text-cat-gray rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
              aria-label="Stop timer"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExpired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => {
              setShowExpired(false);
            }}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-cat-lg p-8 shadow-cat-hover max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-3">
                  Time&apos;s Up!
                </h2>
                <p className="font-kid-friendly text-cat-gray mb-6">
                  Great job practicing! You can start a new timer anytime.
                </p>
                <button
                  onClick={() => setShowExpired(false)}
                  className="cat-button px-6 py-3"
                >
                  Okay!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
