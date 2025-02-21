
import { useState } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { AddWidgetModal } from "./AddWidgetModal";

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
    <div className="relative min-h-[400px] p-4 border rounded-lg bg-background">
      <div className="absolute top-4 right-4">
        <AddWidgetModal onAddWidget={handleAddWidget} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
        {widgets.map((widget) => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            type={widget.type}
            onRemove={handleRemoveWidget}
            data={data}
          />
        ))}
      </div>
    </div>
  );
};
