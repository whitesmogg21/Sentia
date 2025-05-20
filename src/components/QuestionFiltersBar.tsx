
import { useEffect, useState } from "react";
import { QuestionFilter } from "@/types/quiz";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateMetrics, initializeMetrics } from "@/utils/metricsUtils";

type FilterCategory = {
  label: string;
  key: keyof QuestionFilter;
  color: string;
  bgColor: string;
};

interface QuestionFiltersBarProps {
  filters: QuestionFilter;
  onToggleFilter: (key: keyof QuestionFilter) => void;
  questions?: any[]; // Accept a list of questions to calculate metrics for
}

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    label: "Unused",
    key: "unused",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    label: "Used",
    key: "used",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    label: "Incorrect",
    key: "incorrect",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    label: "Correct",
    key: "correct",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    label: "Flag",
    key: "flagged",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    label: "Omitted",
    key: "omitted",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
];

const FilterButton = ({
  category,
  count,
  isActive,
  onClick
}: {
  category: FilterCategory;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) => {
  useEffect(() => {
    const savedFilters = localStorage.getItem('questionFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      if (filters[category.key] !== undefined && filters[category.key] !== isActive) {
        // Only trigger onClick if there's a genuine mismatch
        onClick();
      }
    }
  }, []);

  useEffect(() => {
    // This will update localStorage when filters change
    const savedFilters = localStorage.getItem('questionFilters');
    const filters = savedFilters ? JSON.parse(savedFilters) : {};
    
    // Only update if the value changed
    if (filters[category.key] !== isActive) {
      filters[category.key] = isActive;
      localStorage.setItem('questionFilters', JSON.stringify(filters));
    }
  }, [isActive, category.key]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
        category.bgColor,
        category.color,
        isActive && "ring-2 ring-offset-2",
        "hover:opacity-90",
        count === 0 && "opacity-50"
      )}
    >
      <Check className={cn("w-4 h-4", isActive ? "opacity-100" : "opacity-0")} />
      <span className="font-medium">{category.label}</span>
      <span className="px-2 py-0.5 bg-white rounded-full text-sm">
        {count}
      </span>
    </button>
  );
};

const QuestionFiltersBar = ({ filters, onToggleFilter, questions }: QuestionFiltersBarProps) => {
  const calculateLocalMetrics = (questions: any[]) => {
    // Calculate metrics for the provided questions only
    const counts = {
      unused: 0,
      used: 0,
      correct: 0,
      incorrect: 0,
      flagged: 0,
      omitted: 0
    };
    
    questions.forEach(q => {
      const hasBeenAttempted = q.attempts && q.attempts.length > 0;
      const lastAttempt = hasBeenAttempted ? q.attempts[q.attempts.length - 1] : null;
      
      // Determine the status based on attempts
      if (!hasBeenAttempted) {
        counts.unused++;
      } else {
        counts.used++;
        if (lastAttempt.selectedAnswer === null) {
          counts.omitted++;
        } else if (lastAttempt.isCorrect) {
          counts.correct++;
        } else {
          counts.incorrect++;
        }
      }
      
      // Flagged is independent of other statuses
      if (q.isFlagged) {
        counts.flagged++;
      }
    });
    
    return counts;
  };

  const [metrics, setMetrics] = useState(() =>
    questions ? calculateLocalMetrics(questions) : calculateMetrics()
  );

  useEffect(() => {
    const updateMetrics = () => {
      if (questions) {
        setMetrics(calculateLocalMetrics(questions));
      } else {
        setMetrics(calculateMetrics());
      }
    };
    
    // Initialize metrics and set up update listeners
    initializeMetrics();
    updateMetrics();
    
    // Listen for changes from other components
    const handleStorageChange = () => updateMetrics();
    const handleMetricsUpdate = () => updateMetrics();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('metrics-update', handleMetricsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('metrics-update', handleMetricsUpdate);
    };
  }, [questions]);
  
  // Update metrics when questions prop changes
  useEffect(() => {
    if (questions) {
      setMetrics(calculateLocalMetrics(questions));
    }
  }, [questions]);

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_CATEGORIES.map((category) => (
        <FilterButton
          key={category.key}
          category={category}
          count={metrics[category.key]}
          isActive={filters[category.key]}
          onClick={() => onToggleFilter(category.key)}
        />
      ))}
    </div>
  );
};

export default QuestionFiltersBar;
