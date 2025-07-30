'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CatMascot from './CatMascot';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
    } else {
      // Hide indicator after coming back online
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className={`rounded-cat p-4 shadow-cat border-2 max-w-sm ${
            isOnline 
              ? 'bg-cat-success/20 border-cat-success' 
              : 'bg-cat-warning/20 border-cat-warning'
          }`}>
            <div className="flex items-center space-x-3">
              <CatMascot 
                mood={isOnline ? "happy" : "encouraging"} 
                size="small" 
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">
                    {isOnline ? '🌐' : '📡'}
                  </span>
                  <h4 className={`font-kid-friendly font-bold text-sm ${
                    isOnline ? 'text-cat-success' : 'text-cat-warning'
                  }`}>
                    {isOnline ? 'Back Online!' : 'No Internet'}
                  </h4>
                </div>
                
                <p className="font-kid-friendly text-cat-gray text-xs">
                  {isOnline 
                    ? 'Your connection is restored! 🎉'
                    : 'You can still practice spelling offline! 💪'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}