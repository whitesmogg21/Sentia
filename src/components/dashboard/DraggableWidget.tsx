
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MutableRefObject } from "react";

interface DraggableWidgetProps {
  id: string;
  type: string;
  data: {
    accuracy: number;
    quizHistory: any[];
    qbanks: any[];
    metrics: any;
    tagPerformance: any[];
  };
  onDragStart?: () => void;
  onDragEnd?: (e: any) => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isPlaceholder?: boolean;
  onWidgetAdd?: () => void;
  onRemove: (id: string) => void;
  initialPosition?: { x: number; y: number };
  onDrag: (x: number, y: number) => void;
  canvasRef: MutableRefObject<HTMLDivElement | null>;
}

export const DraggableWidget = ({
  id,
  type,
  onDragStart,
  onDragEnd,
  isDragging,
  style,
  children,
  isPlaceholder,
  onWidgetAdd,
  onRemove,
  data,
  initialPosition,
  onDrag,
  canvasRef
}: DraggableWidgetProps) => {
  return (
    <motion.div
      drag={!isPlaceholder}
      dragConstraints={canvasRef}
      dragElastic={0.1}
      dragMomentum={false}
      initial={initialPosition}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrag={(event, info) => {
        onDrag(info.point.x, info.point.y);
      }}
      style={style}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing",
        isDragging && "z-50",
        isPlaceholder && "cursor-pointer"
      )}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <Card
            className={cn(
              "p-4 min-w-[200px] min-h-[150px]",
              isPlaceholder && "flex items-center justify-center"
            )}
            onClick={isPlaceholder ? onWidgetAdd : undefined}
          >
            {isPlaceholder ? (
              <span className="text-gray-300 text-center">
                Click here to add widgets
              </span>
            ) : (
              children
            )}
          </Card>
        </ResizablePanel>
        <ResizableHandle />
      </ResizablePanelGroup>
    </motion.div>
  );
};
