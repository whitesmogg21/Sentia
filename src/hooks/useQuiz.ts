
import { useState } from "react";
import { Question, QuizHistory } from "@/types/quiz";
import { qbanks } from "@/data/questions";

interface UseQuizProps {
  onQuizComplete?: (history: QuizHistory) => void;
  onQuizStart?: () => void;
  onQuizEnd?: () => void;
}

export const useQuiz = ({ onQuizComplete, onQuizStart, onQuizEnd }: UseQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [inQuiz, setInQuiz] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [tutorMode, setTutorMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(60);

  const getCurrentQuestion = () => currentQuestions[currentQuestionIndex];

  const handleStartQuiz = (qbankId: string, questionCount: number, isTutorMode: boolean, withTimer: boolean, timeLimit: number) => {
    const selectedQBank = qbanks.find((qb) => qb.id === qbankId);
    if (!selectedQBank) return;

    const shuffledQuestions = [...selectedQBank.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    setCurrentQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTutorMode(isTutorMode);
    setTimerEnabled(withTimer);
    setTimePerQuestion(timeLimit);
    setInQuiz(true);
    setIsPaused(false);
    onQuizStart?.();
  };

  const handleAnswerTimeout = () => {
    if (!getCurrentQuestion()) return;
    
    const currentQuestion = getCurrentQuestion();
    currentQuestion.attempts = currentQuestion.attempts || [];
    currentQuestion.attempts.push({
      date: new Date().toISOString(),
      selectedAnswer: null,
      isCorrect: false
    });
    
    setIsAnswered(true);
    if (tutorMode) {
      setShowExplanation(true);
    } else {
      proceedToNextQuestion(null);
    }
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered || isPaused) return;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    currentQuestion.attempts = currentQuestion.attempts || [];
    currentQuestion.attempts.push({
      date: new Date().toISOString(),
      selectedAnswer: optionIndex,
      isCorrect
    });

    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (tutorMode) {
      setShowExplanation(true);
    } else {
      proceedToNextQuestion(optionIndex);
    }
  };

  const proceedToNextQuestion = (optionIndex: number | null) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const attempts = [{
      questionId: currentQuestion.id,
      selectedAnswer: optionIndex,
      isCorrect: optionIndex === currentQuestion.correctAnswer,
    }];

    if (currentQuestionIndex === currentQuestions.length - 1) {
      const newQuizHistory: QuizHistory = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        score: score + (optionIndex === currentQuestion.correctAnswer ? 1 : 0),
        totalQuestions: currentQuestions.length,
        qbankId: currentQuestion.qbankId,
        questionAttempts: attempts
      };
      onQuizComplete?.(newQuizHistory);
      setShowScore(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleToggleMark = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setCurrentQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        isMarked: !currentQuestion.isMarked
      };
      return newQuestions;
    });
  };

  const handleQuit = () => {
    const attempts = currentQuestions.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: index === currentQuestionIndex ? selectedAnswer : null,
      isCorrect: index === currentQuestionIndex ? selectedAnswer === question.correctAnswer : false,
    }));

    const newQuizHistory: QuizHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      score,
      totalQuestions: currentQuestions.length,
      qbankId: currentQuestions[0].qbankId,
      questionAttempts: attempts
    };
    onQuizComplete?.(newQuizHistory);
    handleRestart();
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleContinue = () => {
    setShowExplanation(false);
    proceedToNextQuestion(selectedAnswer);
  };

  const handleRestart = () => {
    setInQuiz(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTutorMode(false);
    setIsPaused(false);
    onQuizEnd?.();
  };

  const handleQuizNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else if (direction === 'next' && currentQuestionIndex < currentQuestions.length - 1) {
      proceedToNextQuestion(selectedAnswer);
    }
  };

  return {
    currentQuestionIndex,
    score,
    showScore,
    selectedAnswer,
    isAnswered,
    inQuiz,
    currentQuestions,
    tutorMode,
    showExplanation,
    isPaused,
    timerEnabled,
    timePerQuestion,
    isMarked: getCurrentQuestion()?.isMarked || false,
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleContinue,
    handleRestart,
    handleQuizNavigation,
    handleToggleMark
  };
};
