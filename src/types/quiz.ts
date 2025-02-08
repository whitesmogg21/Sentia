
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  qbankId: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  showScore: boolean;
  questions: Question[];
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
