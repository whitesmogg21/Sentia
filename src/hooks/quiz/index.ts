
export { useQuiz } from './useQuiz';
export type { UseQuizProps } from './types';

// Add localStorage utilities
export const clearQuizData = () => {
  localStorage.removeItem('widgetPositions');
  localStorage.removeItem('dashboardWidgets');
  localStorage.removeItem('questionFilters');
  localStorage.removeItem('quizHistory');
  localStorage.removeItem('selectedQBank');
  localStorage.removeItem('questionMetrics');
};

export const saveQuizData = (data: any) => {
  localStorage.setItem('quizHistory', JSON.stringify(data));
};

export const loadQuizData = () => {
  const quizHistory = localStorage.getItem('quizHistory');
  return quizHistory ? JSON.parse(quizHistory) : null;
};

export const saveQuestionMetrics = (metrics: any) => {
  localStorage.setItem('questionMetrics', JSON.stringify(metrics));
};

export const loadQuestionMetrics = () => {
  const metrics = localStorage.getItem('questionMetrics');
  return metrics ? JSON.parse(metrics) : null;
};
