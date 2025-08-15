'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CatMascot from '@/components/CatMascot';
import { NotificationContainer } from '@/components/NotificationToast';
import OfflineIndicator from '@/components/OfflineIndicator';
import TTSStatusIndicator from '@/components/TTSStatusIndicator';
import IOSAudioInit from '@/components/IOSAudioInit';
import { useNotifications } from '@/hooks/useNotifications';
import { useYearGroup } from '@/hooks/useSettings';
import { HomophonePracticeWord } from '@/types';
import { speakEncouragement, speakWord, speakText } from '@/lib/speech';
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
  const [selectedHomophone, setSelectedHomophone] = useState<string>('');
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
  const [hasPlayedSentence, setHasPlayedSentence] = useState(false);

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
    setSelectedHomophone('');
    setHasPlayedSentence(false);
    
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

  const handleHomophoneSelect = async (selectedWord: string) => {
    if (!currentWord || isSubmitting) return;

    setSelectedHomophone(selectedWord);
    setIsSubmitting(true);
    
    const isCorrect = selectedWord === currentWord.correctHomophone;
    
    const attempt: HomophoneAttempt = {
      word: currentWord.word,
      selectedHomophone: selectedWord,
      correctHomophone: currentWord.correctHomophone,
      contextSentence: currentWord.contextSentence,
      isCorrect
    };

    setAttempts(prev => [...prev, attempt]);
    setWordsCompleted(prev => prev + 1);

    // Show feedback
    setFeedback({
      show: true,
      isCorrect,
      message: isCorrect ? '🎉 Perfect! Great job!' : '💪 Good try! Let\'s learn this one.',
      selectedWord,
      correctWord: currentWord.correctHomophone
    });

    // Speak encouragement
    try {
      await speakEncouragement(isCorrect ? 'correct' : 'incorrect');
    } catch (error) {
      console.error('Error speaking encouragement:', error);
    }

    // Move to next word after delay
    setTimeout(async () => {
      setFeedback(null);
      setIsSubmitting(false);
      
      if (wordsCompleted + 1 >= 5) {
        await endSession([...attempts, attempt]);
      } else {
        await fetchNextWord();
      }
    }, 3000);
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
      setHasPlayedSentence(true);
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
                    🔄 Choose the Correct Homophone!
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    Listen to the word and sentence, then select the correct spelling
                  </p>
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
                        <span>Play Word</span>
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
                        <span>Play Sentence</span>
                      </span>
                    </motion.button>
                  </div>

                  {/* Context Sentence Display */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hasPlayedSentence ? 1 : 0.5 }}
                    className="bg-cat-cream rounded-cat p-4 border-2 border-cat-orange/30"
                  >
                    <p className="font-kid-friendly text-cat-dark text-center text-lg">
                      &ldquo;{currentWord.contextSentence}&rdquo;
                    </p>
                  </motion.div>
                </div>

                {/* Homophone Choices */}
                <div className="space-y-3">
                  <p className="font-kid-friendly text-cat-dark text-center font-bold">
                    Which spelling fits the sentence?
                  </p>
                  {currentWord.homophones.map((homophone, index) => (
                    <motion.button
                      key={homophone}
                      onClick={() => handleHomophoneSelect(homophone)}
                      className={`w-full p-4 rounded-cat font-kid-friendly font-bold text-lg transition-all duration-200 ${
                        selectedHomophone === homophone
                          ? 'bg-cat-orange text-white shadow-cat-hover'
                          : 'bg-white hover:bg-cat-cream border-2 border-cat-gray/20 hover:border-cat-orange/50 text-cat-dark'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {homophone}
                    </motion.button>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 bg-cat-cream rounded-cat border-2 border-cat-success/30"
                >
                  <p className="font-kid-friendly text-cat-gray text-center text-sm">
                    💡 Listen carefully to both the word and sentence to pick the right homophone!
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