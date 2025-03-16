
import { Question, QuizHistory, QuestionAttempt } from "@/types/quiz";

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
  currentQuestions: Question[];
  tutorMode: boolean;
  showExplanation: boolean;
  isPaused: boolean;
  timerEnabled: boolean;
  timePerQuestion: number;
  initialTimeLimit: number;
  quizStartTime?: string;
  questionAttempts?: QuestionAttempt[];
}
