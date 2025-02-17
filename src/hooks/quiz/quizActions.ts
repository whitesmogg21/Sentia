
import { Question, QuizHistory } from "@/types/quiz";
import { QuizState } from "./types";
import { qbanks } from "@/data/questions";
import { toast } from "@/components/ui/use-toast";

export const initializeQuiz = (
  qbankId: string,
  questionCount: number,
  isTutorMode: boolean,
  withTimer: boolean,
  timeLimit: number
): Partial<QuizState> | null => {
  const selectedQBank = qbanks.find((qb) => qb.id === qbankId);
  if (!selectedQBank) {
    toast({
      title: "Error",
      description: "Selected question bank not found",
      variant: "destructive",
    });
    return null;
  }

  if (questionCount > selectedQBank.questions.length) {
    toast({
      title: "Error",
      description: "Not enough questions in the selected question bank",
      variant: "destructive",
    });
    return null;
  }

  const shuffledQuestions = [...selectedQBank.questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, questionCount)
    .map(q => ({
      ...q,
      attempts: q.attempts || []
    }));

  return {
    currentQuestions: shuffledQuestions,
    currentQuestionIndex: 0,
    score: 0,
    showScore: false,
    selectedAnswer: null,
    isAnswered: false,
    tutorMode: isTutorMode,
    timerEnabled: withTimer,
    timePerQuestion: timeLimit,
    initialTimeLimit: timeLimit,
    inQuiz: true,
    isPaused: false,
  };
};

export const createQuizHistory = (
  state: QuizState,
  lastAnswerIndex: number | null
): QuizHistory => {
  const currentQuestion = state.currentQuestions[state.currentQuestionIndex];
  
  // Create attempts array with all questions
  const questionAttempts = state.currentQuestions.map((q, index) => {
    let selectedAnswer: number | null = null;
    let isCorrect = false;

    if (index < state.currentQuestionIndex) {
      // For previous questions, use the recorded attempt
      selectedAnswer = q.attempts?.[q.attempts.length - 1]?.selectedAnswer ?? null;
      isCorrect = q.attempts?.[q.attempts.length - 1]?.isCorrect ?? false;
    } else if (index === state.currentQuestionIndex) {
      // For current question, use the last answer index
      selectedAnswer = lastAnswerIndex;
      isCorrect = lastAnswerIndex === q.correctAnswer;
    }
    // Future questions remain null/false

    return {
      questionId: q.id,
      selectedAnswer,
      isCorrect
    };
  });

  return {
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
    score: state.score,
    totalQuestions: state.currentQuestions.length,
    qbankId: state.currentQuestions[0].qbankId,
    questionAttempts
  };
};

export const handleQuestionAttempt = (
  questions: Question[],
  currentIndex: number,
  optionIndex: number | null,
  isTimeout: boolean = false
): Question[] => {
  const newQuestions = [...questions];
  const question = newQuestions[currentIndex];
  const isCorrect = !isTimeout && optionIndex === question.correctAnswer;

  question.attempts = [
    ...(question.attempts || []),
    {
      date: new Date().toISOString(),
      selectedAnswer: optionIndex,
      isCorrect
    }
  ];

  return newQuestions;
};
