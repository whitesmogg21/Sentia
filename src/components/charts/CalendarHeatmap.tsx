
import { QuizHistory } from "@/types/quiz";
import { useMemo } from "react";
import { addDays, format, startOfWeek, subDays } from "date-fns";

interface CalendarHeatmapProps {
  data: QuizHistory[];
}

interface DayActivity {
  date: Date;
  value: number;
  questionsCount: number;
}

export const CalendarHeatmap = ({ data }: CalendarHeatmapProps) => {
  const activityData = useMemo(() => {
    const activityMap = new Map<string, DayActivity>();
    const today = new Date();
    const yearAgo = subDays(today, 365);
    
    // Initialize all days in the past year
    for (let i = 0; i < 365; i++) {
      const date = addDays(yearAgo, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      activityMap.set(dateStr, {
        date,
        value: 0,
        questionsCount: 0,
      });
    }
    
    // Fill in activity data
    data.forEach(quiz => {
      const date = format(new Date(quiz.date), 'yyyy-MM-dd');
      const existing = activityMap.get(date);
      if (existing) {
        const accuracy = (quiz.score / quiz.totalQuestions) * 100;
        existing.value += accuracy;
        existing.questionsCount += quiz.questionAttempts.length;
      }
    });

    return Array.from(activityMap.values());
  }, [data]);

  const getIntensityClass = (value: number, count: number) => {
    if (count === 0) return "bg-[#ebedf0] dark:bg-gray-900";
    const intensity = Math.min(value / count, 100) / 20;
    return [
      "bg-[#ebedf0] dark:bg-gray-900",
      "bg-[#9be9a8] dark:bg-green-900",
      "bg-[#40c463] dark:bg-green-700",
      "bg-[#30a14e] dark:bg-green-600",
      "bg-[#216e39] dark:bg-green-500",
      "bg-[#1b4c2a] dark:bg-green-400",
    ][Math.floor(intensity)];
  };

  const weeks = useMemo(() => {
    const weeks: DayActivity[][] = [];
    const firstDay = startOfWeek(activityData[0].date);
    let currentWeek: DayActivity[] = [];

    activityData.forEach((day) => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [activityData]);

  const getTooltipText = (day: DayActivity) => {
    if (day.questionsCount === 0) return "No activity";
    const avgAccuracy = Math.round(day.value / day.questionsCount);
    return `${format(day.date, 'MMM d, yyyy')}: ${day.questionsCount} questions (${avgAccuracy}% accuracy)`;
  };

  return (
    <div className="p-2 overflow-x-auto">
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-muted-foreground">Activity over the past year</div>
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-2 h-2 rounded-sm ${getIntensityClass(day.value, day.questionsCount)}`}
                  title={getTooltipText(day)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-sm ${getIntensityClass(level * 20, 1)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
