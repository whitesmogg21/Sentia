
import { QuizHistory } from "@/types/quiz";
import { useMemo } from "react";

interface CalendarHeatmapProps {
  data: QuizHistory[];
}

export const CalendarHeatmap = ({ data }: CalendarHeatmapProps) => {
  const activityData = useMemo(() => {
    const activityMap = new Map<string, number>();
    
    data.forEach(quiz => {
      const date = new Date(quiz.date).toLocaleDateString();
      const accuracy = (quiz.score / quiz.totalQuestions) * 100;
      activityMap.set(date, (activityMap.get(date) || 0) + accuracy);
    });

    return Array.from(activityMap.entries()).map(([date, value]) => ({
      date,
      value,
    }));
  }, [data]);

  // Simple visualization for now - can be enhanced with a proper calendar view
  return (
    <div className="grid grid-cols-7 gap-1">
      {activityData.map((day, index) => (
        <div
          key={day.date}
          className="aspect-square rounded"
          style={{
            backgroundColor: `rgba(34, 197, 94, ${Math.min(day.value / 100, 1)})`,
          }}
          title={`${day.date}: ${Math.round(day.value)}%`}
        />
      ))}
    </div>
  );
};
