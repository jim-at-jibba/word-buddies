'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CatMascot from '@/components/CatMascot';
import SpellingInput from '@/components/SpellingInput';
import { NotificationContainer } from '@/components/NotificationToast';
import OfflineIndicator from '@/components/OfflineIndicator';
import TTSStatusIndicator from '@/components/TTSStatusIndicator';
import IOSAudioInit from '@/components/IOSAudioInit';
import { useNotifications } from '@/hooks/useNotifications';
import { useYearGroup } from '@/hooks/useSettings';
import { HomophonePracticeWord } from '@/types';
import { speakEncouragement, speakWord, speakText } from '@/lib/speech';
import { checkSpelling } from '@/lib/client-utils';
import { 
  getRandomHomophoneChallenge, 
  createHomophonesSession, 
  updateHomophonesSessionDuration 
} from '@/lib/client-homophones-logic';
import { logger } from '@/lib/logger';

interface HomophoneAttempt {
  word: string;
  selectedHomophone: string;
  correctHomophone: string;
  contextSentence: string;
  isCorrect: boolean;
}

export default function HomophonesPage() {
  const router = useRouter();
  const { yearGroup, canPlayHomophones } = useYearGroup();
  const notifications = useNotifications();
  
  const [currentWord, setCurrentWord] = useState<HomophonePracticeWord | null>(null);
  const [attempts, setAttempts] = useState<HomophoneAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    message: string;
    selectedWord?: string;
    correctWord?: string;
  } | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // Retry logic state (matching spelling game)
  const [currentWordAttemptCount, setCurrentWordAttemptCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [userFirstAttempt, setUserFirstAttempt] = useState<string>('');

  // Check if user can play homophones
  useEffect(() => {
    if (!canPlayHomophones) {
      notifications.notifyWarning(
        'Year 3+ Only',
        'The homophones game is only available for Year 3 and above students.'
      );
      setTimeout(() => router.push('/'), 2000);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlayHomophones]);

  const fetchNextWord = useCallback(async () => {
    logger.debug('fetchNextWord() called for homophones');
    setIsLoading(true);
    setIsAutoPlaying(false);
    
    // Reset retry state for new word (matching spelling game)
    setCurrentWordAttemptCount(0);
    setIsRetrying(false);
    setUserFirstAttempt('');
    
    try {
      const challenge = await getRandomHomophoneChallenge(yearGroup);
      if (!challenge) {
        notifications.notifyError(
          'No Words Available',
          'Unable to load homophones for your year level.'
        );
        setTimeout(() => router.push('/'), 2000);
        return;
      }
      
      logger.debug('Fetched new homophone challenge:', challenge.word);
      setCurrentWord(challenge);
    } catch (error) {
      logger.error('Error fetching homophone challenge:', error);
      notifications.notifyError(
        'Unable to Load Word',
        'There was a problem loading the next word. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearGroup]);

  useEffect(() => {
    if (canPlayHomophones) {
      fetchNextWord();
      setSessionStartTime(new Date());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlayHomophones]);

  // Auto-play sentence when new word is loaded
  useEffect(() => {
    const autoPlaySentence = async () => {
      if (currentWord && !isLoading && audioInitialized) {
        try {
          setIsAutoPlaying(true);
          // Small delay to ensure page is ready
          setTimeout(async () => {
            // First play the word
            await speakWord(currentWord.word);
            // Then play the sentence after a short pause
            setTimeout(async () => {
              await speakText(currentWord.contextSentence);
              setIsAutoPlaying(false);
            }, 1000);
          }, 500);
        } catch (error) {
          logger.error('Error auto-playing sentence:', error);
          setIsAutoPlaying(false);
        }
      }
    };

    autoPlaySentence();
  }, [currentWord, isLoading, audioInitialized]);

  const handleHomophoneSubmit = async (userInput: string) => {
    if (!currentWord || isSubmitting) return;

    const trimmedInput = userInput.trim().toLowerCase();
    setIsSubmitting(true);
    
    // Check if the user's input matches the SPECIFIC correct homophone for this context
    const isCorrect = checkSpelling(trimmedInput, currentWord.correctHomophone.toLowerCase());
    const attemptNumber = currentWordAttemptCount + 1;
    setCurrentWordAttemptCount(attemptNumber);
    
    if (isCorrect) {
      // Handle correct answer
      setFeedback({
        show: true,
        isCorrect: true,
        message: attemptNumber === 1 ? '🎉 Perfect! You chose the right homophone!' : '🎉 Great job on the retry!'
      });

      // Speak encouragement
      try {
        await speakEncouragement('correct');
      } catch (error) {
        console.error('Error speaking encouragement:', error);
      }

      // Record the attempt
      const attempt: HomophoneAttempt = {
        word: currentWord.word,
        selectedHomophone: trimmedInput,
        correctHomophone: currentWord.correctHomophone,
        contextSentence: currentWord.contextSentence,
        isCorrect: true
      };
      
      setAttempts(prev => [...prev, attempt]);
      setWordsCompleted(prev => prev + 1);

      setIsSubmitting(false);
      
      // Move to next word or end session after feedback
      setTimeout(async () => {
        setFeedback(null);
        if (wordsCompleted + 1 >= 5) {
          await endSession([...attempts, attempt]);
        } else {
          await fetchNextWord();
        }
      }, 2500);
      
      return;
    }

    // Handle incorrect answer
    if (attemptNumber === 1) {
      // First wrong attempt - show retry option
      setUserFirstAttempt(trimmedInput);
      
      const isHomophoneButWrong = currentWord.homophones.some(h => 
        checkSpelling(trimmedInput, h.toLowerCase())
      );
      
      let message = '';
      if (isHomophoneButWrong) {
        message = '🤔 That\'s a homophone, but not the right one for this sentence!';
      } else {
        message = '💪 Good try! Let\'s learn this homophone.';
      }
      
      setFeedback({
        show: true,
        isCorrect: false,
        message,
        selectedWord: trimmedInput,
        correctWord: currentWord.correctHomophone
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
      }, 2500);
      
    } else {
      // Second wrong attempt - give answer and move on
      const isHomophoneButWrong = currentWord.homophones.some(h => 
        checkSpelling(trimmedInput, h.toLowerCase())
      );
      
      let message = '';
      if (isHomophoneButWrong) {
        message = '🤔 That\'s a homophone, but not the right one for this sentence!';
      } else {
        message = '💪 Good try! Let\'s learn this homophone.';
      }
      
      setFeedback({
        show: true,
        isCorrect: false,
        message,
        selectedWord: trimmedInput,
        correctWord: currentWord.correctHomophone
      });

      // Speak encouragement
      try {
        await speakEncouragement('incorrect');
      } catch (error) {
        console.error('Error speaking encouragement:', error);
      }

      // Record the attempt (using first attempt for recording)
      const attempt: HomophoneAttempt = {
        word: currentWord.word,
        selectedHomophone: userFirstAttempt, // Use first attempt for recording
        correctHomophone: currentWord.correctHomophone,
        contextSentence: currentWord.contextSentence,
        isCorrect: false
      };
      
      setAttempts(prev => [...prev, attempt]);
      setWordsCompleted(prev => prev + 1);

      // Move to next word or end session after feedback
      setTimeout(async () => {
        setFeedback(null);
        setIsSubmitting(false);
        if (wordsCompleted + 1 >= 5) {
          await endSession([...attempts, attempt]);
        } else {
          await fetchNextWord();
        }
      }, 3000);
    }
  };

  const endSession = async (finalAttempts: HomophoneAttempt[]) => {
    const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
    
    try {
      const sessionResult = await createHomophonesSession(finalAttempts);
      
      // Update session duration
      await updateHomophonesSessionDuration(sessionResult.sessionId, sessionDuration);
      
      router.push(`/results?sessionId=${sessionResult.sessionId}&gameType=homophones`);
    } catch (error) {
      console.error('Error ending homophones session:', error);
    }
  };

  const handleEndSession = () => {
    if (attempts.length > 0) {
      endSession(attempts);
    } else {
      router.push('/');
    }
  };

  const playWordAudio = async () => {
    if (!currentWord) return;
    try {
      await speakWord(currentWord.word);
    } catch (error) {
      logger.error('Error playing word audio:', error);
    }
  };

  const playSentenceAudio = async () => {
    if (!currentWord) return;
    try {
      await speakText(currentWord.contextSentence);
    } catch (error) {
      logger.error('Error playing sentence audio:', error);
    }
  };

  if (!canPlayHomophones) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="encouraging" size="large" />
          <p className="font-kid-friendly text-cat-gray text-lg mt-4">
            The homophones game is only for Year 3+ students.
          </p>
        </div>
      </div>
    );
  }

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
            Getting your homophones ready...
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
                Word {wordsCompleted + 1} of 5
              </p>
            </div>
            <div className="bg-cat-success text-white rounded-full px-3 py-1 text-xs font-bold">
              Homophones Game
            </div>
            <TTSStatusIndicator />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="w-full bg-cat-gray/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((wordsCompleted + 1) / 5) * 100}%` }}
              className="bg-cat-success h-2 rounded-full"
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-4 bg-white rounded-cat shadow-cat"
                >
                  <p className="font-kid-friendly text-cat-gray text-center mb-2">
                    You selected: 
                    <span className={`font-bold ml-2 ${feedback.isCorrect ? 'text-cat-success' : 'text-cat-warning'}`}>
                      {feedback.selectedWord}
                    </span>
                  </p>
                  {!feedback.isCorrect && (
                    <p className="font-kid-friendly text-cat-gray text-center">
                      Correct answer: 
                      <span className="font-bold text-cat-success ml-2">
                        {feedback.correctWord}
                      </span>
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ) : isRetrying ? (
              <motion.div
                key="retry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-cat-lg p-8 shadow-cat"
              >
                <div className="text-center mb-8">
                  <CatMascot mood="encouraging" size="large" />
                  <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4 mt-4">
                    🎯 Try Again!
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    Listen to the sentence again and choose the correct homophone
                  </p>
                </div>

                {/* Retry attempt indicator */}
                <div className="mb-6 flex items-center justify-center">
                  <div className="bg-cat-warning/20 text-cat-warning px-4 py-2 rounded-cat font-kid-friendly text-sm">
                    📝 Second attempt (final chance)
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="mb-8 space-y-4">
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      onClick={playWordAudio}
                      className="bg-cat-orange hover:bg-cat-orange/90 text-white font-bold py-3 px-6 rounded-cat shadow-cat"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                    >
                      <span className="flex items-center space-x-2">
                        <span>🔊</span>
                        <span>Replay Word</span>
                      </span>
                    </motion.button>
                    
                    <motion.button
                      onClick={playSentenceAudio}
                      className="bg-cat-success hover:bg-cat-success/90 text-white font-bold py-3 px-6 rounded-cat shadow-cat"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                    >
                      <span className="flex items-center space-x-2">
                        <span>📝</span>
                        <span>Replay Sentence</span>
                      </span>
                    </motion.button>
                  </div>
                </div>

                {/* Text Input */}
                <div className="space-y-4">
                  <p className="font-kid-friendly text-cat-dark text-center font-bold">
                    Type the correct spelling of the word you heard:
                  </p>
                  
                  <SpellingInput
                    onSubmit={handleHomophoneSubmit}
                    disabled={isSubmitting}
                    placeholder="Try again..."
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 bg-cat-cream rounded-cat border-2 border-cat-warning/30"
                >
                  <p className="font-kid-friendly text-cat-gray text-center text-sm">
                    💡 Think about the meaning of the sentence to choose the right homophone!
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
                    🔄 Type the Correct Homophone!
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    Listen carefully! The word and sentence will play automatically, then type the correct spelling
                  </p>
                </div>

                {/* Auto-play indicator */}
                {isAutoPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center justify-center space-x-2 bg-cat-success/20 text-cat-success px-4 py-2 rounded-cat"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-cat-success border-t-transparent rounded-full"
                    />
                    <span className="font-kid-friendly text-sm">Playing audio automatically...</span>
                  </motion.div>
                )}

                {/* Audio Controls */}
                <div className="mb-8 space-y-4">
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      onClick={playWordAudio}
                      className="bg-cat-orange hover:bg-cat-orange/90 text-white font-bold py-3 px-6 rounded-cat shadow-cat"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                    >
                      <span className="flex items-center space-x-2">
                        <span>🔊</span>
                        <span>Replay Word</span>
                      </span>
                    </motion.button>
                    
                    <motion.button
                      onClick={playSentenceAudio}
                      className="bg-cat-success hover:bg-cat-success/90 text-white font-bold py-3 px-6 rounded-cat shadow-cat"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                    >
                      <span className="flex items-center space-x-2">
                        <span>📝</span>
                        <span>Replay Sentence</span>
                      </span>
                    </motion.button>
                  </div>

                </div>

                {/* Text Input */}
                <div className="space-y-4">
                  <p className="font-kid-friendly text-cat-dark text-center font-bold">
                    Type the correct spelling of the word you heard:
                  </p>
                  
                  <SpellingInput
                    onSubmit={handleHomophoneSubmit}
                    disabled={isSubmitting}
                    placeholder="Type the word you heard..."
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 bg-cat-cream rounded-cat border-2 border-cat-success/30"
                >
                  <p className="font-kid-friendly text-cat-gray text-center text-sm">
                    💡 Listen carefully! The word and sentence will help you choose the right spelling.
                  </p>
                </motion.div>
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