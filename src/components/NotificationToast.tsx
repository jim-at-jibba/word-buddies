'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CatMascot from './CatMascot';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const { id, type, title, message, duration = 5000, action } = notification;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-cat-success/20',
          borderColor: 'border-cat-success',
          textColor: 'text-cat-success',
          mood: 'happy' as const
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-cat-error/20',
          borderColor: 'border-cat-error',
          textColor: 'text-cat-error',
          mood: 'encouraging' as const
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-cat-warning/20',
          borderColor: 'border-cat-warning',
          textColor: 'text-cat-warning',
          mood: 'thinking' as const
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-cat-light/20',
          borderColor: 'border-cat-orange',
          textColor: 'text-cat-orange',
          mood: 'happy' as const
        };
    }
  };

  const config = getTypeConfig();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
      className={`${config.bgColor} border-2 ${config.borderColor} rounded-cat p-4 shadow-cat max-w-sm w-full`}
    >
      <div className="flex items-start space-x-3">
        <CatMascot mood={config.mood} size="small" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{config.icon}</span>
            <h4 className={`font-kid-friendly font-bold ${config.textColor} text-sm`}>
              {title}
            </h4>
          </div>
          
          <p className="font-kid-friendly text-cat-gray text-sm mb-3">
            {message}
          </p>
          
          <div className="flex items-center justify-between">
            {action && (
              <button
                onClick={action.onClick}
                className={`text-xs font-kid-friendly font-bold px-3 py-1 rounded-cat border ${config.borderColor} ${config.textColor} hover:bg-white transition-colors duration-200`}
              >
                {action.label}
              </button>
            )}
            
            <button
              onClick={() => onDismiss(id)}
              className="text-cat-gray hover:text-cat-dark text-sm ml-auto"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              notification={notification}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}