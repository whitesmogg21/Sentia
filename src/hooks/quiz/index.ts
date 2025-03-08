
export { useQuiz } from './useQuiz';
export type { UseQuizProps } from './types';

import { STORES, clearStore, putItem, getItem } from '@/utils/indexedDB';

// Clear all quiz data from IndexedDB
export const clearQuizData = async (): Promise<void> => {
  try {
    // Clear IndexedDB stores
    await clearStore(STORES.QUIZ_HISTORY);
    await clearStore(STORES.QUESTION_METRICS);
    
    // Also clear localStorage for backward compatibility
    localStorage.removeItem('widgetPositions');
    localStorage.removeItem('dashboardWidgets');
    localStorage.removeItem('questionFilters');
    localStorage.removeItem('quizHistory');
    localStorage.removeItem('selectedQBank');
    localStorage.removeItem('questionMetrics');
    
    console.log('Quiz data cleared successfully');
  } catch (error) {
    console.error('Error clearing quiz data:', error);
    throw error;
  }
};

// Save quiz history data to IndexedDB
export const saveQuizData = async (data: any): Promise<void> => {
  try {
    // Get existing history
    const existing = await getItem<{id: string, data: any[]}>(STORES.QUIZ_HISTORY, 'history');
    const historyArray = existing ? existing.data : [];
    
    // Add new data to history array
    const updatedHistory = Array.isArray(data) ? data : [...historyArray, data];
    
    // Save to IndexedDB
    await putItem(STORES.QUIZ_HISTORY, { id: 'history', data: updatedHistory });
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
    
    console.log('Quiz data saved successfully');
  } catch (error) {
    console.error('Error saving quiz data:', error);
    throw error;
  }
};

// Load quiz history data from IndexedDB
export const loadQuizData = async (): Promise<any[] | null> => {
  try {
    // Try to get from IndexedDB first
    const history = await getItem<{id: string, data: any[]}>(STORES.QUIZ_HISTORY, 'history');
    
    if (history && history.data) {
      return history.data;
    }
    
    // Fall back to localStorage if not in IndexedDB
    const localHistory = localStorage.getItem('quizHistory');
    if (localHistory) {
      const parsedHistory = JSON.parse(localHistory);
      // Save to IndexedDB for future use
      await saveQuizData(parsedHistory);
      return parsedHistory;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading quiz data:', error);
    
    // Last resort: try localStorage
    try {
      const localHistory = localStorage.getItem('quizHistory');
      return localHistory ? JSON.parse(localHistory) : null;
    } catch (e) {
      console.error('Failed to load from localStorage too:', e);
      return null;
    }
  }
};

// Save question metrics to IndexedDB
export const saveQuestionMetrics = async (metrics: any): Promise<void> => {
  try {
    await putItem(STORES.QUESTION_METRICS, { id: 'metrics', data: metrics });
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('questionMetrics', JSON.stringify(metrics));
    
    console.log('Question metrics saved successfully');
  } catch (error) {
    console.error('Error saving question metrics:', error);
    throw error;
  }
};

// Load question metrics from IndexedDB
export const loadQuestionMetrics = async (): Promise<any | null> => {
  try {
    // Try to get from IndexedDB first
    const metrics = await getItem<{id: string, data: any}>(STORES.QUESTION_METRICS, 'metrics');
    
    if (metrics && metrics.data) {
      return metrics.data;
    }
    
    // Fall back to localStorage if not in IndexedDB
    const localMetrics = localStorage.getItem('questionMetrics');
    if (localMetrics) {
      const parsedMetrics = JSON.parse(localMetrics);
      // Save to IndexedDB for future use
      await saveQuestionMetrics(parsedMetrics);
      return parsedMetrics;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading question metrics:', error);
    
    // Last resort: try localStorage
    try {
      const localMetrics = localStorage.getItem('questionMetrics');
      return localMetrics ? JSON.parse(localMetrics) : null;
    } catch (e) {
      console.error('Failed to load from localStorage too:', e);
      return null;
    }
  }
};
