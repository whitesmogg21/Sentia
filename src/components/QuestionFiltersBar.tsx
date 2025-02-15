
import { QuestionFilter } from "@/types/quiz";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryStats {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  key: keyof QuestionFilter;
}

interface QuestionFiltersBarProps {
  metrics: {
    unused: number;
    used: number;
    incorrect: number;
    correct: number;
    flagged: number;
    omitted: number;
  };
  filters: QuestionFilter;
  onToggleFilter: (key: keyof QuestionFilter) => void;
}

const QuestionFiltersBar = ({ metrics, filters, onToggleFilter }: QuestionFiltersBarProps) => {
  const categories: CategoryStats[] = [
    {
      label: "Unused",
      count: metrics.unused,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      key: "unused"
    },
    {
      label: "Used",
      count: metrics.used,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      key: "used"
    },
    {
      label: "Incorrect",
      count: metrics.incorrect,
      color: "text-red-600",
      bgColor: "bg-red-50",
      key: "incorrect"
    },
    {
      label: "Correct",
      count: metrics.correct,
      color: "text-green-600",
      bgColor: "bg-green-50",
      key: "correct"
    },
    {
      label: "Flag",
      count: metrics.flagged,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      key: "flagged"
    },
    {
      label: "Omitted",
      count: metrics.omitted,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      key: "omitted"
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.label}
          onClick={() => onToggleFilter(category.key)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
            category.bgColor,
            category.color,
            filters[category.key] && "ring-2 ring-offset-2",
            "hover:opacity-90"
          )}
        >
          <Check 
            className={cn(
              "w-4 h-4",
              filters[category.key] ? "opacity-100" : "opacity-0"
            )}
          />
          <span className="font-medium">{category.label}</span>
          <span className="px-2 py-0.5 bg-white rounded-full text-sm">
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default QuestionFiltersBar;
