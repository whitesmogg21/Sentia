import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveUpRight, X } from "lucide-react";
// import { ArrowsMaximize, X } from "lucide-react";
import { Button } from "../ui/button";
import CircularProgress from "../CircularProgress";
import { CalendarHeatmap } from "../charts/CalendarHeatmap";
import { TagPerformanceBarChart } from "../charts/TagPerformanceBarChart";
import { TagPerformanceChart } from "../TagPerformanceChart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  id: string;
  type: string;
  onRemove: (id: string) => void;
  data: any;
  initialPosition?: { x: number; y: number };
  onDrag: (x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  size?: { width: number; height: number };
  onResize?: (width: number, height: number) => void;
}

export const DraggableWidget = ({ 
  id, 
  type, 
  onRemove, 
  data,
  initialPosition,
  onDrag,
  canvasRef,
  size: initialSize,
  onResize
}: DraggableWidgetProps) => {
  const [size, setSize] = useState(initialSize || { width: 300, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);


  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  // Add click handler for the widget
  const handleWidgetClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas click
    setIsEditing(true);
  };

  // Add click outside handler to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      if (!element.closest(`[data-widget-id="${id}"]`)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, id]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const canvasBounds = canvas.getBoundingClientRect();
      const padding = 16;
      
      let newX = position.x;
      let newY = position.y;
      
      // Adjust position if needed
      newX = Math.max(padding, Math.min(newX, canvasBounds.width - size.width - padding));
      newY = Math.max(padding, Math.min(newY, canvasBounds.height - size.height - padding));
      
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
        onDrag(newX, newY);
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, size, canvasRef, onDrag]);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasBounds = canvas.getBoundingClientRect();
    const widgetElement = event.target as HTMLElement;
    const widgetBounds = widgetElement.getBoundingClientRect();
    
    const padding = 16;
    let newX = position.x + info.offset.x;
    let newY = position.y + info.offset.y;
    
    // Calculate maximum bounds considering widget size
    const maxX = canvasBounds.width - widgetBounds.width - padding;
    const maxY = canvasBounds.height - widgetBounds.height - padding;
    
    // Clamp the position values
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));
    
    const newPosition = { x: newX, y: newY };
    setPosition(newPosition);
    onDrag(newPosition.x, newPosition.y);
  };
  
  const handleResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) return;
  
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
  
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      
      // Set minimum sizes
      const width = Math.max(200, newWidth);
      const height = Math.max(200, newHeight);
      setSize({ width, height });
      onResize?.(width, height);
    };
  
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
    };
  
    setIsResizing(true);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const shakeAnimation = {
    rotate: isEditing ? [-1, 1, -1, 1, 0] : 0,
    transition: {
      duration: 0.5,
      repeat: isEditing ? Infinity : 0,
      repeatType: "loop" as const
    }
  };

  const renderWidget = () => {
    // Your existing renderWidget code remains the same
    switch (type) {
      case 'accuracy':
        return <CircularProgress percentage={data.accuracy || 0} />;
      case 'heatmap':
        return <CalendarHeatmap data={data.quizHistory || []} />;
      case 'barChart':
        return <TagPerformanceBarChart qbanks={data.qbanks || []} quizHistory={data.quizHistory || []} />;
      case 'spiderChart':
        return <TagPerformanceChart qbanks={data.qbanks || []} quizHistory={data.quizHistory || []} />;
      case 'progressChart':
        return (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.quizHistory || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      case 'scoreDistribution':
        const colors = ['#0088FE', '#00C49F', '#FFBB28'];
        const scoreData = [
          { name: 'Correct', value: data.metrics?.correct || 0 },
          { name: 'Incorrect', value: data.metrics?.incorrect || 0 },
          { name: 'Skipped', value: data.metrics?.omitted || 0 },
        ];
        return (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <motion.div
      data-widget-id={id}
      onClick={handleWidgetClick}
      drag={isEditing}
      dragMomentum={false}
      dragConstraints={canvasRef}
      dragElastic={0}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={shakeAnimation}
      className="relative w-full h-full"
      style={{
        width: size.width,
        height: size.height
      }}
    >
      <Card className={cn(
          "p-4 relative",
          isEditing ? "cursor-move border-dashed border-2" : "cursor-default",
          isDragging && "shadow-lg"
        )}>
          {renderWidget()}
          <AnimatePresence>
            {isEditing && (
              <>
                {/* Delete button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-2 right-2"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>

                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 p-2 cursor-se-resize"
                  onMouseDown={handleResize}
                >
                  <MoveUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </>
            )}
          </AnimatePresence>
        </Card>
    </motion.div>
  );
};