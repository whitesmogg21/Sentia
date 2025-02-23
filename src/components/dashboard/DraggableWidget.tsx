
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";
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
  initialPosition?: { x: number; y: number; size: 'small' | 'medium' | 'large' };
  onDrag: (x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  size: 'small' | 'medium' | 'large';
  onResize: (size: 'small' | 'medium' | 'large') => void;
}

export const DraggableWidget = ({ 
  id, 
  type, 
  onRemove, 
  data,
  initialPosition,
  onDrag,
  canvasRef,
  size,
  onResize
}: DraggableWidgetProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0, size: 'small' });

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleWidgetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

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
    
    newX = Math.max(0, Math.min(newX, canvasBounds.width - widgetBounds.width));
    newY = Math.max(0, Math.min(newY, canvasBounds.height - widgetBounds.height));
    
    const newPosition = { ...position, x: newX, y: newY };
    setPosition(newPosition);
    onDrag(newPosition.x, newPosition.y);
  };

  const handleResize = () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(size);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    onResize(nextSize);
  };
  
  const shakeAnimation = {
    rotate: isEditing ? [-1, 1, -1, 1, 0] : 0,
    transition: {
      duration: 0.5,
      repeat: isEditing ? Infinity : 0,
      repeatType: "loop" as const
    }
  };

  const getWidgetSize = () => {
    switch (size) {
      case 'large':
        return 'w-[600px] h-[400px]';
      case 'medium':
        return 'w-[400px] h-[300px]';
      case 'small':
      default:
        return 'w-[300px] h-[200px]';
    }
  };

  const renderWidget = () => {
    switch (type) {
      case 'accuracy':
        return <CircularProgress percentage={data.accuracy || 0} size={size === 'small' ? 'small' : 'large'} />;
      case 'heatmap':
        return <CalendarHeatmap data={data.quizHistory || []} />;
      case 'barChart':
        return <TagPerformanceBarChart qbanks={data.qbanks || []} quizHistory={data.quizHistory || []} />;
      case 'spiderChart':
        return <TagPerformanceChart qbanks={data.qbanks || []} quizHistory={data.quizHistory || []} />;
      case 'progressChart':
        return (
          <div className="h-full w-full">
            <ResponsiveContainer>
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
          <div className="h-full w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  outerRadius={Math.min(position.x, position.y) / 3}
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
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={{
        rotate: shakeAnimation.rotate,
        x: position.x,
        y: position.y,
        transition: {
          rotate: shakeAnimation.transition,
          default: {
            type: "spring",
            stiffness: 500,
            damping: 50,
            restDelta: 0.001
          }
        }
      }}
      className={cn(
        "absolute",
        getWidgetSize(),
        "transition-all duration-300"
      )}
    >
      <Card className={cn(
        "p-4 h-full",
        isEditing ? "cursor-move border-dashed border-2" : "cursor-default",
        isDragging && "shadow-lg"
      )}>
        <AnimatePresence>
          {isEditing && (
            <>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResize();
                }}
              >
                {size === 'large' ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </AnimatePresence>
        <div className="w-full h-full">
          {renderWidget()}
        </div>
      </Card>
    </motion.div>
  );
};
