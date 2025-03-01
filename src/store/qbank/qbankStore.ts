
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QBankState } from '../types';
import { QBank, Question } from '@/types/quiz';
import { qbanks as initialQBanks } from '@/data/questions';

const initialState: QBankState = {
  qbanks: initialQBanks,
  selectedQBank: null,
  questionCount: 5,
  filters: {
    unused: false,
    used: false,
    correct: false,
    incorrect: false,
    flagged: false,
    omitted: false,
  },
  filteredQuestions: [],
};

export const useQBankStore = create<
  QBankState & {
    selectQBank: (qbank: QBank) => void;
    unselectQBank: () => void;
    setQuestionCount: (count: number) => void;
    toggleFilter: (key: keyof QBankState['filters']) => void;
    updateFilteredQuestions: () => void;
    updateQuestionAttempts: (qbankId: string, questionAttempts: Array<{
      questionId: number;
      selectedAnswer: number | null;
      isCorrect: boolean;
      isFlagged: boolean;
      tags: string[];
    }>) => void;
    toggleQuestionFlag: (questionId: number, isFlagged: boolean) => void;
    resetFilters: () => void;
  }
>(
  persist(
    (set, get) => ({
      ...initialState,
      
      selectQBank: (qbank) => {
        set({ selectedQBank: qbank });
        get().updateFilteredQuestions();
      },
      
      unselectQBank: () => {
        set({ selectedQBank: null, filteredQuestions: [] });
      },
      
      setQuestionCount: (count) => {
        set({ questionCount: count });
      },
      
      toggleFilter: (key) => {
        set(state => ({
          filters: {
            ...state.filters,
            [key]: !state.filters[key]
          }
        }));
        get().updateFilteredQuestions();
      },
      
      updateFilteredQuestions: () => {
        const { selectedQBank, filters } = get();
        
        if (!selectedQBank) {
          set({ filteredQuestions: [] });
          return;
        }
        
        const filteredQuestions = selectedQBank.questions.filter(question => {
          if (!Object.values(filters).some(v => v)) return true;
          
          const hasBeenAttempted = question.attempts && question.attempts.length > 0;
          const lastAttempt = hasBeenAttempted ? question.attempts[question.attempts.length - 1] : null;
          
          return (
            (filters.unused && !hasBeenAttempted) ||
            (filters.used && hasBeenAttempted) ||
            (filters.correct && lastAttempt?.isCorrect) ||
            (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
            (filters.flagged && question.isFlagged) ||
            (filters.omitted && lastAttempt?.selectedAnswer === null)
          );
        });
        
        set({ filteredQuestions });
      },
      
      updateQuestionAttempts: (qbankId, questionAttempts) => {
        set(state => {
          const updatedQBanks = state.qbanks.map(qbank => {
            if (qbank.id !== qbankId) return qbank;
            
            const updatedQuestions = qbank.questions.map(question => {
              const attempt = questionAttempts.find(a => a.questionId === question.id);
              if (!attempt) return question;
              
              return {
                ...question,
                attempts: [
                  ...(question.attempts || []),
                  {
                    questionId: attempt.questionId,
                    selectedAnswer: attempt.selectedAnswer,
                    isCorrect: attempt.isCorrect,
                    date: new Date().toISOString(),
                    isFlagged: attempt.isFlagged,
                    tags: question.tags
                  }
                ],
                isFlagged: attempt.isFlagged
              };
            });
            
            return {
              ...qbank,
              questions: updatedQuestions
            };
          });
          
          return { qbanks: updatedQBanks };
        });
        
        // If we were working with the selectedQBank, update it too
        const { selectedQBank } = get();
        if (selectedQBank && selectedQBank.id === qbankId) {
          const updatedQBank = get().qbanks.find(qb => qb.id === qbankId);
          if (updatedQBank) {
            set({ selectedQBank: updatedQBank });
          }
        }
        
        get().updateFilteredQuestions();
      },
      
      toggleQuestionFlag: (questionId, isFlagged) => {
        set(state => {
          const updatedQBanks = state.qbanks.map(qbank => {
            const updatedQuestions = qbank.questions.map(question => {
              if (question.id !== questionId) return question;
              return { ...question, isFlagged };
            });
            
            return { ...qbank, questions: updatedQuestions };
          });
          
          return { qbanks: updatedQBanks };
        });
        
        // If we were working with the selectedQBank, update it too
        const { selectedQBank } = get();
        if (selectedQBank) {
          const questionIndex = selectedQBank.questions.findIndex(q => q.id === questionId);
          if (questionIndex !== -1) {
            const updatedQBank = { 
              ...selectedQBank,
              questions: selectedQBank.questions.map((q, i) => 
                i === questionIndex ? { ...q, isFlagged } : q
              )
            };
            set({ selectedQBank: updatedQBank });
          }
        }
        
        get().updateFilteredQuestions();
      },
      
      resetFilters: () => {
        set({
          filters: {
            unused: false,
            used: false,
            correct: false,
            incorrect: false,
            flagged: false,
            omitted: false,
          }
        });
        get().updateFilteredQuestions();
      }
    }),
    {
      name: 'qbank-storage',
      partialize: (state) => ({ 
        selectedQBank: state.selectedQBank,
        qbanks: state.qbanks 
      }),
    }
  )
);
