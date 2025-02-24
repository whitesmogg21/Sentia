import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Question } from "@/types/quiz";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsRight, Flag, Pause, Play, Redo, Timer, TimerOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/ColorPicker";
import { FormulaTable } from "./FormulaTable";
import { LabValuesTable } from "./LabValuesTable";

interface QuizContentProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isPaused: boolean;
  showExplanation: boolean;
  timerEnabled: boolean;
  timePerQuestion: number;
  isFlagged: boolean;
  onAnswerClick: (answer: string) => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  onPause: () => void;
  onQuit: () => void;
  onTimeUp: () => void;
  onToggleFlag: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({
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
  onToggleFlag,
}) => {
  const [timeRemaining, setTimeRemaining] = React.useState(timePerQuestion);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (timerEnabled && !isPaused) {
      const timerId = setInterval(() => {
        setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);

      if (timeRemaining === 0) {
        clearInterval(timerId);
        onTimeUp();
      }

      return () => clearInterval(timerId);
    }
  }, [timerEnabled, isPaused, timeRemaining, onTimeUp]);

  React.useEffect(() => {
    setTimeRemaining(timePerQuestion);
  }, [currentQuestionIndex, timePerQuestion]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleHighlightChange = (color: string | null) => {
    setSelectedColor(color);
  };

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <Card className="bg-cardBg text-cardText">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </CardTitle>
          <CardDescription>
            {currentQuestion.category} - {currentQuestion.difficulty}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {currentQuestion.tags.join(', ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFlag}
            >
              {isFlagged ? 'Unflag' : 'Flag'} <Flag className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Separator />

          <ScrollArea className="h-[150px] md:h-[200px] lg:h-[250px] w-full rounded-md border">
            <div className="p-4">
              {currentQuestion.questionText}
            </div>
          </ScrollArea>

          {currentQuestion.image && (
            <img
              src={currentQuestion.image}
              alt="Question Image"
              className="w-full rounded-md"
            />
          )}

          <div className="grid gap-2">
            {currentQuestion.answers.map((answer) => (
              <Button
                key={answer}
                variant={
                  isAnswered
                    ? answer === currentQuestion.correctAnswer
                      ? 'default'
                      : selectedAnswer === answer
                        ? 'destructive'
                        : 'secondary'
                    : selectedAnswer === answer
                      ? 'secondary'
                      : 'outline'
                }
                onClick={() => onAnswerClick(answer)}
                disabled={isAnswered}
                className={cn(
                  selectedColor && selectedAnswer === answer ? `bg-[${selectedColor}]` : '',
                  "justify-start"
                )}
              >
                {answer}
                {isAnswered && answer === currentQuestion.correctAnswer && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            ))}
          </div>

          {showExplanation && (
            <div className="rounded-md border p-4">
              <h4 className="text-sm font-bold">Explanation</h4>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          {timerEnabled && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span>Time Remaining: {formatTime(timeRemaining)}</span>
              </div>
              <Button variant="outline" size="icon" onClick={onPause}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => onNavigate('prev')}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <LabValuesTable />
            <FormulaTable />
            <ColorPicker
              selectedColor={selectedColor}
              onSelect={handleHighlightChange}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => onNavigate('next')}
            disabled={isAnswered === false}
          >
            Next <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizContent;
