'use client';

import { useState, useCallback } from 'react';
import { Notification } from '@/components/NotificationToast';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const notifySuccess = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ type: 'success', title, message, action });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message, 
      action,
      duration: 8000 // Longer duration for errors
    });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ 
      type: 'warning', 
      title, 
      message, 
      action,
      duration: 7000
    });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string, action?: Notification['action']) => {
    return addNotification({ type: 'info', title, message, action });
  }, [addNotification]);

  // Specialized notifications for common scenarios
  const notifyAudioIssue = useCallback((word?: string) => {
    return notifyWarning(
      'Audio Unavailable',
      word 
        ? `Can't play audio for "${word}" right now. You can still practice spelling!`
        : 'Audio is temporarily unavailable. You can continue with silent practice.',
      {
        label: 'Continue',
        onClick: () => {} // Just dismiss
      }
    );
  }, [notifyWarning]);

  const notifyNetworkIssue = useCallback((action?: () => void) => {
    return notifyError(
      'Connection Problem',
      'Please check your internet connection and try again.',
      action ? {
        label: 'Retry',
        onClick: action
      } : undefined
    );
  }, [notifyError]);

  const notifyPracticeComplete = useCallback((score: number, totalWords: number) => {
    const percentage = Math.round((score / totalWords) * 100);
    
    if (percentage >= 80) {
      return notifySuccess(
        'Amazing Work!',
        `You got ${score}/${totalWords} words correct! You're becoming a spelling superstar! 🌟`
      );
    } else if (percentage >= 60) {
      return notifySuccess(
        'Well Done!',
        `You got ${score}/${totalWords} words correct! Great progress! Keep practicing! 🎯`
      );
    } else {
      return notifyInfo(
        'Keep Going!',
        `You got ${score}/${totalWords} words correct! Every practice makes you stronger! 💪`
      );
    }
  }, [notifySuccess, notifyInfo]);

  const notifyWordMastered = useCallback((word: string) => {
    return notifySuccess(
      'Word Mastered!',
      `Congratulations! You've mastered the word "${word}"! 🎉`,
      undefined
    );
  }, [notifySuccess]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyAudioIssue,
    notifyNetworkIssue,
    notifyPracticeComplete,
    notifyWordMastered
  };
}