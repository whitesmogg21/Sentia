
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface QuizOptionProps {
  option: string;
  selected: boolean;
  correct?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const QuizOption = ({ option, selected, correct, onClick, disabled }: QuizOptionProps) => {
  const getBackgroundColor = () => {
    if (!selected) return "bg-secondary dark:bg-gray-700 hover:bg-secondary/80 dark:hover:bg-gray-600";
    if (correct === undefined) return "bg-primary dark:bg-primary/80 hover:bg-primary/90";
    return correct ? "bg-success/20 dark:bg-green-950" : "bg-error/20 dark:bg-red-950";
  };

  const showStrikethrough = selected && correct === false;
  const showCheckmark = selected && correct === true;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "w-full p-4 rounded-lg text-left transition-all duration-200 relative",
        getBackgroundColor(),
        "text-secondary-foreground font-medium flex items-center gap-3",
        disabled && "cursor-not-allowed opacity-75",
        showStrikethrough && "line-through",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={cn(
        "w-6 h-6 rounded border flex items-center justify-center flex-shrink-0",
        selected ? "border-none" : "border-gray-300 dark:border-gray-600",
        correct === true && selected ? "bg-success dark:bg-green-600" : "",
        correct === false && selected ? "bg-error dark:bg-red-600" : "",
        correct === undefined && selected ? "bg-primary dark:bg-primary/80" : ""
      )}>
        {showCheckmark && <Check className="w-4 h-4 text-white" />}
        {showStrikethrough && <X className="w-4 h-4 text-white" />}
      </div>
      <span className={cn(
        "flex-1",
        showStrikethrough && "text-gray-500 dark:text-gray-400"
      )}>
        {option}
      </span>
      {selected && correct !== undefined && (
        <div className={cn(
          "absolute right-4 top-1/2 transform -translate-y-1/2",
          correct ? "text-success dark:text-green-400" : "text-error dark:text-red-400"
        )}>
          {correct ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </div>
      )}
    </motion.button>
  );
};

export default QuizOption;
