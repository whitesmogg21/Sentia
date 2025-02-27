
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuizOptionProps {
  option: string;
  selected: boolean;
  correct?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const QuizOption = ({ option, selected, correct, onClick, disabled }: QuizOptionProps) => {
  const getBackgroundColor = () => {
    if (!selected) return "bg-secondary hover:bg-secondary/80";
    if (correct === undefined) return "bg-primary hover:bg-primary/90";
    return correct ? "bg-success" : "bg-error";
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "w-full p-4 rounded-lg text-left transition-colors duration-200",
        getBackgroundColor(),
        "text-secondary-foreground font-medium",
        disabled && "cursor-not-allowed opacity-75"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {option}
    </motion.button>
  );
};

export default QuizOption;
