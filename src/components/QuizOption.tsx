
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";

interface QuizOptionProps {
  option: string;
  selected: boolean;
  correct?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const QuizOption = ({ option, selected, correct, onClick, disabled }: QuizOptionProps) => {
  const getStateColor = () => {
    if (!selected) return "";
    if (correct === undefined) return "data-[state=checked]:bg-primary data-[state=checked]:border-primary";
    return correct 
      ? "data-[state=checked]:bg-success data-[state=checked]:border-success" 
      : "data-[state=checked]:bg-error data-[state=checked]:border-error";
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg bg-secondary",
      "transition-colors duration-200",
      disabled && "opacity-75"
    )}>
      <Checkbox
        checked={selected}
        onCheckedChange={() => onClick()}
        disabled={disabled}
        className={cn(
          "mt-1",
          getStateColor(),
          "border-2"
        )}
      />
      <span className="text-secondary-foreground font-medium">
        {option}
      </span>
    </div>
  );
};

export default QuizOption;
