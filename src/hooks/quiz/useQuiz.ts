
import { useState } from "react";
import { Question, QuestionAttempt } from "@/types/quiz";
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
    questions: Question[],
    isTutorMode: boolean,
    withTimer: boolean,
    timeLimit: number
  ) => {
    let selectedQuestions = [...questions];
    const filteredIdsString = localStorage.getItem("filteredQuestionIds");

    if (filteredIdsString) {
      try {
        const filteredIds = JSON.parse(filteredIdsString);
        selectedQuestions = questions.filter(q => filteredIds.includes(q.id));
        console.log(`Using ${selectedQuestions.length} filtered questions from localStorage`);
      } catch (error) {
        console.error("Error parsing filtered question IDs:", error);
      }
    }

    selectedQuestions = selectedQuestions.map(q => ({
      ...q,
      attempts: []
    }));

    const questionsWithRandomizedOptions = selectedQuestions.map(question => {
      const questionCopy = { ...question };

      if (questionCopy.options && questionCopy.options.length > 0) {
        const optionPairs = questionCopy.options.map((option, index) => ({
          originalIndex: index,
          text: option
        }));

        const shuffledPairs = [...optionPairs].sort(() => Math.random() - 0.5);
        questionCopy.options = shuffledPairs.map(pair => pair.text);

        const correctOptionPair = shuffledPairs.find(
          pair => pair.originalIndex === questionCopy.correctAnswer
        );

        if (correctOptionPair) {
          questionCopy.correctAnswer = shuffledPairs.findIndex(
            pair => pair.originalIndex === questionCopy.correctAnswer
          );
        }
      }

      return questionCopy;
    });

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
        // Timer will reset automatically via resetKey prop
      }));
    }
  };

  const calculateOverallAccuracy = () => {
    let totalCorrect = 0;
    let totalAttempts = 0;

    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        if (question.attempts && question.attempts.length > 0) {
          totalAttempts += question.attempts.length;
          question.attempts.forEach(attempt => {
            if (attempt.isCorrect) {
              totalCorrect++;
            }
          });
        }
      });
    });

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
      showExplanation: prev.tutorMode,
      questionAttempts: [
        ...(prev.questionAttempts || [] as any),
        {
          questionId: currentQuestion.id,
          selectedAnswer: optionIndex,
          isCorrect,
          isFlagged: currentQuestion.isFlagged || false
        }
      ]
    }));

    if (!state.tutorMode) {
      proceedToNextQuestion(optionIndex);
    }
  };

  const proceedToNextQuestion = (optionIndex: number | null) => {
    if (state.currentQuestionIndex === state.currentQuestions.length - 1) {
      const currentQuestion = getCurrentQuestion();
      const finalScore = optionIndex !== null && 
                        currentQuestion && 
                        optionIndex === currentQuestion.correctAnswer && 
                        !state.isAnswered
        ? state.score + 1
        : state.score;

      const quizHistory = createQuizHistory({
        ...state,
        score: finalScore
      }, optionIndex);

      setState(prev => ({
        ...prev,
        score: finalScore,
        showScore: true
      }));

      onQuizComplete?.(quizHistory);
    } else {
      // Simplified: no more complex timer reset logic needed
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false
        // Timer resets automatically via resetKey (currentQuestionIndex)
      }));
    }
  };

  const handleQuit = () => {
    const currentQuestion = getCurrentQuestion();
    const isCorrect = state.selectedAnswer === currentQuestion?.correctAnswer;
    const finalScore = isCorrect && !state.isAnswered 
      ? state.score + 1 
      : state.score;

    const quizHistory = createQuizHistory({
      ...state,
      score: finalScore
    }, state.selectedAnswer);

    setState(prev => ({
      ...prev,
      score: finalScore,
      showScore: true,
      inQuiz: true
    }));

    onQuizComplete?.(quizHistory);
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleRestart = () => {
    localStorage.removeItem("filteredQuestionIds");
    localStorage.removeItem("filteredQBank");

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
        // Timer resets automatically via resetKey
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

      const selectedQBank = qbanks.find(qb => qb.id === question.qbankId);
      if (selectedQBank) {
        const originalQuestion = selectedQBank.questions.find(q => q.id === question.id);
        if (originalQuestion) {
          originalQuestion.isFlagged = question.isFlagged;
          localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
        }
      }

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
    calculateOverallAccuracy,
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
