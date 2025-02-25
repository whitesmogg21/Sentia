
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
    <div className="fixed bottom-0 left-0 right-0 bg-