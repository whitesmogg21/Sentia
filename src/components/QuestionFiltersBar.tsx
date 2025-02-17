
import { QuestionFilter } from "@/types/quiz";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface QuestionFiltersBarProps {
  filter: QuestionFilter;
  onFilterChange: (filter: QuestionFilter) => void;
  metrics: Record<keyof QuestionFilter, number>;
  tags: string[];
}

export const QuestionFiltersBar = ({
  filter,
  onFilterChange,
  metrics,
  tags
}: QuestionFiltersBarProps) => {
  const handleFilterChange = (key: keyof QuestionFilter, value: boolean | string[]) => {
    onFilterChange({
      ...filter,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="unused"
          checked={filter.unused}
          onCheckedChange={(checked) => handleFilterChange("unused", !!checked)}
        />
        <label htmlFor="unused" className="text-sm font-medium">
          Unused ({metrics.unused})
        </label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="correct"
          checked={filter.correct}
          onCheckedChange={(checked) => handleFilterChange("correct", !!checked)}
        />
        <label htmlFor="correct" className="text-sm font-medium">
          Correct ({metrics.correct})
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="incorrect"
          checked={filter.incorrect}
          onCheckedChange={(checked) => handleFilterChange("incorrect", !!checked)}
        />
        <label htmlFor="incorrect" className="text-sm font-medium">
          Incorrect ({metrics.incorrect})
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="flagged"
          checked={filter.flagged}
          onCheckedChange={(checked) => handleFilterChange("flagged", !!checked)}
        />
        <label htmlFor="flagged" className="text-sm font-medium">
          Flagged ({metrics.flagged})
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="omitted"
          checked={filter.omitted}
          onCheckedChange={(checked) => handleFilterChange("omitted", !!checked)}
        />
        <label htmlFor="omitted" className="text-sm font-medium">
          Omitted ({metrics.omitted})
        </label>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tags.map(tag => (
          <Badge
            key={tag}
            variant={filter.tags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => {
              const newTags = filter.tags.includes(tag)
                ? filter.tags.filter(t => t !== tag)
                : [...filter.tags, tag];
              handleFilterChange("tags", newTags);
            }}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
