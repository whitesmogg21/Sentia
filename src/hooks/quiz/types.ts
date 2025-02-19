
import { Question, QuizHistory } from "@/types/quiz";

export interface UseQuizProps {
  onQuizComplete?: (history: QuizHistory) => void;
  onQuizStart?: () => void;
  onQuizEnd?: () => void;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  showScore: boolean;
  selectedAnswer: number | null;
  isAnswered: boolean;
  inQuiz: boolean;
  questions: Question[];
  tutorMode: boolean;
  showExplanation: boolean;
  isPaused: boolean;
  timerEnabled: boolean;
  timePerQuestion: number;
  initialTimeLimit: number;
}
