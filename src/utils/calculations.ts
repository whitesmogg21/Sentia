
import { Question, QuestionAttempt, QuizHistory } from "@/types/quiz";

export const calculateAccuracy = (attempts: QuestionAttempt[]): number => {
  if (attempts.length === 0) return 0;
  
  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  return (correctAttempts / attempts.length) * 100;
};

export const calculateCompletionRate = (
  attemptedQuestionIds: Set<number>, 
  totalQuestions: number
): number => {
  if (totalQuestions === 0) return 0;
  return (attemptedQuestionIds.size / totalQuestions) * 100;
};

export const getTagStats = (
  questions: Question[], 
  history: QuizHistory[]
): { [key: string]: { correct: number; total: number } } => {
  const stats: { [key: string]: { correct: number; total: number } } = {};
  
  // Initialize with all tags
  const uniqueTags = new Set<string>();
  questions.forEach(question => {
    question.tags.forEach(tag => uniqueTags.add(tag));
  });
  
  uniqueTags.forEach(tag => {
    stats[tag] = { correct: 0, total: 0 };
  });
  
  // Calculate stats for each tag
  history.forEach(quiz => {
    quiz.questionAttempts.forEach(attempt => {
      const question = questions.find(q => q.id === attempt.questionId);
      
      if (question) {
        question.tags.forEach(tag => {
          stats[tag].total += 1;
          if (attempt.isCorrect) {
            stats[tag].correct += 1;
          }
        });
      }
    });
  });
  
  return stats;
};

export const formatPercentage = (value: number): string => {
  return value.toFixed(1) + '%';
};
