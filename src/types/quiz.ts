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
  selectedAnswer: number | null;
  isCorrect: boolean;
  date: string;
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
  score: number;
  totalQuestions: number;
  qbankId: string;
  questionAttempts: {
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
    isFlagged: boolean;
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
  correct: boolean;
  incorrect: boolean;
  omitted: boolean;
  flagged: boolean;
}

export type QuestionCategory = 'unused' | 'correct' | 'incorrect' | 'omitted';

export interface QuestionMetrics {
  unused: number;
  correct: number;
  incorrect: number;
  omitted: number;
  marked: number;
}
