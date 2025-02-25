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
    setWidgetPositions(prev => prev.filter(pos => pos.id !== id));
  };

  const handleWidgetDrag = (widgetId: string, x: number, y: number) => {
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const canvasLeft = canvasRect.left;
    const canvasTop = canvasRect.top;
    
    const relativeX = Math.max(0, Math.min(x - canvasLeft, canvasRect.width - 250));
    const relativeY = Math.max(0, Math.min(y - canvasTop, canvasRect.height - 200));
    
    setWidgetPositions((prev) => {
      const existing = prev.find((p) => p.id === widgetId);
      if (existing) {
        return prev.map((p) => p.id === widgetId ? { ...p, x: relativeX, y: relativeY } : p);
      }
      return [...prev, { id: widgetId, x: relativeX, y: relativeY }];
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

  const calculateCanvasHeight = () => {
    if (widgets.length === 0) return 200;
    
    let maxY = 200;
    
    widgetPositions.forEach(position => {
      const widgetBottom = position.y + 200;
      if (widgetBottom > maxY) {
        maxY = widgetBottom;
      }
    });
    
    return maxY + 20;
  };

  return (
    <>
      <div 
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={cn(
          "relative p-4 border-2 border-primary rounded-lg bg-background",
          widgets.length === 0 ? "cursor-pointer min-h-[200px]" : "cursor-default"
        )}
        style={{ minHeight: `${calculateCanvasHeight()}px` }}
      >
        {widgets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Click here to add widgets</p>
        ) : (
          widgets.map((widget) => {
            const position = widgetPositions.find((p) => p.id === widget.id);
            
            return (
              <DraggableWidget
                key={widget.id}
                id={widget.id}
                type={widget.type}
                onRemove={handleRemoveWidget}
                data={data}
                initialPosition={position}
                onDrag={(x, y) => handleWidgetDrag(widget.id, x, y)}
                canvasRef={canvasRef}
                style={{ 
                  position: 'absolute',
                  left: position ? `${position.x}px` : '0px',
                  top: position ? `${position.y}px` : '0px',
                }}
              />
            );
          })
        )}
      </div>
      <AddWidgetModal 
        onAddWidget={handleWidgetAdd} 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
