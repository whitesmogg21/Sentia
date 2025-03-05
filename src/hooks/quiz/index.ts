export { useQuiz } from './useQuiz';
export type { UseQuizProps } from './types';

// Enhanced localStorage utilities
export const clearQuizData = () => {
  localStorage.removeItem('widgetPositions');
  localStorage.removeItem('dashboardWidgets');
  localStorage.removeItem('questionFilters');
  localStorage.removeItem('quizHistory');
  localStorage.removeItem('selectedQBank');
  // Don't remove questionMetrics as we want to keep that data
};

export const saveQuizData = (data: any) => {
  try {
    localStorage.setItem('quizHistory', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving quiz history:', error);
    return false;
  }
};

export const loadQuizData = () => {
  try {
    const quizHistory = localStorage.getItem('quizHistory');
    return quizHistory ? JSON.parse(quizHistory) : [];
  } catch (error) {
    console.error('Error loading quiz history:', error);
    return [];
  }
};

export const saveQuestionMetrics = (metrics: any) => {
  try {
    localStorage.setItem('questionMetrics', JSON.stringify(metrics));
    return true;
  } catch (error) {
    console.error('Error saving question metrics:', error);
    return false;
  }
};

export const loadQuestionMetrics = () => {
  try {
    const metrics = localStorage.getItem('questionMetrics');
    return metrics ? JSON.parse(metrics) : null;
  } catch (error) {
    console.error('Error loading question metrics:', error);
    return null;
  }
};
