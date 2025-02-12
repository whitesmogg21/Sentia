
import { Question } from "@/types/quiz";
import QuestionView from "./QuestionView";
import ExplanationView from "./ExplanationView";
import QuizController from "./QuizController";
import ProgressBar from "../ProgressBar";

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
  onAnswerClick: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onPause: () => void;
  onQuit: () => void;
  onTimeUp: () => void;
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
  onAnswerClick,
  onNavigate,
  onPause,
  onQuit,
  onTimeUp
}: QuizContentProps) => {
  return (
    <div className="fixed inset-0 bg-background">
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
              onAnswerClick={onAnswerClick}
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
          onNavigate={onNavigate}
          onPause={onPause}
          onQuit={onQuit}
          timerEnabled={timerEnabled}
          timeLimit={timePerQuestion}
          onTimeUp={onTimeUp}
        />
      </div>
    </div>
  );
};

export default QuizContent;
