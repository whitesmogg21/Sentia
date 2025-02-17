
import React from 'react';
import { Question } from "@/types/quiz";
import QuestionView from "./QuestionView";
import ExplanationView from "./ExplanationView";
import QuizController from "./QuizController";
import ProgressBar from "../ProgressBar";
import QuestionsSidebar from "./QuestionsSidebar";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuizContentProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isPaused: boolean;
  showExplanation: boolean;
  timerEnabled: boolean;
  timePerQuestion: number;
  isFlagged: boolean;
  onAnswerClick: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onPause: () => void;
  onQuit: () => void;
  onTimeUp: () => void;
  onToggleFlag: () => void;
}

const QuizContent = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  isPaused,
  showExplanation,
  timerEnabled,
  timePerQuestion,
  isFlagged,
  onAnswerClick,
  onNavigate,
  onPause,
  onQuit,
  onTimeUp,
  onToggleFlag
}: QuizContentProps) => {
  const [showQuitDialog, setShowQuitDialog] = React.useState(false);
  const [answeredQuestions, setAnsweredQuestions] = React.useState<Array<{ questionIndex: number; isCorrect: boolean }>>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleAnswerClick = (index: number) => {
    if (!isAnswered) {
      setAnsweredQuestions(prev => [
        ...prev.filter(q => q.questionIndex !== currentQuestionIndex),
        {
          questionIndex: currentQuestionIndex,
          isCorrect: index === currentQuestion.correctAnswer
        }
      ]);
      onAnswerClick(index);
    }
  };

  const handleQuestionClick = (index: number) => {
    if (!timerEnabled) {
      if (index > currentQuestionIndex) {
        onNavigate('next');
      } else if (index < currentQuestionIndex) {
        onNavigate('prev');
      }
    }
  };

  const handleQuizComplete = () => {
    setShowQuitDialog(false);
    onQuit();
  };

  return (
    <div className="fixed inset-0 bg-background">
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-0" : "ml-[160px]"
      )}>
        <div className="container mx-auto p-6 h-full flex flex-col">
          <div className="mb-4">
            <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6">
              <QuestionView
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
                isPaused={isPaused}
                onAnswerClick={handleAnswerClick}
              />

              {isAnswered && showExplanation && (
                <ExplanationView question={currentQuestion} />
              )}
            </div>
          </div>

          <QuizController
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            isAnswered={isAnswered}
            isPaused={isPaused}
            isFlagged={isFlagged}
            timerEnabled={timerEnabled}
            timeLimit={timePerQuestion}
            onTimeUp={onTimeUp}
            onNavigate={onNavigate}
            onPause={onPause}
            onQuit={() => setShowQuitDialog(true)}
            onToggleFlag={onToggleFlag}
          />
        </div>
      </div>

      <div className={cn(
        "fixed left-0 top-0 h-full transition-transform duration-300",
        sidebarCollapsed && "-translate-x-full"
      )}>
        <QuestionsSidebar
          totalQuestions={totalQuestions}
          currentQuestionIndex={currentQuestionIndex}
          answeredQuestions={answeredQuestions}
          onQuestionClick={handleQuestionClick}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-10 top-4 bg-background border"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Do you really want to end the quiz? This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, continue quiz</AlertDialogCancel>
            <AlertDialogAction onClick={handleQuizComplete}>
              Yes, end quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizContent;
