import { useState } from "react";
import { Question } from "@/types/quiz";
import { UseQuizProps, QuizState } from "./types";
import { initializeQuiz, createQuizHistory, handleQuestionAttempt } from "./quizActions";

export const useQuiz = ({ onQuizComplete, onQuizStart, onQuizEnd }: UseQuizProps) => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    showScore: false,
    selectedAnswer: null,
    isAnswered: false,
    inQuiz: false,
    currentQuestions: [],
    tutorMode: false,
    showExplanation: false,
    isPaused: false,
    timerEnabled: false,
    timePerQuestion: 60,
    initialTimeLimit: 60,
  });

  const getCurrentQuestion = () => state.currentQuestions[state.currentQuestionIndex];

  const handleStartQuiz = (qbankId: string, questionCount: number, isTutorMode: boolean, withTimer: boolean, timeLimit: number) => {
    const initialState = initializeQuiz(qbankId, questionCount, isTutorMode, withTimer, timeLimit);
    if (initialState) {
      setState(prev => ({ ...prev, ...initialState }));
      onQuizStart?.();
    }
  };

  const handleAnswerTimeout = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    setState(prev => ({
      ...prev,
      currentQuestions: handleQuestionAttempt(prev.currentQuestions, prev.currentQuestionIndex, null, true)
    }));

    proceedToNextQuestion(null);
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (state.isAnswered || state.isPaused) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setState(prev => ({
      ...prev,
      currentQuestions: handleQuestionAttempt(prev.currentQuestions, prev.currentQuestionIndex, optionIndex),
      selectedAnswer: optionIndex,
      isAnswered: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      showExplanation: prev.tutorMode
    }));

    if (!state.tutorMode) {
      proceedToNextQuestion(optionIndex);
    }
  };

  const proceedToNextQuestion = (optionIndex: number | null) => {
    if (state.currentQuestionIndex === state.currentQuestions.length - 1) {
      const quizHistory = createQuizHistory(state, optionIndex);
      onQuizComplete?.(quizHistory);
      setState(prev => ({ ...prev, showScore: true }));
    } else {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false,
        timePerQuestion: prev.timerEnabled ? 0 : prev.timePerQuestion
      }));
      
      if (state.timerEnabled) {
        setTimeout(() => {
          setState(prev => ({ ...prev, timePerQuestion: prev.initialTimeLimit }));
        }, 10);
      }
    }
  };

  const handleQuit = () => {
    const quizHistory = createQuizHistory(state, state.selectedAnswer);
    onQuizComplete?.(quizHistory);
    setState(prev => ({ ...prev, showScore: true }));
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleRestart = () => {
    setState(prev => ({
      ...prev,
      inQuiz: false,
      currentQuestionIndex: 0,
      score: 0,
      showScore: false,
      selectedAnswer: null,
      isAnswered: false,
      tutorMode: false,
      isPaused: false
    }));
    onQuizEnd?.();
  };

  const handleQuizNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false
      }));
    } else if (direction === 'next' && state.currentQuestionIndex < state.currentQuestions.length - 1) {
      proceedToNextQuestion(state.selectedAnswer);
    }
  };

  const handleToggleMark = () => {
    setState(prev => {
      const newQuestions = [...prev.currentQuestions];
      const question = newQuestions[prev.currentQuestionIndex];
      question.isMarked = !question.isMarked;
      return { ...prev, currentQuestions: newQuestions };
    });
  };

  return {
    currentQuestionIndex: state.currentQuestionIndex,
    score: state.score,
    showScore: state.showScore,
    selectedAnswer: state.selectedAnswer,
    isAnswered: state.isAnswered,
    inQuiz: state.inQuiz,
    currentQuestions: state.currentQuestions,
    tutorMode: state.tutorMode,
    showExplanation: state.showExplanation,
    isPaused: state.isPaused,
    timerEnabled: state.timerEnabled,
    timePerQuestion: state.timePerQuestion,
    isMarked: getCurrentQuestion()?.isMarked || false,
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleRestart,
    handleQuizNavigation,
    handleToggleMark
  };
};
