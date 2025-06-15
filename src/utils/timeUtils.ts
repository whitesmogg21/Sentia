
import { QuizHistory } from "@/types/quiz";

export const calculateAverageTimePerQuestion = (quizHistory: QuizHistory[]): number => {
  if (quizHistory.length === 0) return 0;

  let totalTime = 0;
  let totalQuestions = 0;

  quizHistory.forEach(quiz => {
    if (quiz.startTime && quiz.endTime) {
      const start = new Date(quiz.startTime).getTime();
      const end = new Date(quiz.endTime).getTime();
      const quizTime = (end - start) / 1000; // Convert to seconds
      
      totalTime += quizTime;
      totalQuestions += quiz.totalQuestions;
    }
  });

  return totalQuestions > 0 ? totalTime / totalQuestions : 0;
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};
