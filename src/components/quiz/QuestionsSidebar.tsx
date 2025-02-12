
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface QuestionsSidebarProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: {
    questionIndex: number;
    isCorrect: boolean;
  }[];
  onQuestionClick: (index: number) => void;
}

const QuestionsSidebar = ({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  onQuestionClick,
}: QuestionsSidebarProps) => {
  return (
    <div className="fixed left-0 top-0 h-full w-[160px] bg-white border-r border-gray-200 shadow-lg">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Questions</h3>
        <p className="text-sm text-gray-500">Total: {totalQuestions}</p>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-64px)] p-3">
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const answered = answeredQuestions.find(
              (q) => q.questionIndex === index
            );
            
            return (
              <button
                key={index}
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all hover:opacity-80",
                  currentQuestionIndex === index && "ring-2 ring-primary",
                  answered?.isCorrect && "bg-green-100 text-green-700",
                  answered?.isCorrect === false && "bg-red-100 text-red-700",
                  !answered && "bg-gray-100 text-gray-700"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{index + 1}</span>
                  {answered && (
                    <div className="text-xs">
                      {answered.isCorrect ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
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
