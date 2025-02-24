
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [widgetPositions, setWidgetPositions] = useState<WidgetPosition[]>(() => {
    const saved = localStorage.getItem('widgetPositions');
    return saved ? JSON.parse(saved) : [];
  });

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

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
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
    if (event.target === event.currentTarget) {
      setIsModalOpen(true);
    }
  };

  const handleAddWidget = (type: string) => {
    const newWidget = {
      id: `${type}-${Date.now()}`,
      type,
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const handleWidgetAdd = (type: string) => {
    handleAddWidget(type);
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={cn(
          "relative p-4 border-2 border-primary rounded-lg bg-background min-h-[200px]",
          widgets.length === 0 ? "cursor-pointer" : "cursor-default"
        )}
      >
        {widgets.length === 0 && (
          <p className="text-muted-foreground">Click here to add widgets</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pointer-events-none">
          {widgets.map((widget) => {
            const position = widgetPositions.find((p) => p.id === widget.id);
            return (
              <div key={widget.id} className="pointer-events-auto">
                <DraggableWidget
                  id={widget.id}
                  type={widget.type}
                  onRemove={handleRemoveWidget}
                  data={data}
                  initialPosition={position}
                  onDrag={(x, y) => handleWidgetDrag(widget.id, x, y)}
                  canvasRef={canvasRef}
                />
              </div>
            );
          })}
        </div>
      </div>
      <AddWidgetModal 
        onAddWidget={handleWidgetAdd} 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
