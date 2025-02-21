
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { cn } from "@/lib/utils";

interface DraggableCanvasProps {
  data: {
    accuracy: number;
    quizHistory: any[];
    qbanks: any[];
    metrics: any;
    tagPerformance: any[];
  };
  widgets: Array<{ id: string; type: string }>;
  setWidgets: Dispatch<SetStateAction<Array<{ id: string; type: string }>>>;
}

export const DraggableCanvas = ({ data, widgets, setWidgets }: DraggableCanvasProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (canvasRef.current && !canvasRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
  };

  const handleCanvasClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div 
      ref={canvasRef}
      onClick={handleCanvasClick}
      className={cn(
        "relative p-4 border-2 border-primary rounded-lg bg-background cursor-pointer",
        widgets.length === 0 ? "min-h-[200px]" : "min-h-fit"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
