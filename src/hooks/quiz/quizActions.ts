import { Question, QuizHistory } from "@/types/quiz";

export const generateQuestionAttempts = (
  questions: Question[],
  answers: (number | null)[]
): QuizHistory['questionAttempts'] => {
  return questions.map((question, index) => ({
    questionId: question.id,
    selectedAnswer: answers[index],
    isCorrect: answers[index] === question.correctAnswer,
    isFlagged: question.isFlagged || false // Added isFlagged property
  }));
};

export const calculateScore = (questionAttempts: QuizHistory['questionAttempts']): number => {
  return questionAttempts.filter(attempt => attempt.isCorrect).length;
};
