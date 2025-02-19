
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
    questions,
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
        total={questions.length} 
        questions={questions}
        attempts={questions.map((question) => ({
          questionId: question.id,
          selectedAnswer: question.attempts?.[question.attempts.length - 1]?.selectedAnswer ?? null,
          isCorrect: question.attempts?.[question.attempts.length - 1]?.selectedAnswer === question.correctAnswer,
          isFlagged: Boolean(question.isFlagged)
        }))}
        onEnd={handleRestart}
      />
    );
  }

  return (
    <QuizContent
      currentQuestion={questions[currentQuestionIndex]}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={questions.length}
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
