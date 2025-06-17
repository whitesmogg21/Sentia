import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause, XCircle, Flag } from "lucide-react";
import Timer from "./Timer";
import { useEffect } from 'react';

interface QuizControllerProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isAnswered: boolean;
  isPaused: boolean;
  isFlagged: boolean;
  timerEnabled: boolean;
  sessionTimeLimit: number;
  sessionTimerToggle: boolean;
  timeLimit: number;
  onTimeUp: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onPause: () => void;
  onQuit: () => void;
  onForceQuit: () => void;
  onToggleFlag: () => void;
}

const QuizController = ({
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  isPaused,
  isFlagged,
  timerEnabled,
  sessionTimeLimit,
  sessionTimerToggle,
  timeLimit,
  onTimeUp,
  onNavigate,
  onPause,
  onQuit,
  onForceQuit,
  onToggleFlag,
}: QuizControllerProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for space to avoid page scrolling
      if (e.key === ' ') {
        e.preventDefault();
      }

      // Convert to lowercase for case-insensitive comparison
      const key = e.key.toLowerCase();

      // Navigation shortcuts
      if (key === 'p' && currentQuestionIndex > 0 && !timerEnabled) {
        onNavigate('prev');
      } else if (key === 'n' && currentQuestionIndex < totalQuestions - 1) {
        onNavigate('next');
      } else if (key === ' ') {
        onPause();
      } else if (key === 'f') {
        onToggleFlag();
      } else if (key === 'e') {
        // Confirm before quitting
        // if (confirm('Are you sure you want to end the quiz?')) {
          onQuit();
        // }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    currentQuestionIndex,
    totalQuestions,
    timerEnabled,
    onNavigate,
    onPause,
    onToggleFlag,
    onQuit
  ]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="w-32">
          {(timerEnabled || sessionTimerToggle) && (
            <Timer
              timeLimit={timerEnabled ? timeLimit : undefined}
              sessionTimerToggle={sessionTimerToggle}
              sessionTimeLimit={sessionTimeLimit}
              isPaused={isPaused}
              onTimeUp={onTimeUp}
              onQuit={onForceQuit}
            />
          )}
        </div>
        
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onNavigate('prev')}
            disabled={currentQuestionIndex === 0 || timerEnabled}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous (P)
          </Button>
          <Button
            variant="outline"
            onClick={onToggleFlag}
            className={`flex items-center gap-2 ${isFlagged ? 'bg-yellow-100 border-yellow-400' : ''}`}
          >
            <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-500' : ''}`} />
            {isFlagged ? 'Flagged (F)' : 'Flag (F)'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('next')}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="flex items-center gap-2"
          >
            Next (N)
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 w-32 justify-end">
          <Button
            variant="outline"
            onClick={onPause}
            className="flex items-center gap-2"
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4" />
                Resume (Space)
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause (Space)
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={onQuit}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            End (E)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizController;