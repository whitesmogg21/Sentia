
import React from 'react';
import { Question } from "@/types/quiz";
import QuestionView from "./QuestionView";
import ExplanationView from "./ExplanationView";
import QuizController from "./QuizController";
import ProgressBar from "../ProgressBar";
import QuestionsSidebar from "./QuestionsSidebar";

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
  // Track answered questions
  const [answeredQuestions, setAnsweredQuestions] = React.useState<Array<{ questionIndex: number; isCorrect: boolean }>>([]);

  // Update answered questions when an answer is selected
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

  // Handle sidebar question click
  const handleQuestionClick = (index: number) => {
    if (index > currentQuestionIndex) {
      onNavigate('next');
    } else if (index < currentQuestionIndex) {
      onNavigate('prev');
    }
  };

  return (
    <div className="fixed inset-0 bg-background">
      <div className="ml-[160px] container mx-auto p-6 h-full flex flex-col">
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
          onNavigate={onNavigate}
          onPause={onPause}
          onQuit={onQuit}
          timerEnabled={timerEnabled}
          timeLimit={timePerQuestion}
          onTimeUp={onTimeUp}
        />
      </div>

      <QuestionsSidebar
        totalQuestions={totalQuestions}
        currentQuestionIndex={currentQuestionIndex}
        answeredQuestions={answeredQuestions}
        onQuestionClick={handleQuestionClick}
      />
    </div>
  );
};

export default QuizContent;
