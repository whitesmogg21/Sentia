
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  qbankId: string;
  isMarked?: boolean;
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
  questions: Question[];
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
