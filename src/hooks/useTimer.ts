'use client';

import { useState, useEffect, useCallback } from 'react';
import { updateUserSettings, getUserSettings } from '@/lib/storage';

export function useTimer() {
  const [duration, setDuration] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const clearTimerState = async () => {
    await updateUserSettings({
      timerDuration: undefined,
      timerStartTime: undefined,
      timerIsActive: false,
    });
  };

  const stopTimer = useCallback(async () => {
    try {
      await clearTimerState();
      setDuration(null);
      setStartTime(null);
      setIsActive(false);
      setTimeRemaining(0);
      
      window.dispatchEvent(new CustomEvent('timerStateChanged'));
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  }, []);

  const loadTimerState = useCallback(async () => {
    try {
      const settings = await getUserSettings();
      if (settings.timerIsActive && settings.timerStartTime && settings.timerDuration) {
        const now = Date.now();
        const elapsed = Math.floor((now - settings.timerStartTime) / 1000);
        const totalSeconds = settings.timerDuration * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);

        if (remaining > 0) {
          setDuration(settings.timerDuration);
          setStartTime(settings.timerStartTime);
          setIsActive(true);
          setTimeRemaining(remaining);
        } else {
          await clearTimerState();
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  }, []);

  useEffect(() => {
    loadTimerState();

    const handleTimerChange = () => {
      loadTimerState();
    };

    window.addEventListener('timerStateChanged', handleTimerChange);
    return () => window.removeEventListener('timerStateChanged', handleTimerChange);
  }, [loadTimerState]);

  useEffect(() => {
    if (!isActive || !startTime || !duration) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const totalSeconds = duration * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        stopTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, duration, stopTimer]);

  const startTimer = useCallback(async (minutes: number) => {
    const now = Date.now();
    try {
      await updateUserSettings({
        timerDuration: minutes,
        timerStartTime: now,
        timerIsActive: true,
      });

      setDuration(minutes);
      setStartTime(now);
      setIsActive(true);
      setTimeRemaining(minutes * 60);
      
      window.dispatchEvent(new CustomEvent('timerStateChanged'));
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }, []);

  return {
    isActive,
    timeRemaining,
    duration,
    startTimer,
    stopTimer,
  };
}
