
import { QBank, QuizHistory } from "@/types/quiz";

export const StorageKeys = {
  SELECTED_QBANK: 'selectedQBank',
  QUIZ_HISTORY: 'quizHistory',
  MEDIA_LIBRARY: 'mediaLibrary',
  USER_SETTINGS: 'userSettings',
};

export const StorageService = {
  getSelectedQBank: (): QBank | null => {
    const data = localStorage.getItem(StorageKeys.SELECTED_QBANK);
    return data ? JSON.parse(data) : null;
  },
  
  setSelectedQBank: (qbank: QBank | null) => {
    if (qbank) {
      localStorage.setItem(StorageKeys.SELECTED_QBANK, JSON.stringify(qbank));
    } else {
      localStorage.removeItem(StorageKeys.SELECTED_QBANK);
    }
  },
  
  getQuizHistory: (): QuizHistory[] => {
    const data = localStorage.getItem(StorageKeys.QUIZ_HISTORY);
    return data ? JSON.parse(data) : [];
  },
  
  setQuizHistory: (history: QuizHistory[]) => {
    localStorage.setItem(StorageKeys.QUIZ_HISTORY, JSON.stringify(history));
  },
  
  addQuizHistory: (quiz: QuizHistory) => {
    const history = StorageService.getQuizHistory();
    history.push(quiz);
    StorageService.setQuizHistory(history);
  },
  
  clearQuizHistory: () => {
    localStorage.removeItem(StorageKeys.QUIZ_HISTORY);
  },
  
  getMediaLibrary: (): any[] => {
    const data = localStorage.getItem(StorageKeys.MEDIA_LIBRARY);
    return data ? JSON.parse(data) : [];
  },
  
  getUserSettings: (): { theme: string } => {
    const data = localStorage.getItem(StorageKeys.USER_SETTINGS);
    return data ? JSON.parse(data) : { theme: 'light' };
  },
  
  setUserSettings: (settings: { theme: string }) => {
    localStorage.setItem(StorageKeys.USER_SETTINGS, JSON.stringify(settings));
  },
  
  clearAll: () => {
    localStorage.removeItem(StorageKeys.SELECTED_QBANK);
    localStorage.removeItem(StorageKeys.QUIZ_HISTORY);
    localStorage.removeItem(StorageKeys.USER_SETTINGS);
  }
};
