'use client';

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import SpellingInput, { SpellingInputRef } from '@/components/SpellingInput';
import CatMascot from '@/components/CatMascot';
import TTSErrorBoundary from '@/components/TTSErrorBoundary';
import { NotificationContainer } from '@/components/NotificationToast';
import { AudioLoadingSpinner } from '@/components/LoadingSpinner';
import OfflineIndicator from '@/components/OfflineIndicator';
import TTSStatusIndicator from '@/components/TTSStatusIndicator';
import IOSAudioInit from '@/components/IOSAudioInit';
import ReviewModeIndicator from '@/components/ReviewModeIndicator';
import { useNotifications } from '@/hooks/useNotifications';
import { PracticeWord, SpellingAttempt } from '@/types';
import { checkSpelling } from '@/lib/client-utils';
import { speakEncouragement, speakWord } from '@/lib/speech';
import { getRandomWord, getRandomReviewWord, updateWordStats, createSession, updateSessionDuration } from '@/lib/client-spelling-logic';
import { logger } from '@/lib/logger';

// Lazy load the WordPlayer component
const WordPlayer = lazy(() => import('@/components/WordPlayer'));

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReviewMode = searchParams.get('mode') === 'review';
  const notifications = useNotifications();
  const [currentWord, setCurrentWord] = useState<PracticeWord | null>(null);
  
  // Debug: Log when component renders and what currentWord is
  logger.ui('PracticePage render - currentWord:', currentWord?.word);
  const [checkedWord, setCheckedWord] = useState<string>('');
  const [attempts, setAttempts] = useState<SpellingAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [wordsCompleted, setWordsCompleted] = useState(0);
  
  // Retry logic state
  const [currentWordAttemptCount, setCurrentWordAttemptCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [userFirstAttempt, setUserFirstAttempt] = useState<string>('');
  const hasInitializedRef = useRef(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const spellingInputRef = useRef<SpellingInputRef>(null);

  const fetchNextWord = useCallback(async () => {
    logger.debug('fetchNextWord() called at:', new Date().toISOString());
    setIsLoading(true);
    // Reset retry state for new word
    setCurrentWordAttemptCount(0);
    setIsRetrying(false);
    setUserFirstAttempt('');
    try {
      const word = isReviewMode ? await getRandomReviewWord() : await getRandomWord();
      if (!word) {
        // No more review words available
        notifications.notifySuccess(
          'Review Complete!',
          'You\'ve reviewed all available words. Great job!'
        );
        setTimeout(() => router.push('/review'), 2000);
        return;
      }
      logger.debug('Fetched new word:', word.word, 'at:', new Date().toISOString());
      logger.debug('Previous currentWord was:', currentWord?.word);
      setCurrentWord(word);
      logger.debug('Setting currentWord to:', word.word);
    } catch (error) {
      logger.error('Error fetching word:', error);
      notifications.notifyError(
        'Unable to Load Word',
        'There was a problem loading the next word. Please try again.',
        {
          label: 'Retry',
          onClick: fetchNextWord
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentWord, notifications, isReviewMode, router]);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      logger.debug('Initial word fetch - preventing double execution');
      hasInitializedRef.current = true;
      fetchNextWord();
      setSessionStartTime(new Date());
    }
  }, [fetchNextWord]);

  const handleSpellingSubmit = async (userSpelling: string) => {
    console.log('📝 handleSpellingSubmit called with:', userSpelling, 'at:', new Date().toISOString());
    if (!currentWord || isSubmitting) return;

    // Capture the word immediately to prevent any race conditions
    const wordToCheck = currentWord.word;
    setCheckedWord(wordToCheck);
    console.log('User typed:', userSpelling, 'Checking against:', wordToCheck);

    setIsSubmitting(true);
    const isCorrect = checkSpelling(userSpelling, wordToCheck);
    const attemptNumber = currentWordAttemptCount + 1;
    setCurrentWordAttemptCount(attemptNumber);
    
    // Handle correct answer (first or second attempt)
    if (isCorrect) {
      // Show success feedback
      setFeedback({
        show: true,
        isCorrect: true,
        message: attemptNumber === 1 ? '🎉 Perfect!' : '🎉 Great job on the retry!'
      });

      // Speak encouragement
      try {
        await speakEncouragement('correct');
      } catch (error) {
        console.error('Error speaking encouragement:', error);
      }

      // Record attempt and move to next word
      const newAttempt: SpellingAttempt = {
        word: wordToCheck,
        userSpelling,
        isCorrect: true,
        attempts: attemptNumber
      };
      
      setAttempts(prev => [...prev, newAttempt]);
      setWordsCompleted(prev => {
        console.log('📊 Incrementing wordsCompleted from', prev, 'to', prev + 1);
        return prev + 1;
      });

      // Update word statistics
      try {
        await updateWordStats(wordToCheck, true);
      } catch (error) {
        console.error('Error updating word stats:', error);
      }

      // Move to next word after delay
      setTimeout(async () => {
        setFeedback(null);
        setIsSubmitting(false);
        
        console.log('🔍 Checking session end: wordsCompleted =', wordsCompleted, 'condition:', wordsCompleted + 1, '>=', 5, '=', wordsCompleted + 1 >= 5);
        if (wordsCompleted + 1 >= 5) {
          console.log('🏁 Ending session after', wordsCompleted + 1, 'words');
          await endSession([...attempts, newAttempt]);
        } else {
          await fetchNextWord();
        }
      }, 2000);
      
      return;
    }

    // Handle incorrect answer
    if (attemptNumber === 1) {
      // First wrong attempt - show retry option
      setUserFirstAttempt(userSpelling);
      setFeedback({
        show: true,
        isCorrect: false,
        message: '💪 Try again!'
      });

      // Speak encouragement
      try {
        await speakEncouragement('incorrect');
      } catch (error) {
        console.error('Error speaking encouragement:', error);
      }

      // Set retry mode after feedback delay
      setTimeout(() => {
        setFeedback(null);
        setIsRetrying(true);
        setIsSubmitting(false);
      }, 2000);
      
    } else {
      // Second wrong attempt - show final feedback and move on
      setFeedback({
        show: true,
        isCorrect: false,
        message: '📚 Let&apos;s learn this word!'
      });

      // Speak encouragement
      try {
        await speakEncouragement('incorrect');
      } catch (error) {
        console.error('Error speaking encouragement:', error);
      }

      // Record the failed attempt
      const newAttempt: SpellingAttempt = {
        word: wordToCheck,
        userSpelling: userFirstAttempt, // Use first attempt for recording
        isCorrect: false,
        attempts: 2
      };
      
      setAttempts(prev => [...prev, newAttempt]);
      setWordsCompleted(prev => {
        console.log('📊 Incrementing wordsCompleted from', prev, 'to', prev + 1);
        return prev + 1;
      });

      // Update word statistics
      try {
        await updateWordStats(wordToCheck, false);
      } catch (error) {
        console.error('Error updating word stats:', error);
      }

      // Auto-replay word and move to next after delay
      setTimeout(async () => {
        // Auto-replay the word before moving on
        try {
          console.log('🔊 Auto-replaying word:', wordToCheck);
          await speakWord(wordToCheck);
        } catch (error) {
          console.error('Error auto-replaying word:', error);
        }
        
        // Wait a bit after word replay, then move to next word
        setTimeout(async () => {
          setFeedback(null);
          setIsSubmitting(false);
          
          console.log('🔍 Checking session end: wordsCompleted =', wordsCompleted, 'condition:', wordsCompleted + 1, '>=', 5, '=', wordsCompleted + 1 >= 5);
          if (wordsCompleted + 1 >= 5) {
            console.log('🏁 Ending session after', wordsCompleted + 1, 'words');
            await endSession([...attempts, newAttempt]);
          } else {
            await fetchNextWord();
          }
        }, 1500); // Wait 1.5 seconds after word replay
      }, 2000);
    }
  };

  const endSession = async (finalAttempts: SpellingAttempt[]) => {
    const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
    
    try {
      const sessionResult = await createSession(finalAttempts);
      
      // Update session duration
      await updateSessionDuration(sessionResult.sessionId, sessionDuration);
      
      router.push(`/results?sessionId=${sessionResult.sessionId}`);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleEndSession = () => {
    if (attempts.length > 0) {
      endSession(attempts);
    } else {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-cat-orange border-t-transparent rounded-full mx-auto mt-4 mb-4"
          />
          <p className="font-kid-friendly text-cat-gray text-lg">
            Getting your word ready...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      {/* iOS Audio Initialization */}
      {!audioInitialized && (
        <IOSAudioInit onInitialized={() => setAudioInitialized(true)} />
      )}
      
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            onClick={handleEndSession}
            className="text-cat-gray hover:text-cat-dark font-kid-friendly flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <span>←</span>
            <span>End Session</span>
          </motion.button>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-white rounded-full px-4 py-2 shadow-cat">
              <p className="font-kid-friendly text-cat-dark">
                Word {Math.min(wordsCompleted + 1, 5)} of 5
              </p>
            </div>
            {isReviewMode && <ReviewModeIndicator />}
            <TTSStatusIndicator />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="w-full bg-cat-gray/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(Math.min(wordsCompleted + 1, 5) / 5) * 100}%` }}
              className="bg-cat-orange h-2 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {feedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <CatMascot 
                  mood={feedback.isCorrect ? 'excited' : 'encouraging'} 
                  size="large" 
                />
                <div className={`mt-6 p-6 rounded-cat-lg text-2xl font-kid-friendly font-bold ${
                  feedback.isCorrect 
                    ? 'bg-cat-success/20 text-cat-success' 
                    : 'bg-cat-warning/20 text-cat-warning'
                }`}>
                  {feedback.message}
                </div>
                {!feedback.isCorrect && currentWord && currentWordAttemptCount === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-4 bg-white rounded-cat shadow-cat"
                  >
                    <p className="font-kid-friendly text-cat-gray text-center mb-2">
                      You spelled: 
                      <span className="font-bold text-cat-warning ml-2">
                        {userFirstAttempt}
                      </span>
                    </p>
                    <p className="font-kid-friendly text-cat-gray text-center">
                      Correct spelling: 
                      <span className="font-bold text-cat-dark ml-2">
                        {checkedWord}
                      </span>
                    </p>
                  </motion.div>
                )}
                {!feedback.isCorrect && currentWord && currentWordAttemptCount === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-4 bg-white rounded-cat shadow-cat"
                  >
                    <p className="font-kid-friendly text-cat-gray text-center">
                      The correct spelling is: 
                      <span className="font-bold text-cat-dark ml-2">
                        {checkedWord}
                      </span>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : isRetrying && currentWord ? (
              <motion.div
                key="retry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-cat-lg p-8 shadow-cat"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
                    🔄 Try Again!
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    Listen carefully and try spelling the word again
                  </p>
                </div>

                <TTSErrorBoundary word={currentWord.word}>
                  <Suspense fallback={
                    <div className="mb-8">
                      <AudioLoadingSpinner word={currentWord.word} />
                    </div>
                  }>
                    <WordPlayer 
                      word={currentWord.word}
                      autoPlay={true}
                      className="mb-8"
                      onPlayComplete={() => spellingInputRef.current?.focusInput()}
                    />
                  </Suspense>
                </TTSErrorBoundary>

                {/* Show user's previous attempt */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-cat-warning/10 border-2 border-cat-warning/30 rounded-cat"
                >
                  <p className="font-kid-friendly text-cat-gray text-center text-sm">
                    You spelled:
                  </p>
                  <p className="font-kid-friendly text-cat-warning text-center text-lg font-bold">
                    {userFirstAttempt}
                  </p>
                </motion.div>

                <SpellingInput
                  ref={spellingInputRef}
                  onSubmit={handleSpellingSubmit}
                  disabled={isSubmitting}
                  placeholder="Try spelling the word again..."
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 bg-cat-cream rounded-cat border-2 border-cat-orange/30"
                >
                  <p className="font-kid-friendly text-cat-gray text-center text-sm">
                    💡 Take your time and listen carefully to the word again.
                  </p>
                </motion.div>
              </motion.div>
            ) : currentWord ? (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-cat-lg p-8 shadow-cat"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
                    {currentWord.isNewWord ? '🌟 New Word!' : '🔄 Practice Time!'}
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    Listen carefully and type what you hear
                  </p>
                </div>

                <TTSErrorBoundary word={currentWord.word}>
                  <Suspense fallback={
                    <div className="mb-8">
                      <AudioLoadingSpinner word={currentWord.word} />
                    </div>
                  }>
                    <WordPlayer 
                      word={currentWord.word}
                      autoPlay={true}
                      className="mb-8"
                      onPlayComplete={() => spellingInputRef.current?.focusInput()}
                    />
                  </Suspense>
                </TTSErrorBoundary>

                <SpellingInput
                  ref={spellingInputRef}
                  onSubmit={handleSpellingSubmit}
                  disabled={isSubmitting}
                  placeholder="Type the word you heard..."
                />

                {currentWord.isNewWord && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 p-4 bg-cat-cream rounded-cat border-2 border-cat-orange/30"
                  >
                    <p className="font-kid-friendly text-cat-gray text-center text-sm">
                      💡 This is a new word for you! Take your time and listen carefully.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="text-center bg-white rounded-cat-lg p-8 shadow-cat">
                <CatMascot mood="encouraging" size="large" />
                <p className="font-kid-friendly text-cat-gray text-lg mt-4">
                  Oops! Something went wrong. Let&apos;s try again.
                </p>
                <button
                  onClick={fetchNextWord}
                  className="cat-button mt-4 px-6 py-3"
                >
                  Get New Word
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications.notifications}
        onDismiss={notifications.dismissNotification}
      />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-cat-orange border-t-transparent rounded-full mx-auto mt-4 mb-4"
          />
          <p className="font-kid-friendly text-cat-gray text-lg">
            Loading practice session...
          </p>
        </div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}