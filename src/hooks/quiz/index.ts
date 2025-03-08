
export { useQuiz } from './useQuiz';
export type { UseQuizProps } from './types';

import { 
  clearStore, 
  getItem, 
  setItem, 
  STORES 
} from '@/utils/indexedDBUtils';

// Add localStorage and IndexedDB utilities
export const clearQuizData = async () => {
  try {
    // Clear data from IndexedDB
    await clearStore(STORES.WIDGET_POSITIONS);
    await clearStore(STORES.DASHBOARD_WIDGETS);
    await clearStore(STORES.QUESTION_FILTERS);
    await clearStore(STORES.QUIZ_HISTORY);
    await clearStore(STORES.QUESTION_METRICS);
    
    // Also clear from localStorage for backward compatibility
    localStorage.removeItem('widgetPositions');
    localStorage.removeItem('dashboardWidgets');
    localStorage.removeItem('questionFilters');
    localStorage.removeItem('quizHistory');
    localStorage.removeItem('selectedQBank');
    localStorage.removeItem('questionMetrics');
    
    // Dispatch event to notify that data has been cleared
    window.dispatchEvent(new CustomEvent('quizDataCleared'));
  } catch (error) {
    console.error('Error clearing quiz data:', error);
    // Fallback to localStorage if IndexedDB fails
    localStorage.removeItem('widgetPositions');
    localStorage.removeItem('dashboardWidgets');
    localStorage.removeItem('questionFilters');
    localStorage.removeItem('quizHistory');
    localStorage.removeItem('selectedQBank');
    localStorage.removeItem('questionMetrics');
  }
};

export const saveQuizData = async (data: any) => {
  try {
    // Save to IndexedDB
    await setItem(STORES.QUIZ_HISTORY, { id: 'history', data });
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('quizHistory', JSON.stringify(data));
    
    // Dispatch event to notify that quiz history has been updated
    window.dispatchEvent(new CustomEvent('quizHistoryUpdated', { detail: data }));
  } catch (error) {
    console.error('Error saving quiz data:', error);
    // Fallback to localStorage if IndexedDB fails
    localStorage.setItem('quizHistory', JSON.stringify(data));
  }
};

export const loadQuizData = async () => {
  try {
    // Attempt to load from IndexedDB
    const result = await getItem(STORES.QUIZ_HISTORY, 'history');
    if (result) {
      return result.data;
    }
    
    // Fallback to localStorage if not found in IndexedDB
    const quizHistory = localStorage.getItem('quizHistory');
    return quizHistory ? JSON.parse(quizHistory) : null;
  } catch (error) {
    console.error('Error loading quiz data:', error);
    // Fallback to localStorage if IndexedDB fails
    const quizHistory = localStorage.getItem('quizHistory');
    return quizHistory ? JSON.parse(quizHistory) : null;
  }
};

export const saveQuestionMetrics = async (metrics: any) => {
  try {
    // Save to IndexedDB
    await setItem(STORES.QUESTION_METRICS, { id: 'metrics', data: metrics });
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('questionMetrics', JSON.stringify(metrics));
    
    // Dispatch event to notify that metrics have been updated
    window.dispatchEvent(new CustomEvent('metricsUpdated', { detail: metrics }));
  } catch (error) {
    console.error('Error saving question metrics:', error);
    // Fallback to localStorage if IndexedDB fails
    localStorage.setItem('questionMetrics', JSON.stringify(metrics));
  }
};

export const loadQuestionMetrics = async () => {
  try {
    // Attempt to load from IndexedDB
    const result = await getItem(STORES.QUESTION_METRICS, 'metrics');
    if (result) {
      return result.data;
    }
    
    // Fallback to localStorage if not found in IndexedDB
    const metrics = localStorage.getItem('questionMetrics');
    return metrics ? JSON.parse(metrics) : null;
  } catch (error) {
    console.error('Error loading question metrics:', error);
    // Fallback to localStorage if IndexedDB fails
    const metrics = localStorage.getItem('questionMetrics');
    return metrics ? JSON.parse(metrics) : null;
  }
};
