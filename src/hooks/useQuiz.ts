
import { useState } from "react";
import { Question, QuizHistory } from "@/types/quiz";
import { qbanks } from "@/data/questions";
import { toast } from "@/components/ui/use-toast";

interface UseQuizProps {
  onQuizComplete?: (history: QuizHistory) => void;
  onQuizStart?: () => void;
  onQuizEnd?: () => void;
}

export const useQuiz = ({ onQuizComplete, onQuizStart, onQuizEnd }: UseQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [inQuiz, setInQuiz] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [tutorMode, setTutorMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(60);

  const getCurrentQuestion = () => currentQuestions[currentQuestionIndex];

  const handleStartQuiz = (qbankId: string, questionCount: number, isTutorMode: boolean, withTimer: boolean, timeLimit: number) => {
    const selectedQBank = qbanks.find((qb) => qb.id === qbankId);
    if (!selectedQBank) {
      toast({
        title: "Error",
        description: "Selected question bank not found",
        variant: "destructive",
      });
      return;
    }

    if (questionCount > selectedQBank.questions.length) {
      toast({
        title: "Error",
        description: "Not enough questions in the selected question bank",
        variant: "destructive",
      });
      return;
    }

    const shuffledQuestions = [...selectedQBank.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount)
      .map(q => ({
        ...q,
        attempts: q.attempts || []
      }));

    setCurrentQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTutorMode(isTutorMode);
    setTimerEnabled(withTimer);
    setTimePerQuestion(timeLimit);
    setInQuiz(true);
    setIsPaused(false);
    onQuizStart?.();
  };

const handleAnswerTimeout = () => {
  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return;

  setCurrentQuestions(prev => {
    const newQuestions = [...prev];
    const question = newQuestions[currentQuestionIndex];
    question.attempts = [
      ...(question.attempts || []),
      {
        date: new Date().toISOString(),
        selectedAnswer: null,  // No answer selected
        isCorrect: false       // Marked as incorrect
      }
    ];
    return newQuestions;
  });

  // ✅ Move to next question and reset timer
  proceedToNextQuestion(null);
};

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered || isPaused) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setCurrentQuestions(prev => {
      const newQuestions = [...prev];
      const question = newQuestions[currentQuestionIndex];
      question.attempts = [...(question.attempts || []), {
        date: new Date().toISOString(),
        selectedAnswer: optionIndex,
        isCorrect
      }];
      return newQuestions;
    });

    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (tutorMode) {
      setShowExplanation(true);
    } else {
      proceedToNextQuestion(optionIndex);
    }
  };

  const proceedToNextQuestion = (optionIndex: number | null) => {
  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return;

  // ✅ Mark current question as incorrect if user didn't answer
  if (optionIndex === null) {
    setCurrentQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[currentQuestionIndex].attempts = [
        ...(newQuestions[currentQuestionIndex].attempts || []),
        {
          date: new Date().toISOString(),
          selectedAnswer: null,
          isCorrect: false  // Marked as incorrect
        }
      ];
      return newQuestions;
    });
  }

  if (currentQuestionIndex === currentQuestions.length - 1) {
    // ✅ If it's the last question, end the quiz
    const newQuizHistory: QuizHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      score: score + (optionIndex === currentQuestion.correctAnswer ? 1 : 0),
      totalQuestions: currentQuestions.length,
      qbankId: currentQuestion.qbankId,
      questionAttempts: currentQuestions.map((q, index) => ({
        questionId: q.id,
        selectedAnswer: index === currentQuestionIndex ? optionIndex : null,
        isCorrect: index === currentQuestionIndex ? optionIndex === q.correctAnswer : false,
      }))
    };
    onQuizComplete?.(newQuizHistory);
    setShowScore(true);
  } else {
    // ✅ Move to the next question
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowExplanation(false);

    // ✅ Reset the timer for the next question
    setTimePerQuestion(60); // Change this value if your default timer limit is different
  }
};

  const handleQuit = () => {
    const newQuizHistory: QuizHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      score,
      totalQuestions: currentQuestions.length,
      qbankId: currentQuestions[0].qbankId,
      questionAttempts: currentQuestions.map((question, index) => ({
        questionId: question.id,
        selectedAnswer: index === currentQuestionIndex ? selectedAnswer : null,
        isCorrect: index === currentQuestionIndex ? selectedAnswer === question.correctAnswer : false,
      }))
    };
    onQuizComplete?.(newQuizHistory);
    handleRestart();
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleRestart = () => {
    setInQuiz(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTutorMode(false);
    setIsPaused(false);
    onQuizEnd?.();
  };

  const handleQuizNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else if (direction === 'next' && currentQuestionIndex < currentQuestions.length - 1) {
      proceedToNextQuestion(selectedAnswer);
    }
  };

  return {
    currentQuestionIndex,
    score,
    showScore,
    selectedAnswer,
    isAnswered,
    inQuiz,
    currentQuestions,
    tutorMode,
    showExplanation,
    isPaused,
    timerEnabled,
    timePerQuestion,
    isMarked: getCurrentQuestion()?.isMarked || false,
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleRestart,
    handleQuizNavigation,
    handleToggleMark
  };
};
