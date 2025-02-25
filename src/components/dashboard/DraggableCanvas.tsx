
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { cn } from "@/lib/utils";
import { AddWidgetModal } from "./AddWidgetModal";

// Define the size of grid cells for positioning
const GRID_SIZE = 10;
const WIDGET_WIDTH = 250;
const WIDGET_HEIGHT = 200;
const WIDGET_MARGIN = 10;

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
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Create default positions for initial widgets
      const defaultPositions: WidgetPosition[] = [];
      const widgetsPerRow = 3; // Max widgets per row
      
      widgets.forEach((widget, index) => {
        const row = Math.floor(index / widgetsPerRow);
        const col = index % widgetsPerRow;
        defaultPositions.push({
          id: widget.id,
          x: col * (WIDGET_WIDTH + WIDGET_MARGIN),
          y: row * (WIDGET_HEIGHT + WIDGET_MARGIN)
        });
      });
      
      return defaultPositions;
    }
  });
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);

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
    rearrangeWidgets();
  };

  // Check if position is occupied by another widget
  const isPositionOccupied = (x: number, y: number, currentWidgetId: string): boolean => {
    return widgetPositions.some(pos => {
      if (pos.id === currentWidgetId) return false;
      
      // Check if the rectangles overlap
      const pos1Left = x;
      const pos1Right = x + WIDGET_WIDTH;
      const pos1Top = y;
      const pos1Bottom = y + WIDGET_HEIGHT;
      
      const pos2Left = pos.x;
      const pos2Right = pos.x + WIDGET_WIDTH;
      const pos2Top = pos.y;
      const pos2Bottom = pos.y + WIDGET_HEIGHT;
      
      return !(
        pos1Right < pos2Left ||
        pos1Left > pos2Right ||
        pos1Bottom < pos2Top ||
        pos1Top > pos2Bottom
      );
    });
  };

  // Find a valid position closest to the desired position
  const findClosestValidPosition = (x: number, y: number, widgetId: string): { x: number, y: number } => {
    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
    
    // If the snapped position is valid, return it
    if (!isPositionOccupied(snappedX, snappedY, widgetId)) {
      return { x: snappedX, y: snappedY };
    }
    
    // Search in spiral pattern for closest empty position
    const spiral = [
      [0, -1], [1, 0], [0, 1], [-1, 0], // Up, Right, Down, Left
      [-1, -1], [1, -1], [1, 1], [-1, 1], // Diagonals
    ];
    
    for (let distance = 1; distance < 30; distance++) { // Limit search to avoid infinite loop
      for (const [dx, dy] of spiral) {
        const newX = snappedX + (dx * distance * GRID_SIZE);
        const newY = snappedY + (dy * distance * GRID_SIZE);
        
        // Ensure position is within canvas
        if (canvasRef.current) {
          const canvasRect = canvasRef.current.getBoundingClientRect();
          if (newX < 0 || newX > canvasRect.width - WIDGET_WIDTH || 
              newY < 0 || newY > canvasRect.height - WIDGET_HEIGHT) {
            continue;
          }
        }
        
        if (!isPositionOccupied(newX, newY, widgetId)) {
          return { x: newX, y: newY };
        }
      }
    }
    
    // Fallback - just return the original position
    return { x: snappedX, y: snappedY };
  };

  const handleWidgetDragStart = (widgetId: string) => {
    setActiveWidgetId(widgetId);
  };

  const handleWidgetDrag = (widgetId: string, x: number, y: number) => {
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const canvasLeft = canvasRect.left;
    const canvasTop = canvasRect.top;
    
    // Calculate position relative to canvas
    let relativeX = Math.max(0, Math.min(x - canvasLeft, canvasRect.width - WIDGET_WIDTH));
    let relativeY = Math.max(0, Math.min(y - canvasTop, canvasRect.height - WIDGET_HEIGHT));
    
    setWidgetPositions((prev) => {
      const existing = prev.find((p) => p.id === widgetId);
      if (existing) {
        return prev.map((p) => p.id === widgetId ? { ...p, x: relativeX, y: relativeY } : p);
      }
      return [...prev, { id: widgetId, x: relativeX, y: relativeY }];
    });
  };

  const handleWidgetDragEnd = () => {
    if (!activeWidgetId) return;
    
    // Find the current position of the active widget
    const activeWidget = widgetPositions.find(pos => pos.id === activeWidgetId);
    if (!activeWidget) {
      setActiveWidgetId(null);
      return;
    }
    
    // Find the closest valid position
    const validPosition = findClosestValidPosition(activeWidget.x, activeWidget.y, activeWidgetId);
    
    // Update the widget position
    setWidgetPositions(prev => prev.map(pos => 
      pos.id === activeWidgetId ? { ...pos, x: validPosition.x, y: validPosition.y } : pos
    ));
    
    setActiveWidgetId(null);
    rearrangeWidgets();
  };

  const rearrangeWidgets = () => {
    // This function can be enhanced to neatly rearrange widgets 
    // and avoid gaps after deletion or dragging
    if (!canvasRef.current) return;
    
    // For now, we're just making sure there are no overlaps
    const newPositions = [...widgetPositions];
    
    for (let i = 0; i < newPositions.length; i++) {
      const validPos = findClosestValidPosition(
        newPositions[i].x, 
        newPositions[i].y, 
        newPositions[i].id
      );
      newPositions[i].x = validPos.x;
      newPositions[i].y = validPos.y;
    }
    
    setWidgetPositions(newPositions);
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
    
    // Find a position for the new widget
    const newPosition = calculateNewWidgetPosition();
    
    setWidgets(prev => [...prev, newWidget]);
    setWidgetPositions(prev => [...prev, { id: newWidget.id, ...newPosition }]);
  };

  const calculateNewWidgetPosition = () => {
    if (!canvasRef.current || widgetPositions.length === 0) {
      return { x: 0, y: 0 };
    }
    
    // Try to arrange in a grid
    const maxPositions = 20; // Safety limit
    for (let row = 0; row < maxPositions; row++) {
      for (let col = 0; col < 3; col++) { // Assuming max 3 columns
        const x = col * (WIDGET_WIDTH + WIDGET_MARGIN);
        const y = row * (WIDGET_HEIGHT + WIDGET_MARGIN);
        
        if (!isPositionOccupied(x, y, '')) {
          return { x, y };
        }
      }
    }
    
    // Fallback - find furthest down position
    const maxY = Math.max(...widgetPositions.map(p => p.y + WIDGET_HEIGHT)) + WIDGET_MARGIN;
    return { x: 0, y: maxY };
  };

  const handleWidgetAdd = (type: string) => {
    handleAddWidget(type);
    setIsModalOpen(false);
  };

  const calculateCanvasHeight = () => {
    if (widgets.length === 0) return 200;
    
    let maxY = 200;
    
    widgetPositions.forEach(position => {
      const widgetBottom = position.y + WIDGET_HEIGHT + WIDGET_MARGIN;
      if (widgetBottom > maxY) {
        maxY = widgetBottom;
      }
    });
    
    return maxY + WIDGET_MARGIN;
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
                onDragStart={() => handleWidgetDragStart(widget.id)}
                onDragEnd={handleWidgetDragEnd}
                isDragging={activeWidgetId === widget.id}
                canvasRef={canvasRef}
                style={{ 
                  position: 'absolute',
                  left: position ? `${position.x}px` : '0px',
                  top: position ? `${position.y}px` : '0px',
                  zIndex: activeWidgetId === widget.id ? 10 : 1,
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
