
import { useState } from "react";
import { QuizHistory } from "../types/quiz";
import { qbanks } from "../data/questions";
import Dashboard from "../components/Dashboard";
import ScoreCard from "../components/ScoreCard";
import QuizContent from "../components/quiz/QuizContent";
import { useQuiz } from "@/hooks/quiz";
import { toast } from "@/components/ui/use-toast";

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
    handleToggleFlag,
    jumpToQuestion
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

  const startQuiz = (
    qbankId: string,
    questionCount: number,
    tutorMode: boolean,
    timerEnabled: boolean,
    timeLimit: number
  ) => {
    // Check for filtered QBank in localStorage
    const filteredQBankString = localStorage.getItem("filteredQBank");

    // If we have a filtered qbank, use that directly
    if (filteredQBankString) {
      const filteredQBank = JSON.parse(filteredQBankString);
      console.log(`Using filtered QBank with ${filteredQBank.questions.length} questions`);
      
      // Ensure we don't ask for more questions than are available
      const actualQuestionCount = Math.min(questionCount, filteredQBank.questions.length);
      
      // Randomize questions if we're selecting a subset
      let selectedQuestions;
      if (filteredQBank.questions.length > actualQuestionCount) {
        selectedQuestions = [...filteredQBank.questions]
          .sort(() => Math.random() - 0.5)
          .slice(0, actualQuestionCount);
      } else {
        selectedQuestions = [...filteredQBank.questions];
      }
      
      // Start the quiz with the filtered questions
      handleStartQuiz(
        qbankId,
        selectedQuestions,
        tutorMode,
        timerEnabled,
        timeLimit
      );
      
      // Notify parent component
      if (onQuizStart) {
        onQuizStart();
      }
      return;
    }
    
    // Fall back to regular QBank selection if no filtered QBank
    const selectedQBankString = localStorage.getItem("selectedQBank");
    let selectedQBank;

    if (selectedQBankString) {
      // Use the regular selected QBank
      selectedQBank = JSON.parse(selectedQBankString);
      console.log(`Using regular QBank with ${selectedQBank.questions.length} questions`);
    } else {
      // Find the QBank from our data if not in localStorage
      selectedQBank = qbanks.find(qb => qb.id === qbankId);
      console.log(`Using QBank from data with ${selectedQBank?.questions.length || 0} questions`);
    }

    if (!selectedQBank) {
      toast({
        title: "No Question Bank Selected",
        description: "Please select a question bank first.",
        variant: "destructive"
      });
      return;
    }

    console.log(`Starting quiz with bank: ${selectedQBank.name}`);
    console.log(`Questions requested: ${questionCount}`);

    // Make sure we have enough questions
    if (selectedQBank.questions.length === 0) {
      toast({
        title: "No Questions Available",
        description: "There are no questions available with the current filters.",
        variant: "destructive"
      });
      return;
    }

    // Randomize the questions and select the requested number
    let selectedQuestions;
    if (selectedQBank.questions.length > questionCount) {
      selectedQuestions = [...selectedQBank.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
    } else {
      selectedQuestions = [...selectedQBank.questions];
    }

    // Start the quiz with the selected questions
    handleStartQuiz(
      selectedQBank.id,
      selectedQuestions,
      tutorMode,
      timerEnabled,
      timeLimit
    );

    // Notify parent component
    if (onQuizStart) {
      onQuizStart();
    }
  };

  if (!inQuiz) {
    return (
      <Dashboard
        qbanks={qbanks}
        quizHistory={quizHistory}
        onStartQuiz={startQuiz}
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
          isCorrect: question.attempts?.[question.attempts.length - 1]?.selectedAnswer === question.correctAnswer,
          isFlagged: Boolean(question.isFlagged)
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
      onJumpToQuestion={jumpToQuestion}
    />
  );
};

export default Index;
