import { useState } from "react";
import { QuizHistory } from "../types/quiz";
import { qbanks } from "../data/questions";
import Dashboard from "../components/Dashboard";
import ScoreCard from "../components/ScoreCard";
import QuizContent from "@/components/quiz/QuizContent";
import { useQuiz } from "@/hooks/quiz";

interface IndexProps {
  quizHistory?: QuizHistory[];
  onQuizComplete?: (history: QuizHistory) => void;
  onQuizStart?: () => void;
  onQuizEnd?: () => void;
}

const Index = ({ quizHistory = [], onQuizComplete, onQuizStart, onQuizEnd }: IndexProps) => {
  const {
    currentQuestionIndex,
    score,
    showScore,
    selectedAnswer,
    isAnswered,
    inQuiz,
    currentQuestions,
    showExplanation,
    isPaused,
    timerEnabled,
    timePerQuestion,
    isFlagged,
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleRestart,
    handleQuizNavigation,
    handleToggleFlag
  } = useQuiz({ onQuizComplete, onQuizStart, onQuizEnd });

  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitConfirm = () => {
    setShowQuitDialog(false);
    handleQuit();
  };

  const handleQuitCancel = () => {
    setShowQuitDialog(false);
  };

  if (!inQuiz) {
    return (
      <Dashboard
        qbanks={qbanks}
        quizHistory={quizHistory}
        onStartQuiz={handleStartQuiz}
      />
    );
  }

  if (showScore) {
    return (
      <ScoreCard 
        score={score} 
        total={currentQuestions.length} 
        questions={currentQuestions}
        attempts={currentQuestions.map((question) => ({
          questionId: question.id,
          selectedAnswer: question.attempts?.[question.attempts.length - 1]?.selectedAnswer ?? null,
          isCorrect: question.attempts?.[question.attempts.length - 1]?.isCorrect ?? false
        }))}
        onEnd={handleRestart}
      />
    );
  }

  return (
    <QuizContent
      currentQuestion={currentQuestions[currentQuestionIndex]}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={currentQuestions.length}
      selectedAnswer={selectedAnswer}
      isAnswered={isAnswered}
      isPaused={isPaused}
      showExplanation={showExplanation}
      timerEnabled={timerEnabled}
      timePerQuestion={timePerQuestion}
      isFlagged={isFlagged}
      onAnswerClick={handleAnswerClick}
      onNavigate={handleQuizNavigation}
      onPause={handlePause}
      onQuit={handleQuit}
      onTimeUp={handleAnswerTimeout}
      onToggleFlag={handleToggleFlag}
    />
  );
};

export default Index;
