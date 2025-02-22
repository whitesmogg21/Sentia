
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
  isEditing: boolean;
  data: any;
  initialPosition?: { x: number; y: number };
  onDrag: (x: number, y: number) => void;
}

export const DraggableWidget = ({ 
  id, 
  type, 
  onRemove, 
  isEditing, 
  data,
  initialPosition,
  onDrag
}: DraggableWidgetProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    setPosition(newPosition);
    onDrag(newPosition.x, newPosition.y);
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
      drag={isEditing}
      dragMomentum={false}
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
            stiffness: 300,
            damping: 20
          }
        }
      }}
      className="relative"
    >
      <Card className={cn(
        "p-4",
        isEditing ? "cursor-move border-dashed border-2" : "cursor-default",
        isDragging && "shadow-lg"
      )}>
        <AnimatePresence>
          {isEditing && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 rounded-full z-10"
              onClick={() => onRemove(id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </AnimatePresence>
        {renderWidget()}
      </Card>
    </motion.div>
  );
};
