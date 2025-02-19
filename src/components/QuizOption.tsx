
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Strikethrough } from "lucide-react";

interface QuizOptionProps {
  option: string;
  selected: boolean;
  correct?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const QuizOption = ({ option, selected, correct, onClick, disabled }: QuizOptionProps) => {
  const showStrikethrough = selected && correct === false;

  return (
    <div className="flex items-center gap-3 my-2">
      {showStrikethrough && (
        <div className="text-error dark:text-error/80">
          <Strikethrough className="w-4 h-4" />
        </div>
      )}
      {!showStrikethrough && <div className="w-4" />} {/* Spacer to maintain alignment */}
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onClick}
        className={cn(
          "w-5 h-5 border rounded flex items-center justify-center cursor-pointer flex-shrink-0",
          !selected && "border-gray-300 dark:border-gray-600",
          selected && correct === undefined && "bg-primary border-primary",
          selected && correct === true && "bg-success border-success",
          selected && correct === false && "bg-error border-error",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </motion.div>
      <span className={cn(
        "text-secondary-foreground",
        showStrikethrough && "line-through text-gray-500 dark:text-gray-400"
      )}>
        {option}
      </span>
    </div>
  );
};

export default QuizOption;
