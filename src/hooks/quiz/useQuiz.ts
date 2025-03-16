
import { useState } from "react";
import { Question } from "@/types/quiz";
import { UseQuizProps, QuizState } from "./types";
import { initializeQuiz, createQuizHistory, handleQuestionAttempt } from "./quizActions";
import { qbanks } from "@/data/questions";

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

  const handleStartQuiz = (
    qbankId: string, 
    questions: Question[], // Complete set of questions
    isTutorMode: boolean, 
    withTimer: boolean, 
    timeLimit: number
  ) => {
    // Load filtered question IDs from localStorage if present
    let selectedQuestions = [...questions];
    const filteredIdsString = localStorage.getItem("filteredQuestionIds");
    
    if (filteredIdsString) {
      try {
        const filteredIds = JSON.parse(filteredIdsString);
        // Only use questions that are in the filtered IDs list
        selectedQuestions = questions.filter(q => filteredIds.includes(q.id));
        console.log(`Using ${selectedQuestions.length} filtered questions from localStorage`);
      } catch (error) {
        console.error("Error parsing filtered question IDs:", error);
      }
    }
  
    // Randomize the answer options for each question
    const questionsWithRandomizedOptions = selectedQuestions.map(question => {
      // Create a copy of the question to avoid mutating the original
      const questionCopy = { ...question };
      
      // Only randomize if the question has options
      if (questionCopy.options && questionCopy.options.length > 0) {
        // Create pairs of [index, option text] to keep track of original positions
        const optionPairs = questionCopy.options.map((option, index) => ({ 
          originalIndex: index, 
          text: option 
        }));
        
        // Shuffle the pairs
        const shuffledPairs = [...optionPairs].sort(() => Math.random() - 0.5);
        
        // Update the options with the shuffled text
        questionCopy.options = shuffledPairs.map(pair => pair.text);
        
        // Update the correct answer index to match the new position
        const correctOptionPair = shuffledPairs.find(
          pair => pair.originalIndex === questionCopy.correctAnswer
        );
        
        if (correctOptionPair) {
          // Find the new index of the correct answer
          questionCopy.correctAnswer = shuffledPairs.findIndex(
            pair => pair.originalIndex === questionCopy.correctAnswer
          );
        }
      }
      
      return questionCopy;
    });
  
    // Initialize the quiz with the randomized questions
    setState({
      currentQuestionIndex: 0,
      score: 0,
      showScore: false,
      selectedAnswer: null,
      isAnswered: false,
      inQuiz: true,
      currentQuestions: questionsWithRandomizedOptions,
      tutorMode: isTutorMode,
      showExplanation: false,
      isPaused: false,
      timerEnabled: withTimer,
      timePerQuestion: timeLimit,
      initialTimeLimit: timeLimit,
      quizStartTime: new Date().toISOString(),
      questionAttempts: []
    });
    
    // Call the onQuizStart callback if provided
    onQuizStart?.();
  };

  const handleJumpToQuestion = (questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < state.currentQuestions.length) {
      setState(prevState => ({
        ...prevState,
        currentQuestionIndex: questionIndex,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false
      }));
    }
  };
  // Calculate overall accuracy from all attempts in qbanks
  const calculateOverallAccuracy = () => {
    let totalCorrect = 0;
    let totalAttempts = 0;

    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        if (question.attempts && question.attempts.length > 0) {
          // Count all attempts, including repeats
          totalAttempts += question.attempts.length;
          // Count correct attempts
          question.attempts.forEach(attempt => {
            if (attempt.isCorrect) {
              totalCorrect++;
            }
          });
        }
      });
    });

    // Return 0 if no attempts, otherwise calculate percentage
    return totalAttempts === 0 ? 0 : (totalCorrect / totalAttempts) * 100;
  };

  const getCurrentQuestion = () => state.currentQuestions[state.currentQuestionIndex];
  
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
    setState(prev => ({ 
      ...prev, 
      showScore: true,
      inQuiz: true  // Add this line to ensure we stay in quiz mode
    }));
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleRestart = () => {
  // Clear any filtered question IDs from localStorage
  localStorage.removeItem("filteredQuestionIds");
  localStorage.removeItem("filteredQBank");
  
  // Also clear the filter settings
  const defaultFilters = {
    unused: false,
    used: false, 
    incorrect: false,
    correct: false,
    flagged: false,
    omitted: false
  };
  localStorage.setItem('questionFilters', JSON.stringify(defaultFilters));
  
  setState({
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
  });
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

  const handleToggleFlag = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    setState(prev => {
      const newQuestions = [...prev.currentQuestions];
      const question = newQuestions[prev.currentQuestionIndex];
      question.isFlagged = !question.isFlagged;

      // Update flag in the original qbank question as well
      const selectedQBank = qbanks.find(qb => qb.id === question.qbankId);
      if (selectedQBank) {
        const originalQuestion = selectedQBank.questions.find(q => q.id === question.id);
        if (originalQuestion) {
          originalQuestion.isFlagged = question.isFlagged;
          localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
        }
      }
      
      // Update the flag status in our metrics store
      import('@/utils/metricsUtils').then(module => {
        module.updateQuestionFlag(question.id, question.isFlagged);
      });

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
    isFlagged: getCurrentQuestion()?.isFlagged || false,
    calculateOverallAccuracy, // Export the accuracy calculation function
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleRestart,
    handleQuizNavigation,
    handleToggleFlag,
    jumpToQuestion: handleJumpToQuestion 
  };
};
