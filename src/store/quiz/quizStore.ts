
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizState } from '../types';
import { Question, QuizHistory } from '@/types/quiz';
import { createQuizHistory } from '@/hooks/quiz/quizActions';

const initialState: QuizState = {
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
  history: [],
};

// Create the store logic separately
const createQuizStore = (set: any, get: any) => ({
  ...initialState,
  
  startQuiz: (
    questions: Question[], 
    tutorMode: boolean, 
    timerEnabled: boolean, 
    timeLimit: number
  ) => {
    set({
      currentQuestions: questions,
      currentQuestionIndex: 0,
      score: 0,
      selectedAnswer: null,
      isAnswered: false,
      inQuiz: true,
      showScore: false,
      tutorMode,
      timerEnabled,
      timePerQuestion: timeLimit,
      initialTimeLimit: timeLimit,
      isPaused: false,
      showExplanation: false,
    });
  },
  
  answerQuestion: (optionIndex: number | null) => {
    const { currentQuestions, currentQuestionIndex, tutorMode } = get();
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    if (!currentQuestion) return;
    
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    // Update the question's attempts
    const updatedQuestions = [...currentQuestions];
    const questionToUpdate = updatedQuestions[currentQuestionIndex];
    
    questionToUpdate.attempts = [
      ...(questionToUpdate.attempts || []),
      {
        questionId: questionToUpdate.id,
        selectedAnswer: optionIndex,
        isCorrect,
        date: new Date().toISOString(),
        isFlagged: Boolean(questionToUpdate.isFlagged),
        tags: questionToUpdate.tags
      }
    ];
    
    set((state: QuizState) => ({
      currentQuestions: updatedQuestions,
      selectedAnswer: optionIndex,
      isAnswered: true,
      score: isCorrect ? state.score + 1 : state.score,
      showExplanation: tutorMode
    }));
    
    if (!tutorMode) {
      get().proceedToNextQuestion();
    }
  },
  
  handleAnswerTimeout: () => {
    get().answerQuestion(null);
  },
  
  proceedToNextQuestion: () => {
    const { currentQuestionIndex, currentQuestions, timePerQuestion, timerEnabled, initialTimeLimit } = get();
    
    if (currentQuestionIndex === currentQuestions.length - 1) {
      // End of quiz
      const quizHistory = createQuizHistory(get(), get().selectedAnswer);
      get().addQuizHistory(quizHistory);
      set({ showScore: true });
    } else {
      // Move to next question
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false,
        timePerQuestion: timerEnabled ? 0 : timePerQuestion
      });
      
      if (timerEnabled) {
        setTimeout(() => {
          set({ timePerQuestion: initialTimeLimit });
        }, 10);
      }
    }
  },
  
  navigateQuestion: (direction: 'prev' | 'next') => {
    const { currentQuestionIndex, currentQuestions } = get();
    
    if (direction === 'prev' && currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        selectedAnswer: null,
        isAnswered: false,
        showExplanation: false
      });
    } else if (direction === 'next' && currentQuestionIndex < currentQuestions.length - 1) {
      get().proceedToNextQuestion();
    }
  },
  
  togglePause: () => {
    set((state: QuizState) => ({ isPaused: !state.isPaused }));
  },
  
  toggleFlag: () => {
    const { currentQuestions, currentQuestionIndex } = get();
    const updatedQuestions = [...currentQuestions];
    const question = updatedQuestions[currentQuestionIndex];
    
    if (question) {
      question.isFlagged = !question.isFlagged;
      set({ currentQuestions: updatedQuestions });
    }
  },
  
  endQuiz: () => {
    const quizHistory = createQuizHistory(get(), get().selectedAnswer);
    get().addQuizHistory(quizHistory);
    set({ showScore: true });
  },
  
  resetQuiz: () => {
    set({
      inQuiz: false,
      showScore: false,
      currentQuestions: [],
      currentQuestionIndex: 0,
      score: 0,
      selectedAnswer: null,
      isAnswered: false
    });
  },
  
  addQuizHistory: (history: QuizHistory) => {
    set((state: QuizState) => ({ history: [...state.history, history] }));
  },
  
  clearHistory: () => {
    set({ history: [] });
  }
});

// Export the store using the persist middleware correctly
export const useQuizStore = create(
  persist(
    createQuizStore,
    {
      name: 'quiz-storage',
      partialize: (state: any) => ({ history: state.history }),
    }
  )
);
