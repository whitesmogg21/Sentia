
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface WidgetSelectorProps {
  onAddWidget: (type: string) => void;
}

export const WidgetSelector = ({ onAddWidget }: WidgetSelectorProps) => {
  const widgetTypes = [
    { id: 'accuracy', name: 'Accuracy Circle' },
    { id: 'heatmap', name: 'Activity Heatmap' },
    { id: 'barChart', name: 'Performance Bar Chart' },
    { id: 'spiderChart', name: 'Spider Chart' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {widgetTypes.map((widget) => (
          <DropdownMenuItem
            key={widget.id}
            onClick={() => onAddWidget(widget.id)}
          >
            {widget.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
