
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import CircularProgress from "../CircularProgress";
import { CalendarHeatmap } from "../charts/CalendarHeatmap";
import { TagPerformanceBarChart } from "../charts/TagPerformanceBarChart";
import { TagPerformanceChart } from "../TagPerformanceChart";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  id: string;
  type: string;
  onRemove: (id: string) => void;
  isEditing: boolean;
  data: any;
}

export const DraggableWidget = ({ id, type, onRemove, isEditing, data }: DraggableWidgetProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Reset position when editing mode is disabled
  useEffect(() => {
    if (!isEditing) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isEditing]);

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
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <motion.div
      drag={isEditing}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        if (!isEditing) {
          setPosition({ x: 0, y: 0 });
        }
      }}
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
