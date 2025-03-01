
import { useEffect } from "react";
import Dashboard from "../components/Dashboard";
import ScoreCard from "../components/ScoreCard";
import QuizContent from "@/components/quiz/QuizContent";
import { useQuizStore } from "@/store/quiz/quizStore";
import { useQBankStore } from "@/store/qbank/qbankStore";
import { useMetricsStore } from "@/store/metrics/metricsStore";

const Index = () => {
  const {
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
    history,
    answerQuestion,
    handleAnswerTimeout,
    navigateQuestion,
    togglePause,
    endQuiz,
    resetQuiz,
    toggleFlag
  } = useQuizStore();
  
  const { updateQuestionAttempts } = useQBankStore();
  const { calculateMetrics } = useMetricsStore();
  
  // Calculate metrics when component mounts and when quiz history changes
  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics, history]);
  
  // Update the qbank with the quiz results when the quiz is completed
  useEffect(() => {
    if (showScore && currentQuestions.length > 0) {
      const qbankId = currentQuestions[0].qbankId;
      const attempts = currentQuestions.map((question) => ({
        questionId: question.id,
        selectedAnswer: question.attempts?.[question.attempts.length - 1]?.selectedAnswer ?? null,
        isCorrect: question.attempts?.[question.attempts.length - 1]?.isCorrect ?? false,
        isFlagged: Boolean(question.isFlagged),
        tags: question.tags
      }));
      
      updateQuestionAttempts(qbankId, attempts);
    }
  }, [showScore, currentQuestions, updateQuestionAttempts]);
  
  if (!inQuiz) {
    return <Dashboard />;
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
          isCorrect: question.attempts?.[question.attempts.length - 1]?.isCorrect ?? false,
          isFlagged: Boolean(question.isFlagged)
        }))}
        onEnd={resetQuiz}
      />
    );
  }
  
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isFlagged = Boolean(currentQuestion?.isFlagged);
  
  return (
    <QuizContent
      currentQuestion={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={currentQuestions.length}
      selectedAnswer={selectedAnswer}
      isAnswered={isAnswered}
      isPaused={isPaused}
      showExplanation={showExplanation}
      timerEnabled={timerEnabled}
      timePerQuestion={timePerQuestion}
      isFlagged={isFlagged}
      onAnswerClick={answerQuestion}
      onNavigate={navigateQuestion}
      onPause={togglePause}
      onQuit={endQuiz}
      onTimeUp={handleAnswerTimeout}
      onToggleFlag={toggleFlag}
    />
  );
};

export default Index;
