
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

export const useQuizStore = create<
  QuizState & {
    startQuiz: (
      questions: Question[], 
      tutorMode: boolean, 
      timerEnabled: boolean, 
      timeLimit: number
    ) => void;
    answerQuestion: (optionIndex: number | null) => void;
    handleAnswerTimeout: () => void;
    proceedToNextQuestion: () => void;
    navigateQuestion: (direction: 'prev' | 'next') => void;
    togglePause: () => void;
    toggleFlag: () => void;
    endQuiz: () => void;
    resetQuiz: () => void;
    addQuizHistory: (history: QuizHistory) => void;
    clearHistory: () => void;
  }
>(
  persist(
    (set, get) => ({
      ...initialState,
      
      startQuiz: (questions, tutorMode, timerEnabled, timeLimit) => {
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
      
      answerQuestion: (optionIndex) => {
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
        
        set(state => ({
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
      
      navigateQuestion: (direction) => {
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
        set(state => ({ isPaused: !state.isPaused }));
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
      
      addQuizHistory: (history) => {
        set(state => ({ history: [...state.history, history] }));
      },
      
      clearHistory: () => {
        set({ history: [] });
      }
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
);
