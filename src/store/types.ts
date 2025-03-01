
import { QBank, QuizHistory, Question } from "@/types/quiz";

export interface RootState {
  quiz: QuizState;
  qbank: QBankState;
  metrics: MetricsState;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  showScore: boolean;
  selectedAnswer: number | null;
  isAnswered: boolean;
  inQuiz: boolean;
  currentQuestions: Question[];
  tutorMode: boolean;
  showExplanation: boolean;
  isPaused: boolean;
  timerEnabled: boolean;
  timePerQuestion: number;
  initialTimeLimit: number;
  history: QuizHistory[];
}

export interface QBankState {
  qbanks: QBank[];
  selectedQBank: QBank | null;
  questionCount: number;
  filters: {
    unused: boolean;
    used: boolean;
    correct: boolean;
    incorrect: boolean;
    flagged: boolean;
    omitted: boolean;
  };
  filteredQuestions: Question[];
}

export interface MetricsState {
  overallAccuracy: number;
  questionsAttempted: number;
  totalQuestions: number;
  totalAttempts: number;
  correctAttempts: number;
  completionRate: number;
  tagPerformance: {
    tag: string;
    score: number;
    correct: number;
    total: number;
  }[];
}
