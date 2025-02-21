
import { useState } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { AddWidgetModal } from "./AddWidgetModal";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface DraggableCanvasProps {
  data: {
    accuracy: number;
    quizHistory: any[];
    qbanks: any[];
    metrics: any;
    tagPerformance: any[];
  };
}

export const DraggableCanvas = ({ data }: DraggableCanvasProps) => {
  const [widgets, setWidgets] = useState<Array<{ id: string; type: string }>>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddWidget = (type: string) => {
    const newWidget = {
      id: `${type}-${Date.now()}`,
      type,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
  };

  return (
    <div className={cn(
      "relative p-4 border rounded-lg bg-background",
      widgets.length === 0 ? "min-h-[200px]" : "min-h-fit"
    )}>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Done" : "Edit Layout"}
        </Button>
        <AddWidgetModal onAddWidget={handleAddWidget} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
        {widgets.map((widget) => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            type={widget.type}
            onRemove={handleRemoveWidget}
            isEditing={isEditing}
            data={data}
          />
        ))}
      </div>
    </div>
  );
};

