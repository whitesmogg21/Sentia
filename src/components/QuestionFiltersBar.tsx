
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
      if (filters[category.key] !== undefined) {
        if (filters[category.key] !== isActive) {
          onClick();
        }
      }
    }
  }, []);

  useEffect(() => {
    const savedFilters = localStorage.getItem('questionFilters');
    const filters = savedFilters ? JSON.parse(savedFilters) : {};
    filters[category.key] = isActive;
    localStorage.setItem('questionFilters', JSON.stringify(filters));
  }, [isActive, category.key]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
        category.bgColor,
        category.color,
        isActive && "ring-2 ring-offset-2",
        "hover:opacity-90"
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

const QuestionFiltersBar = ({ filters, onToggleFilter }: QuestionFiltersBarProps) => {
  const [metrics, setMetrics] = useState(calculateMetrics());
  
  // Initialize metrics on component mount
  useEffect(() => {
    initializeMetrics();
    setMetrics(calculateMetrics());
    
    // Re-calculate metrics when storage changes
    const handleStorageChange = () => {
      setMetrics(calculateMetrics());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
