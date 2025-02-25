
import { useReducer, useState, useEffect, useRef } from "react";
import { Question } from "@/types/quiz";
import { UseQuizProps, QuizState } from "./types";
import { initializeQuiz, createQuizHistory, handleQuestionAttempt } from "./quizActions";
import { qbanks } from "@/data/questions";

// Action types
type QuizAction = 
  | { type: "START_QUIZ"; payload: Partial<QuizState> }
  | { type: "ANSWER_QUESTION"; payload: { optionIndex: number; isCorrect: boolean; timeout?: boolean } }
  | { type: "NEXT_QUESTION" }
  | { type: "SHOW_SCORE" }
  | { type: "QUIT_QUIZ" }
  | { type: "RESTART_QUIZ"; payload: QuizState }
  | { type: "TOGGLE_PAUSE" }
  | { type: "TOGGLE_FLAG" }
  | { type: "NAVIGATE"; payload: number }
  | { type: "SET_TIMER"; payload: number }
  | { type: "ANSWER_TIMEOUT" };

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case "START_QUIZ":
      return { ...state, ...action.payload, inQuiz: true };
    
    case "ANSWER_QUESTION":
      return {
        ...state,
        currentQuestions: handleQuestionAttempt(
          state.currentQuestions,
          state.currentQuestionIndex,
          action.payload.optionIndex,
          action.payload.timeout
        ),
        selectedAnswer: action.payload.optionIndex,
        isAnswered: true,
        score: action.payload.isCorrect ? state.score + 1 : state.score,
        showExplanation: state.tutorMode
      };
    
    case "NEXT_QUESTION":
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false,
        timePerQuestion: state.timerEnabled ? 0 : state.timePerQuestion
      };
    
    case "SHOW_SCORE":
      return { ...state, showScore: true };
    
    case "QUIT_QUIZ":
      return { ...state, inQuiz: false, showScore: true };
    
    case "RESTART_QUIZ":
      return action.payload;
    
    case "TOGGLE_PAUSE":
      return { ...state, isPaused: !state.isPaused };
    
    case "TOGGLE_FLAG":
      const newQuestions = [...state.currentQuestions];
      const question = newQuestions[state.currentQuestionIndex];
      question.isFlagged = !question.isFlagged;
      return { ...state, currentQuestions: newQuestions };
    
    case "NAVIGATE":
      return {
        ...state,
        currentQuestionIndex: action.payload,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false
      };
    
    case "SET_TIMER":
      return { ...state, timePerQuestion: action.payload };
    
    case "ANSWER_TIMEOUT":
      return {
        ...state,
        currentQuestions: handleQuestionAttempt(
          state.currentQuestions,
          state.currentQuestionIndex,
          null,
          true
        ),
        isAnswered: true
      };
    
    default:
      return state;
  }
};

export const useQuiz = ({ onQuizComplete, onQuizStart, onQuizEnd }: UseQuizProps) => {
  const [state, dispatch] = useReducer(quizReducer, {
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

  // Cache for quiz history to avoid frequent localStorage access
  const [quizHistoryCache, setQuizHistoryCache] = useState<any[]>([]);
  
  // Initialize cache from localStorage
  useEffect(() => {
    const storedQuizHistory = localStorage.getItem('quizHistory');
    if (storedQuizHistory) {
      setQuizHistoryCache(JSON.parse(storedQuizHistory));
    }
  }, []);

  const calculateOverallAccuracy = () => {
    // Use the cached quiz history instead of reading from localStorage
    if (quizHistoryCache.length === 0) {
      return 0;
    }

    // Calculate the sum of all quiz accuracies
    const totalAccuracy = quizHistoryCache.reduce((sum, quiz) => {
      const quizAccuracy = (quiz.score / quiz.totalQuestions) * 100;
      return sum + quizAccuracy;
    }, 0);

    // Return the average accuracy across all quizzes
    return totalAccuracy / quizHistoryCache.length;
  };

  const getCurrentQuestion = () => state.currentQuestions[state.currentQuestionIndex];

  const handleStartQuiz = (qbankId: string, questionCount: number, isTutorMode: boolean, withTimer: boolean, timeLimit: number) => {
    const initialState = initializeQuiz(qbankId, questionCount, isTutorMode, withTimer, timeLimit);
    if (initialState) {
      dispatch({ type: "START_QUIZ", payload: initialState });
      onQuizStart?.();
    }
  };

  const handleAnswerTimeout = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    dispatch({ type: "ANSWER_TIMEOUT" });
    
    // We're using a timeout to ensure the state update above is processed
    setTimeout(() => {
      if (state.currentQuestionIndex === state.currentQuestions.length - 1) {
        const quizHistory = createQuizHistory(state, null);
        onQuizComplete?.(quizHistory);
        dispatch({ type: "SHOW_SCORE" });
      } else {
        dispatch({ type: "NEXT_QUESTION" });
        
        if (state.timerEnabled) {
          setTimeout(() => {
            dispatch({ type: "SET_TIMER", payload: state.initialTimeLimit });
          }, 10);
        }
      }
    }, 0);
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (state.isAnswered || state.isPaused) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    dispatch({ 
      type: "ANSWER_QUESTION", 
      payload: { optionIndex, isCorrect } 
    });

    if (!state.tutorMode) {
      proceedToNextQuestion(optionIndex);
    }
  };

  const proceedToNextQuestion = (optionIndex: number | null) => {
    if (state.currentQuestionIndex === state.currentQuestions.length - 1) {
      const quizHistory = createQuizHistory(state, optionIndex);
      
      // Update the quiz history cache
      setQuizHistoryCache(prev => [...prev, quizHistory]);
      
      onQuizComplete?.(quizHistory);
      dispatch({ type: "SHOW_SCORE" });
    } else {
      dispatch({ type: "NEXT_QUESTION" });
      
      if (state.timerEnabled) {
        setTimeout(() => {
          dispatch({ type: "SET_TIMER", payload: state.initialTimeLimit });
        }, 10);
      }
    }
  };

  const handleQuit = () => {
    const quizHistory = createQuizHistory(state, state.selectedAnswer);
    onQuizComplete?.(quizHistory);
    dispatch({ type: "QUIT_QUIZ" });
  };

  const handlePause = () => {
    dispatch({ type: "TOGGLE_PAUSE" });
  };

  const handleRestart = () => {
    dispatch({
      type: "RESTART_QUIZ",
      payload: {
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
        timePerQuestion: 0,
        initialTimeLimit: 0
      }
    });
    onQuizEnd?.();
  };

  const handleQuizNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && state.currentQuestionIndex > 0) {
      dispatch({ 
        type: "NAVIGATE", 
        payload: state.currentQuestionIndex - 1 
      });
    } else if (direction === 'next' && state.currentQuestionIndex < state.currentQuestions.length - 1) {
      proceedToNextQuestion(state.selectedAnswer);
    }
  };

  const handleToggleFlag = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    dispatch({ type: "TOGGLE_FLAG" });

    // Update the flag in the original qbank
    const selectedQBank = qbanks.find(qb => qb.id === currentQuestion.qbankId);
    if (selectedQBank) {
      const originalQuestion = selectedQBank.questions.find(q => q.id === currentQuestion.id);
      if (originalQuestion) {
        originalQuestion.isFlagged = !currentQuestion.isFlagged;
        localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
      }
    }
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
    isFlagged: getCurrentQuestion()?.isFlagged || false,
    calculateOverallAccuracy,
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleRestart,
    handleQuizNavigation,
    handleToggleFlag
  };
};
