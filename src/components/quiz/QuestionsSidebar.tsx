import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Question } from "@/types/quiz";
import { useEffect, useState } from "react";

interface QuestionsSidebarProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: {
    questionIndex: number;
    isCorrect: boolean;
  }[];
  onQuestionClick: (index: number) => void;
  currentQuestion?: Question;
  currentQuestions?: Question[]; // Add this to access all questions
}

const QuestionsSidebar = ({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  onQuestionClick,
  currentQuestion,
  currentQuestions = [] // Default to empty array
}: QuestionsSidebarProps) => {
  // Keep track of flagged questions in component state
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  
  // Update flagged status when currentQuestion changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.isFlagged) {
      setFlaggedQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: true
      }));
    } else if (currentQuestion && currentQuestionIndex in flaggedQuestions && !currentQuestion.isFlagged) {
      // If the question was flagged and is now unflagged, update state
      setFlaggedQuestions(prev => {
        const newState = {...prev};
        delete newState[currentQuestionIndex];
        return newState;
      });
    }
  }, [currentQuestion, currentQuestionIndex]);

  // Initialize flagged status from currentQuestions if available
  useEffect(() => {
    if (currentQuestions && currentQuestions.length > 0) {
      const flaggedState: Record<number, boolean> = {};
      currentQuestions.forEach((question, index) => {
        if (question.isFlagged) {
          flaggedState[index] = true;
        }
      });
      setFlaggedQuestions(flaggedState);
    }
  }, [currentQuestions]);
  
  return (
    <div className="fixed left-0 top-0 h-full w-[160px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Questions</h3>
        <p className="text-sm text-gray-500">Total: {totalQuestions}</p>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-64px)] p-3">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const answered = answeredQuestions.find(
              (q) => q.questionIndex === index
            );
            
            // Check if this question is flagged from our component state
            const isFlagged = flaggedQuestions[index] || false;
            
            return (
              <button
                key={index}
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "aspect-square flex items-center justify-center rounded text-sm font-medium transition-all hover:opacity-80",
                  currentQuestionIndex === index && "ring-2 ring-primary",
                  answered?.isCorrect && "bg-green-100 text-green-700",
                  answered?.isCorrect === false && "bg-red-100 text-red-700",
                  !answered && !isFlagged && "bg-gray-100 text-gray-700",
                  !answered && isFlagged && "bg-yellow-100 text-yellow-700"
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs">{index + 1}</span>
                  {answered && (
                    <div className="text-[10px]">
                      {answered.isCorrect ? (
                        <Check className="h-2 w-2" />
                      ) : (
                        <X className="h-2 w-2" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionsSidebar;