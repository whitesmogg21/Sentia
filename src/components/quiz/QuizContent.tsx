
import React, { useState, useEffect } from 'react';
import { Question } from "@/types/quiz";
import QuestionView from "./QuestionView";
import ExplanationView from "./ExplanationView";
import QuizController from "./QuizController";
import ProgressBar from "../ProgressBar";
import QuestionsSidebar from "./QuestionsSidebar";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useTheme } from "@/components/ThemeProvider";
import FormulaTable from "./FormulaTable";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const highlightColors = [
  { name: 'yellow', class: 'bg-yellow-200 dark:bg-yellow-900/50' },
  { name: 'green', class: 'bg-green-200 dark:bg-green-900/50' },
  { name: 'blue', class: 'bg-blue-200 dark:bg-blue-900/50' },
  { name: 'purple', class: 'bg-purple-200 dark:bg-purple-900/50' },
];

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
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { theme, setTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState(highlightColors[0]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) return;
      
      try {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = `${selectedColor.class} cursor-pointer`;
        span.onclick = (e) => {
          const target = e.target as HTMLSpanElement;
          const parent = target.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(target.textContent || ''), target);
          }
          e.stopPropagation();
        };
        range.surroundContents(span);
      } catch (e) {
        console.error('Failed to highlight:', e);
      } finally {
        selection.removeAllRanges();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [selectedColor]);

  const handleAnswerClick = (index: number) => {
    if (!isAnswered && !isPaused) {
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
    if (index > currentQuestionIndex) {
      onNavigate('next');
    } else if (index < currentQuestionIndex) {
      onNavigate('prev');
    }
  };

  const handleQuizComplete = () => {
    setShowQuitDialog(false);
    onQuit();
  };

  return (
    <div className="fixed inset-0 bg-background dark:bg-background">
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-0" : "ml-[160px]"
      )}>
        <div className="container mx-auto p-6 h-full flex flex-col">
          <div className="flex items-center justify-end gap-2 mb-4">
            <FormulaTable />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "bg-background border relative p-0 overflow-hidden cursor-pointer",
                    selectedColor.class
                  )}
                  aria-label="Select highlight color"
                >
                  <div className="w-4 h-4 rounded-full pointer-events-none" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex gap-2 p-2">
                  {highlightColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-6 h-6 rounded-full border border-gray-200 cursor-pointer select-none',
                        color.class,
                        selectedColor.name === color.name && 'ring-2 ring-primary'
                      )}
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="bg-background border"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="bg-background border"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="mb-4">
            <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
          </div>

          <div className="flex-1 overflow-y-auto relative">
            {isPaused && (
              <div className="absolute inset-0 bg-gray-800/50 dark:bg-black/50 flex items-center justify-center z-10">
                <p className="text-white text-lg font-bold">Quiz is paused</p>
              </div>
            )}
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
        "fixed left-0 top-0 h-full w-[160px] transition-transform duration-300",
        sidebarCollapsed && "-translate-x-[160px]"
      )}>
        <QuestionsSidebar
          totalQuestions={totalQuestions}
          currentQuestionIndex={currentQuestionIndex}
          answeredQuestions={answeredQuestions}
          onQuestionClick={handleQuestionClick}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 transition-all duration-300 bg-background border",
          sidebarCollapsed ? "left-4" : "left-[150px]"
        )}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Do you really want to end the quiz? This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowQuitDialog(false)}>No, continue quiz</AlertDialogCancel>
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
