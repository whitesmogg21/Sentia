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

interface WidgetSize {
  id: string;
  width: number;
  height: number;
}

const GRID_COLS = 12; // 12-column grid system
const CELL_SIZE = 100; // pixels

export const DraggableCanvas = ({ data, widgets, setWidgets }: DraggableCanvasProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [widgetPositions, setWidgetPositions] = useState<WidgetPosition[]>(() => {
    const saved = localStorage.getItem('widgetPositions');
    return saved ? JSON.parse(saved) : [];
  });
  const [widgetSizes, setWidgetSizes] = useState<WidgetSize[]>(() => {
    const saved = localStorage.getItem('widgetSizes');
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

  useEffect(() => {
    localStorage.setItem('widgetSizes', JSON.stringify(widgetSizes));
  }, [widgetSizes]);

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    setWidgetSizes(prev => prev.filter(size => size.id !== id));
    setWidgetPositions(prev => prev.filter(pos => pos.id !== id));
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
    
    // Set default size for new widget
    setWidgetSizes(prev => [...prev, { 
      id: newWidget.id, 
      width: 300, 
      height: 300 
    }]);
  };

  const handleWidgetAdd = (type: string) => {
    handleAddWidget(type);
    setIsModalOpen(false);
  };

  const handleWidgetResize = (widgetId: string, width: number, height: number) => {
    setWidgetSizes((prev) => {
      const existing = prev.find((s) => s.id === widgetId);
      if (existing) {
        return prev.map((s) => s.id === widgetId ? { ...s, width, height } : s);
      }
      return [...prev, { id: widgetId, width, height }];
    });
  };

  return (
    <>
      <div 
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={cn(
          "relative p-4 border-2 border-primary rounded-lg bg-background min-h-[200px]",
          "cursor-pointer"
        )}
      >
        {widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-gray-400">Click here to add widgets</p>
          </div>
        )}
        
        {/* Make this a positioned container for widgets */}
        <div 
          className="relative w-full h-full"
          onClick={(e) => {
            // Only trigger if clicking the background
            if (e.target === e.currentTarget) {
              handleCanvasClick(e);
            }
          }}
        >
          {widgets.map((widget, index) => {
            const size = widgetSizes.find((s) => s.id === widget.id) || { width: 300, height: 300 };
            
            return (
              <div
                key={widget.id}
                className="absolute"
                style={{
                  width: size.width,
                  height: size.height,
                  // Position widgets in a grid-like pattern
                  left: `${(index % 2) * (size.width + 16)}px`,
                  top: `${Math.floor(index / 2) * (size.height + 16)}px`
                }}
              >
                <DraggableWidget
                  id={widget.id}
                  type={widget.type}
                  onRemove={handleRemoveWidget}
                  data={data}
                  initialPosition={widgetPositions.find((p) => p.id === widget.id)}
                  onDrag={(x, y) => handleWidgetDrag(widget.id, x, y)}
                  canvasRef={canvasRef}
                  size={size}
                  onResize={(width, height) => handleWidgetResize(widget.id, width, height)}
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