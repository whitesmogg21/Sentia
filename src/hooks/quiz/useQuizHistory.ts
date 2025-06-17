import { useState } from "react";
import { QuestionAttempt, Question } from "@/types/quiz";

type HistoryItem = {
  question: Question;
  attempt: QuestionAttempt;
};

interface UseReviewHistoryProps {
  onReviewStart?: () => void;
  onReviewEnd?: () => void;
}

export const useReviewHistoryQuiz = ({ onReviewStart, onReviewEnd }: UseReviewHistoryProps = {}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);
  const [inReview, setInReview] = useState(false);

  const startReview = (historyData: HistoryItem[]) => {
    const parsedQuestions = historyData.map(item => ({
      ...item.question,
      attempts: [item.attempt]
    }));

    setQuestions(parsedQuestions);
    setAttempts(historyData.map(item => item.attempt));
    setCurrentIndex(0);
    setShowExplanation(true);
    setInReview(true);

    onReviewStart?.();
  };

  const endReview = () => {
    setQuestions([]);
    setAttempts([]);
    setCurrentIndex(0);
    setShowExplanation(true);
    setInReview(false);
    onReviewEnd?.();
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleExplanation = () => {
    setShowExplanation(prev => !prev);
  };

  const jumpTo = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  return {
    currentQuestion: questions[currentIndex],
    currentAttempt: attempts[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    inReview,
    showExplanation,
    startReview,
    endReview,
    goToNext,
    goToPrev,
    toggleExplanation,
    jumpTo
  };
};
