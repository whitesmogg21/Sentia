
import { Question, QuizHistory } from "@/types/quiz";
import { QuizState } from "./types";
import { qbanks } from "@/data/questions";

export const generateQuestionAttempts = (
  questions: Question[],
  answers: (number | null)[]
): QuizHistory['questionAttempts'] => {
  return questions.map((question, index) => ({
    questionId: question.id,
    selectedAnswer: answers[index],
    isCorrect: answers[index] === question.correctAnswer,
    isFlagged: question.isFlagged || false
  }));
};

export const calculateScore = (questionAttempts: QuizHistory['questionAttempts']): number => {
  return questionAttempts.filter(attempt => attempt.isCorrect).length;
};

export const initializeQuiz = (
  qbankId: string,
  questionCount: number,
  isTutorMode: boolean,
  withTimer: boolean,
  timeLimit: number
): Partial<QuizState> | null => {
  const selectedQBank = qbanks.find(qb => qb.id === qbankId);
  if (!selectedQBank) return null;

  // Shuffle and slice questions
  const shuffledQuestions = [...selectedQBank.questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, questionCount);

  return {
    questions: shuffledQuestions,
    inQuiz: true,
    currentQuestionIndex: 0,
    score: 0,
    showScore: false,
    selectedAnswer: null,
    isAnswered: false,
    tutorMode: isTutorMode,
    showExplanation: false,
    isPaused: false,
    timerEnabled: withTimer,
    timePerQuestion: timeLimit,
    initialTimeLimit: timeLimit
  };
};

export const handleQuestionAttempt = (
  questions: Question[],
  currentIndex: number,
  selectedAnswer: number | null,
  isTimeout: boolean = false
): Question[] => {
  const updatedQuestions = [...questions];
  const currentQuestion = updatedQuestions[currentIndex];

  if (currentQuestion) {
    currentQuestion.attempts = [
      ...(currentQuestion.attempts || []),
      {
        selectedAnswer,
        isCorrect: selectedAnswer === currentQuestion.correctAnswer,
        date: new Date().toISOString()
      }
    ];
  }

  return updatedQuestions;
};

export const createQuizHistory = (state: QuizState, finalAnswer: number | null): QuizHistory => {
  const answers = state.questions.map((_, index) => {
    if (index === state.currentQuestionIndex) {
      return finalAnswer;
    }
    const question = state.questions[index];
    return question.attempts?.[question.attempts.length - 1]?.selectedAnswer ?? null;
  });

  return {
    id: `quiz-${Date.now()}`, // Generate a unique ID
    date: new Date().toISOString(),
    score: state.score,
    totalQuestions: state.questions.length,
    qbankId: state.questions[0]?.qbankId || '',
    questionAttempts: generateQuestionAttempts(state.questions, answers)
  };
};
