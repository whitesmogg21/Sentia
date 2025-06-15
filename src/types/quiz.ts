export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  qbankId: string;
  isFlagged?: boolean;
  attempts?: QuestionAttempt[];
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    showWith: 'question' | 'answer';
  };
  explanation?: string;
  tags: string[];
}

export interface QuestionAttempt {
  questionId: number;
  selectedAnswer: number | null;
  isCorrect: boolean;
  isFlagged: boolean;
  date: string;
  tags: string[];
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  showScore: boolean;
  questions: Question[];
  tutorMode: boolean;
}

export interface QuizHistory {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  score: number;
  totalQuestions: number;
  qbankId: string;
  questionAttempts: {
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
    isFlagged: boolean;
    tags: string[];
  }[];
}

export interface MediaItem {
  type: 'image' | 'audio' | 'video';
  url: string;
}

export interface QBank {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  media?: MediaItem[];
}

export interface QuestionFilter {
  unused: boolean;
  used: boolean;
  incorrect: boolean;
  correct: boolean;
  flagged: boolean;
  omitted: boolean;
}

export type QuestionCategory = 'unused' | 'correct' | 'incorrect' | 'omitted';

export interface QuestionMetrics {
  unused: number;
  correct: number;
  incorrect: number;
  omitted: number;
  marked: number;
}

// New types for metrics tracking
export interface QuestionMetricsEntry {
  status: QuestionCategory;
  lastAttemptDate?: string;
  isFlagged: boolean;
}

export interface QuestionMetricsStore {
  [questionId: string]: QuestionMetricsEntry;
}
