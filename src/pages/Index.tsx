
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
    isMarked,
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleRestart,
    handleQuizNavigation,
    handleToggleMark
  } = useQuiz({ onQuizComplete, onQuizStart, onQuizEnd });

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
        attempts={currentQuestions.map((q, index) => ({
          questionId: q.id,
          selectedAnswer: index === currentQuestionIndex ? selectedAnswer : null,
          isCorrect: index === currentQuestionIndex ? selectedAnswer === q.correctAnswer : false,
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
      isMarked={isMarked}
      onAnswerClick={handleAnswerClick}
      onNavigate={handleQuizNavigation}
      onPause={handlePause}
      onQuit={handleQuit}
      onTimeUp={handleAnswerTimeout}
      onToggleMark={handleToggleMark}
    />
  );
};

export default Index;
