
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
      attempts: []
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
  optionIndex: number | null
): QuizHistory => {
  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    score: state.score,
    totalQuestions: state.currentQuestions.length,
    qbankId: state.currentQuestions[0].qbankId,
    questionAttempts: state.currentQuestions.map((q, index) => ({
      questionId: q.id,
      selectedAnswer: index === state.currentQuestionIndex ? optionIndex : q.attempts?.[0]?.selectedAnswer ?? null,
      isCorrect: index === state.currentQuestionIndex ? optionIndex === q.correctAnswer : q.attempts?.[0]?.isCorrect ?? false,
      isFlagged: Boolean(q.isFlagged),
      tags: q.tags || [] // Provide empty array as default
    }))
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

  const attempt = {
    questionId: question.id,
    selectedAnswer: optionIndex,
    isCorrect,
    date: new Date().toISOString(),
    isFlagged: Boolean(question.isFlagged),
    tags: question.tags || [] // Provide empty array as default
  };

  question.attempts = [
    ...(question.attempts || []),
    attempt
  ];

  return newQuestions;
};
