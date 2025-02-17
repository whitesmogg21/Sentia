
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { StrikethroughIcon } from "lucide-react";
import { useState } from "react";

interface QuizOptionProps {
  option: string;
  selected: boolean;
  correct?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const QuizOption = ({ option, selected, correct, onClick, disabled }: QuizOptionProps) => {
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const getStateColor = () => {
    if (!selected) return "";
    if (correct === undefined) return "data-[state=checked]:bg-primary data-[state=checked]:border-primary";
    return correct 
      ? "data-[state=checked]:bg-success data-[state=checked]:border-success" 
      : "data-[state=checked]:bg-error data-[state=checked]:border-error";
  };

  return (
    <div className={cn(
      "flex items-center gap-3",
      "py-2",
      disabled && "opacity-75"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setIsStrikethrough(!isStrikethrough)}
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Button>
      <Checkbox
        checked={selected}
        onCheckedChange={() => onClick()}
        disabled={disabled}
        className={cn(
          getStateColor(),
          "border-2"
        )}
      />
      <span className={cn(
        "text-secondary-foreground",
        isStrikethrough && "line-through"
      )}>
        {option}
      </span>
    </div>
  );
};

export default QuizOption;
