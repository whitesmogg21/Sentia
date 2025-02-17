
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  qbankId?: string; // Made optional since questions can exist without being in a QBank
  tags: string[];
  isFlagged?: boolean;
  attempts?: QuestionAttempt[];
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    showWith: 'question' | 'answer';
  };
  explanation?: string;
}

export interface QuestionAttempt {
  date: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
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
  }[];
}

export interface QBank {
  id: string;
  name: string;
  description: string;
  tags: string[]; // Added tags to QBank
  questions: Question[];
}

export interface QuestionFilter {
  unused: boolean;
  used: boolean;
  incorrect: boolean;
  correct: boolean;
  flagged: boolean;
  omitted: boolean;
  tags: string[]; // Added tags filter
}

export type QuestionCategory = 'unused' | 'correct' | 'incorrect' | 'omitted';

export interface QuestionMetrics {
  unused: number;
  correct: number;
  incorrect: number;
  omitted: number;
  marked: number;
}
