
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  qbankId: string;
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    showWith: 'question' | 'answer';
  };
  explanation?: string;
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
}

export interface QBank {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

