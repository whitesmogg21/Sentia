
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface QuestionsSidebarProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: Array<{ questionIndex: number; isCorrect: boolean }>;
  onQuestionClick: (index: number) => void;
}

const QuestionsSidebar = ({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  onQuestionClick,
}: QuestionsSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-accent shadow-lg transition-all duration-300",
        isCollapsed ? "w-12" : "w-[160px]"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute -right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-white dark:bg-accent shadow-md",
          "hover:bg-gray-100 dark:hover:bg-accent-foreground/10"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? 
          <ChevronRightIcon className="h-4 w-4" /> : 
          <ChevronLeftIcon className="h-4 w-4" />
        }
      </Button>

      <div className={cn(
        "h-full overflow-y-auto p-4",
        isCollapsed && "hidden"
      )}>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const isAnswered = answeredQuestions.find(
              (q) => q.questionIndex === index
            );
            const isCurrent = currentQuestionIndex === index;

            return (
              <button
                key={index}
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "aspect-square rounded flex items-center justify-center text-sm font-medium transition-colors",
                  isCurrent && "ring-2 ring-primary",
                  isAnswered?.isCorrect
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : isAnswered
                    ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    : "bg-gray-100 dark:bg-accent-foreground/10 text-gray-600 dark:text-gray-400",
                  "hover:opacity-80"
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionsSidebar;
