'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CatMascot from './CatMascot';

interface MasteryTutorialProps {
  onComplete: () => void;
}

export default function MasteryTutorial({ onComplete }: MasteryTutorialProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Word Mastery! 🎯",
      content: "Let me show you how to become a spelling champion!",
      mood: "excited" as const,
    },
    {
      title: "Watch Your Words Change Color! 🌈",
      content: "Every time you spell a word correctly, it levels up and changes color!",
      mood: "happy" as const,
      visual: (
        <div className="flex items-center justify-center gap-2 my-4">
          <motion.div 
            className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            🔴
          </motion.div>
          <span className="text-2xl">→</span>
          <motion.div 
            className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            🟡
          </motion.div>
          <span className="text-2xl">→</span>
          <motion.div 
            className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            🟢
          </motion.div>
        </div>
      ),
    },
    {
      title: "Get 5 in a Row for GREEN! ⭐",
      content: "Spell a word correctly 5 times in a row to turn it dark green - that means you've MASTERED it!",
      mood: "excited" as const,
      visual: (
        <div className="my-4 space-y-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: num * 0.2 }}
              className="flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                num === 5 ? 'bg-green-700' : 'bg-green-400'
              }`}>
                {num}
              </div>
              <span className="font-kid-friendly">
                {num === 5 ? '🌟 MASTERED!' : `Level ${num}`}
              </span>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: "Be Careful! ⚠️",
      content: "If you get a word wrong, you drop back down 2 levels. But don't worry - you can always try again!",
      mood: "encouraging" as const,
      visual: (
        <div className="flex items-center justify-center gap-2 my-4">
          <motion.div 
            className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold"
          >
            🟢
          </motion.div>
          <motion.span 
            className="text-2xl"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            ❌
          </motion.span>
          <motion.div 
            className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold"
            animate={{ scale: [1, 0.8, 1] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            🟡
          </motion.div>
        </div>
      ),
    },
    {
      title: "Ready to Start! 🚀",
      content: "Keep practicing to turn all your words green. You've got this!",
      mood: "excited" as const,
    },
  ];

  const currentSlideData = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-cat-lg p-8 max-w-lg w-full shadow-cat-hover"
      >
        <div className="text-center">
          <CatMascot mood={currentSlideData.mood} size="large" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4 mt-6">
                {currentSlideData.title}
              </h2>
              <p className="font-kid-friendly text-cat-gray text-lg mb-6">
                {currentSlideData.content}
              </p>
              {currentSlideData.visual && (
                <div className="mb-6">
                  {currentSlideData.visual}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-cat-orange w-4' : 'bg-cat-gray/30'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            {currentSlide > 0 && (
              <motion.button
                onClick={() => setCurrentSlide(currentSlide - 1)}
                className="px-6 py-3 bg-cat-light text-cat-gray rounded-cat font-kid-friendly font-bold hover:bg-cat-cream transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back
              </motion.button>
            )}
            
            <motion.button
              onClick={handleNext}
              className="cat-button px-8 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentSlide < slides.length - 1 ? 'Next →' : "Let's Go! 🚀"}
            </motion.button>
            
            {currentSlide < slides.length - 1 && (
              <motion.button
                onClick={handleSkip}
                className="px-6 py-3 text-cat-gray font-kid-friendly hover:text-cat-dark transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Skip
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
