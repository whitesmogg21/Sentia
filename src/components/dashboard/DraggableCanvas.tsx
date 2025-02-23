
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { cn } from "@/lib/utils";
import { AddWidgetModal } from "./AddWidgetModal";

interface WidgetPosition {
  id: string;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
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
    setWidgetPositions(prev => prev.filter(pos => pos.id !== id));
  };

  const handleWidgetDrag = (widgetId: string, x: number, y: number) => {
    setWidgetPositions((prev) => {
      const existing = prev.find((p) => p.id === widgetId);
      if (existing) {
        const newPositions = prev.map((p) => {
          if (p.id === widgetId) {
            return { ...p, x, y };
          }
          // Check for collision and adjust positions
          const widgetWidth = p.size === 'large' ? 600 : p.size === 'medium' ? 400 : 300;
          const widgetHeight = p.size === 'large' ? 400 : p.size === 'medium' ? 300 : 200;
          const padding = 16;

          const isColliding = (
            x < p.x + widgetWidth + padding &&
            x + widgetWidth + padding > p.x &&
            y < p.y + widgetHeight + padding &&
            y + widgetHeight + padding > p.y
          );

          if (isColliding) {
            // Move the existing widget away from the collision
            const xDiff = x - p.x;
            const yDiff = y - p.y;
            return {
              ...p,
              x: p.x + (xDiff > 0 ? -widgetWidth - padding : widgetWidth + padding),
              y: p.y + (yDiff > 0 ? -widgetHeight - padding : widgetHeight + padding),
            };
          }
          return p;
        });
        return newPositions;
      }
      return [...prev, { id: widgetId, x, y, size: 'small' }];
    });
  };

  const handleWidgetResize = (widgetId: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgetPositions(prev => 
      prev.map(p => p.id === widgetId ? { ...p, size: newSize } : p)
    );
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && widgets.length < 10) {
      setIsModalOpen(true);
    }
  };

  const handleAddWidget = (type: string) => {
    if (widgets.length >= 10) return;
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

  const minHeight = Math.max(
    500,  // minimum height
    Math.ceil(widgets.length / 3) * 300  // dynamic height based on widget count
  );

  return (
    <>
      <div 
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={cn(
          "relative p-4 border-2 border-primary rounded-lg bg-background",
          "transition-all duration-300 ease-in-out",
          widgets.length === 0 ? "cursor-pointer" : "cursor-default"
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        {widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground/50 text-lg">
              Click here to add widgets
            </p>
          </div>
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
                  size={position?.size || 'small'}
                  onResize={size => handleWidgetResize(widget.id, size)}
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
