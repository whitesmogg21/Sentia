
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  showScore: boolean;
  questions: Question[];
}
