'use client';

import { motion } from 'framer-motion';

export default function ReviewModeIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-cat-error/20 text-cat-error px-3 py-1 rounded-full text-sm font-kid-friendly font-medium flex items-center space-x-1"
    >
      <span>🔄</span>
      <span>Review Mode</span>
    </motion.div>
  );
}