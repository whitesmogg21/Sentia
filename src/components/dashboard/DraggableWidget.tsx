
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  id: string;
  type: string;
  onDragStart: () => void;
  onDragEnd: (e: any) => void;
  isDragging: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isPlaceholder?: boolean;
  onWidgetAdd?: () => void;
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
  onWidgetAdd
}: DraggableWidgetProps) => {
  return (
    <motion.div
      drag={!isPlaceholder}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
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
