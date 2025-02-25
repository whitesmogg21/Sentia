
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MutableRefObject, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagPerformanceChart } from "@/components/TagPerformanceChart";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/CircularProgress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [isResizing, setIsResizing] = useState(false);

  const renderWidgetContent = () => {
    switch(type) {
      case 'accuracy':
        return (
          <>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-full">
                <CircularProgress value={data.accuracy} size={100} strokeWidth={10} />
                <p className="mt-2 text-xl font-bold">{data.accuracy.toFixed(1)}%</p>
              </div>
            </CardContent>
          </>
        );
      case 'progress':
        const completed = data.metrics.used;
        const total = data.metrics.used + data.metrics.unused;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        
        return (
          <>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completion Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completed} completed</span>
                  <span>{total} total</span>
                </div>
              </div>
            </CardContent>
          </>
        );
      case 'tags':
        return (
          <>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tag Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <TagPerformanceChart 
                  qbanks={data.qbanks} 
                  quizHistory={data.quizHistory} 
                />
              </div>
            </CardContent>
          </>
        );
      case 'history':
        const chartData = data.quizHistory.slice(-5).map((quiz: any, index: number) => ({
          name: `Quiz ${index + 1}`,
          score: (quiz.score / quiz.totalQuestions) * 100
        }));
        
        return (
          <>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Quiz Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unknown widget type: {type}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      drag={!isPlaceholder && !isResizing}
      dragConstraints={canvasRef}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrag={(event, info) => {
        if (!isResizing) {
          onDrag(info.point.x, info.point.y);
        }
      }}
      className={cn(
        "absolute cursor-grab active:cursor-grabbing",
        isDragging && "z-50",
        isPlaceholder && "cursor-pointer",
        isResizing && "cursor-default"
      )}
      style={{
        position: 'relative',
        ...style
      }}
    >
      <Card className="w-full h-full min-w-[250px] min-h-[200px] relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10" 
          onClick={() => onRemove(id)}
        >
          <X className="h-4 w-4" />
        </Button>
        {isPlaceholder ? (
          <div className="flex items-center justify-center h-full" onClick={onWidgetAdd}>
            <span className="text-muted-foreground text-center">Click to add widget</span>
          </div>
        ) : (
          renderWidgetContent()
        )}
      </Card>
    </motion.div>
  );
};
