'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import SpellingInput, { SpellingInputRef } from '@/components/SpellingInput';
import CatMascot from '@/components/CatMascot';
import TTSErrorBoundary from '@/components/TTSErrorBoundary';
import { AudioLoadingSpinner } from '@/components/LoadingSpinner';
import IOSAudioInit from '@/components/IOSAudioInit';
import SimpleWordCard from '@/components/SimpleWordCard';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationContainer } from '@/components/NotificationToast';
import { useYearGroup } from '@/hooks/useSettings';
import { checkSpelling } from '@/lib/client-utils';
import { speakEncouragement, speakWord } from '@/lib/speech';
import { getChapterWords, createQuestSession, updateQuestSessionDuration, markChapterComplete } from '@/lib/client-quest-logic';
import { logger } from '@/lib/logger';

const WordPlayer = lazy(() => import('@/components/WordPlayer'));

type QuestPhase = 'preview' | 'practice' | 'review' | 'completion';

interface WordAttempt {
  word: string;
  userSpelling: string;
  isCorrect: boolean;
  attempts: number;
  round: number;
}

function QuestChapterContent() {
  const router = useRouter();
  const params = useParams();
  const chapter = parseInt(params.chapter as string);
  const { yearGroup } = useYearGroup();
  const notifications = useNotifications();
  
  const [phase, setPhase] = useState<QuestPhase>('preview');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [attempts, setAttempts] = useState<WordAttempt[]>([]);
  const [roundWords, setRoundWords] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const spellingInputRef = useRef<SpellingInputRef>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      loadChapterWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, yearGroup]);

  const loadChapterWords = async () => {
    console.log('[QuestPage] loadChapterWords called for chapter:', chapter, 'yearGroup:', yearGroup);
    try {
      setError(null);
      console.log('[QuestPage] Calling getChapterWords...');
      
      const chapterWords = await getChapterWords(chapter, yearGroup);
      
      console.log('[QuestPage] getChapterWords returned:', chapterWords);
      
      if (!chapterWords || chapterWords.length === 0) {
        console.error('[QuestPage] No words returned!');
        setError('No words available for this chapter');
        return;
      }
      
      console.log(`[QuestPage] Setting ${chapterWords.length} words to state`);
      setWords(chapterWords);
      setRoundWords(chapterWords);
      setSessionStartTime(new Date());
      console.log('[QuestPage] State updated successfully');
    } catch (error) {
      console.error('[QuestPage] ERROR in loadChapterWords:', error);
      logger.error('Error loading chapter words:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chapter';
      setError(errorMessage);
      notifications.notifyError('Error Loading Chapter', errorMessage);
    } finally {
      setLoading(false);
      console.log('[QuestPage] Loading complete, loading state:', false);
    }
  };

  const startPractice = () => {
    setPhase('practice');
    setCurrentWordIndex(0);
    setCurrentRound(1);
  };

  const handleSpellingSubmit = async (userSpelling: string) => {
    if (isSubmitting || currentWordIndex >= roundWords.length) return;

    setIsSubmitting(true);
    const currentWord = roundWords[currentWordIndex];
    const isCorrect = checkSpelling(userSpelling, currentWord);

    const newAttempt: WordAttempt = {
      word: currentWord,
      userSpelling,
      isCorrect,
      attempts: 1,
      round: currentRound,
    };

    setAttempts(prev => [...prev, newAttempt]);

    try {
      if (isCorrect) {
        await speakEncouragement('correct');
      } else {
        await speakEncouragement('incorrect');
        if (!isCorrect) {
          await speakWord(currentWord);
        }
      }
    } catch (error) {
      logger.error('Error speaking:', error);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      if (currentWordIndex + 1 < roundWords.length) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        showReview();
      }
    }, 2000);
  };

  const showReview = () => {
    setPhase('review');
  };

  const handleRetry = () => {
    const incorrectWords = roundWords.filter((word) => {
      const attempt = attempts.find(a => a.word === word && a.round === currentRound);
      return attempt && !attempt.isCorrect;
    });

    if (incorrectWords.length === 0 || currentRound >= 3) {
      completeQuest();
    } else {
      setCurrentRound(prev => prev + 1);
      setRoundWords(incorrectWords);
      setCurrentWordIndex(0);
      setPhase('practice');
    }
  };

  const completeQuest = async () => {
    try {
      const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      const sessionResult = await createQuestSession(chapter, attempts);
      await updateQuestSessionDuration(sessionResult.sessionId, sessionDuration);
      await markChapterComplete(chapter);
      setPhase('completion');
    } catch (error) {
      logger.error('Error completing quest:', error);
      notifications.notifyError('Error', 'Failed to save quest progress');
    }
  };

  const getRoundResults = (round: number) => {
    return words.map(word => {
      const attempt = attempts.find(a => a.word === word && a.round === round);
      return {
        word,
        isCorrect: attempt?.isCorrect || false,
        attempted: !!attempt,
      };
    });
  };

  if (loading) {
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
            Loading chapter {chapter}...
          </p>
        </div>
      </div>
    );
  }

  if (error || words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center">
            <CatMascot mood="encouraging" size="large" />
            <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4 mt-6">
              Oops! Something went wrong
            </h2>
            <p className="font-kid-friendly text-cat-gray mb-6">
              {error || 'Could not load words for this chapter'}
            </p>
            <div className="space-y-3">
              <motion.button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  hasInitializedRef.current = false;
                  loadChapterWords();
                }}
                className="cat-button w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
              <motion.button
                onClick={() => router.push('/quests')}
                className="w-full bg-white text-cat-orange border-2 border-cat-orange font-kid-friendly font-bold py-3 px-6 rounded-cat hover:bg-cat-orange hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Quests
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      {!audioInitialized && (
        <IOSAudioInit onInitialized={() => setAudioInitialized(true)} />
      )}
      
      <div className="container mx-auto px-4 py-8">
        
        <div className="flex justify-between items-center mb-8">
          <motion.button
            onClick={() => router.push('/quests')}
            className="text-cat-gray hover:text-cat-dark font-kid-friendly flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <span>←</span>
            <span>Back to Quests</span>
          </motion.button>
          
          <div className="bg-white rounded-full px-4 py-2 shadow-cat">
            <p className="font-kid-friendly text-cat-dark">
              Chapter {chapter} - {phase === 'preview' ? 'Preview' : phase === 'practice' ? `Round ${currentRound}` : phase === 'review' ? 'Review' : 'Complete!'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-cat-lg p-8 shadow-cat">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
                    📚 Word Preview
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    Here are the words we&apos;ll be learning today. Read them and take a look at the spellings.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {words.map((word, index) => (
                    <SimpleWordCard key={index} word={word} index={index} />
                  ))}
                </div>

                <div className="text-center">
                  <motion.button
                    onClick={startPractice}
                    className="cat-button text-lg px-8 py-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚀 Start Quest
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'practice' && roundWords[currentWordIndex] && (
            <motion.div
              key={`practice-${currentRound}-${currentWordIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-cat-lg p-8 shadow-cat">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
                    Word {currentWordIndex + 1} of {roundWords.length}
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    {currentRound > 1 ? 'Try again!' : 'Listen carefully and type what you hear'}
                  </p>
                </div>

                <TTSErrorBoundary word={roundWords[currentWordIndex]}>
                  <Suspense fallback={
                    <div className="mb-8">
                      <AudioLoadingSpinner word={roundWords[currentWordIndex]} />
                    </div>
                  }>
                    <WordPlayer 
                      word={roundWords[currentWordIndex]}
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
              </div>
            </motion.div>
          )}

          {phase === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-cat-lg p-8 shadow-cat">
                <div className="text-center mb-8">
                  <CatMascot mood="happy" size="large" />
                  <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4 mt-4">
                    Round {currentRound} Complete!
                  </h2>
                  <p className="font-kid-friendly text-cat-gray">
                    Here&apos;s how you did
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {getRoundResults(currentRound).map((result, index) => (
                    <div 
                      key={index}
                      className={`rounded-cat p-4 flex items-center justify-between ${
                        result.isCorrect ? 'bg-cat-success/20' : 'bg-cat-warning/20'
                      }`}
                    >
                      <span className="font-kid-friendly text-lg text-cat-dark">
                        {result.word}
                      </span>
                      <span className="text-2xl">
                        {result.isCorrect ? '✅' : '❌'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <motion.button
                    onClick={handleRetry}
                    className="cat-button text-lg px-8 py-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {roundWords.filter((word) => {
                      const attempt = attempts.find(a => a.word === word && a.round === currentRound);
                      return attempt && !attempt.isCorrect;
                    }).length === 0 || currentRound >= 3 ? '🎉 Complete Quest' : '🔄 Try Incorrect Words Again'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center">
                <CatMascot mood="excited" size="large" />
                <h2 className="text-3xl font-kid-friendly font-bold text-cat-dark mb-4 mt-6">
                  🎉 Chapter {chapter} Complete!
                </h2>
                <p className="font-kid-friendly text-cat-gray mb-8">
                  Amazing work! You&apos;ve mastered this chapter!
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    onClick={() => router.push('/quests')}
                    className="cat-button text-lg px-8 py-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗺️ Back to Quests
                  </motion.button>
                  
                  <motion.button
                    onClick={() => window.location.reload()}
                    className="bg-white text-cat-orange border-2 border-cat-orange font-kid-friendly font-bold py-4 px-8 rounded-cat hover:bg-cat-orange hover:text-white transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Replay Chapter
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NotificationContainer 
        notifications={notifications.notifications}
        onDismiss={notifications.dismissNotification}
      />
    </div>
  );
}

export default function QuestChapterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <div className="text-center">
          <CatMascot mood="thinking" size="large" />
          <p className="font-kid-friendly text-cat-gray text-lg mt-4">
            Loading quest...
          </p>
        </div>
      </div>
    }>
      <QuestChapterContent />
    </Suspense>
  );
}
