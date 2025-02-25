
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause, XCircle, Flag } from "lucide-react";
import Timer from "./Timer";

interface QuizControllerProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isAnswered: boolean;
  isPaused: boolean;
  isFlagged: boolean;
  timerEnabled: boolean;
  timeLimit: number;
  onTimeUp: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onPause: () => void;
  onQuit: () => void;
  onToggleFlag: () => void;
}

const QuizController = ({
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  isPaused,
  isFlagged,
  timerEnabled,
  timeLimit,
  onTimeUp,
  onNavigate,
  onPause,
  onQuit,
  onToggleFlag
}: QuizControllerProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate('prev')}
          disabled={currentQuestionIndex === 0}
          aria-label="Previous question"
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate('next')}
          disabled={currentQuestionIndex === totalQuestions - 1 && !isAnswered}
          aria-label="Next question"
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {timerEnabled && (
          <Timer
            timeLimit={timeLimit}
            isPaused={isPaused}
            onTimeUp={onTimeUp}
          />
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFlag}
          className={isFlagged ? "text-yellow-500" : ""}
          aria-label="Flag question"
        >
          <Flag />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onPause}
          aria-label={isPaused ? "Resume quiz" : "Pause quiz"}
        >
          {isPaused ? <Play /> : <Pause />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onQuit}
          className="text-destructive"
          aria-label="Quit quiz"
        >
          <XCircle />
        </Button>
      </div>
    </div>
  );
};

export default QuizController;

