
import { create } from 'zustand';
import { MetricsState } from '../types';
import { useQBankStore } from '../qbank/qbankStore';
import { useQuizStore } from '../quiz/quizStore';

const initialState: MetricsState = {
  overallAccuracy: 0,
  questionsAttempted: 0,
  totalQuestions: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  completionRate: 0,
  tagPerformance: [],
};

export const useMetricsStore = create<
  MetricsState & {
    calculateMetrics: () => void;
  }
>((set) => ({
  ...initialState,
  
  calculateMetrics: () => {
    const { qbanks } = useQBankStore.getState();
    const { history } = useQuizStore.getState();
    
    // Calculate total attempts and correct answers
    let totalCorrect = 0;
    let totalAttempts = 0;
    
    // Set to track unique question IDs that have been attempted
    const seenQuestionIds = new Set<number>();
    
    // Process all attempts from question banks
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        if (question.attempts && question.attempts.length > 0) {
          // Count all attempts, including repeats
          totalAttempts += question.attempts.length;
          
          // Track unique questions
          seenQuestionIds.add(question.id);
          
          // Count correct attempts
          question.attempts.forEach(attempt => {
            if (attempt.isCorrect) {
              totalCorrect++;
            }
          });
        }
      });
    });
    
    // Calculate total questions across all question banks
    const totalQuestions = qbanks.reduce((acc, qbank) => 
      acc + qbank.questions.length, 0);
    
    // Calculate tag performance
    const tagStats: { [key: string]: { correct: number; total: number } } = {};
    
    // Initialize with all tags
    const uniqueTags = new Set<string>();
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.tags.forEach(tag => uniqueTags.add(tag));
      });
    });
    
    uniqueTags.forEach(tag => {
      tagStats[tag] = { correct: 0, total: 0 };
    });
    
    // Calculate stats for each tag
    history.forEach(quiz => {
      quiz.questionAttempts.forEach(attempt => {
        const question = qbanks
          .flatMap(qbank => qbank.questions)
          .find(q => q.id === attempt.questionId);
          
        if (question) {
          question.tags.forEach(tag => {
            tagStats[tag].total += 1;
            if (attempt.isCorrect) {
              tagStats[tag].correct += 1;
            }
          });
        }
      });
    });
    
    // Convert tag stats to array for easier consumption
    const tagPerformance = Object.entries(tagStats)
      .filter(([_, stats]) => stats.total > 0)
      .map(([tag, stats]) => ({
        tag,
        score: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        correct: stats.correct,
        total: stats.total,
      }));
    
    // Calculate overall accuracy
    const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    
    // Calculate completion rate
    const completionRate = totalQuestions > 0 ? (seenQuestionIds.size / totalQuestions) * 100 : 0;
    
    set({
      overallAccuracy,
      questionsAttempted: seenQuestionIds.size,
      totalQuestions,
      totalAttempts,
      correctAttempts: totalCorrect,
      completionRate,
      tagPerformance,
    });
  }
}));
