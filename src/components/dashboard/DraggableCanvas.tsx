
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { cn } from "@/lib/utils";
import { AddWidgetModal } from "./AddWidgetModal";

interface WidgetPosition {
  id: string;
  x: number;
  y: number;
}

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [widgetPositions, setWidgetPositions] = useState<WidgetPosition[]>(() => {
    const saved = localStorage.getItem('widgetPositions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (canvasRef.current && !canvasRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    if (savedWidgets && widgets.length === 0) {
      setWidgets(JSON.parse(savedWidgets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('widgetPositions', JSON.stringify(widgetPositions));
  }, [widgetPositions]);

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
    setWidgetPositions((prev) => prev.filter((pos) => pos.id !== widgetId));
  };

  const handleWidgetDrag = (widgetId: string, x: number, y: number) => {
    setWidgetPositions((prev) => {
      const existing = prev.find((p) => p.id === widgetId);
      if (existing) {
        return prev.map((p) => p.id === widgetId ? { ...p, x, y } : p);
      }
      return [...prev, { id: widgetId, x, y }];
    });
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    // Only open modal if clicking directly on the canvas (not on widgets)
    if (event.target === event.currentTarget && !isEditing) {
      setIsModalOpen(true);
    } else if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleAddWidget = (type: string) => {
    const newWidget = {
      id: `${type}-${Date.now()}`,
      type,
    };
    setWidgets((prev) => [...prev, newWidget]);
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={cn(
          "relative p-4 border-2 border-primary rounded-lg bg-background cursor-pointer min-h-[200px]",
          widgets.length === 0 && "flex items-center justify-center"
        )}
      >
        {widgets.length === 0 && (
          <p className="text-muted-foreground">Click here to add widgets</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((widget) => {
            const position = widgetPositions.find((p) => p.id === widget.id);
            return (
              <DraggableWidget
                key={widget.id}
                id={widget.id}
                type={widget.type}
                onRemove={handleRemoveWidget}
                isEditing={isEditing}
                data={data}
                initialPosition={position}
                onDrag={(x, y) => handleWidgetDrag(widget.id, x, y)}
              />
            );
          })}
        </div>
      </div>
      <AddWidgetModal 
        onAddWidget={handleAddWidget} 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
