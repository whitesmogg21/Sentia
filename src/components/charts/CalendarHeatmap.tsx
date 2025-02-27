
import { QuizHistory } from "@/types/quiz";
import { useMemo, useEffect, useState } from "react";
import { addDays, format, startOfWeek, subDays, differenceInDays } from "date-fns";

interface CalendarHeatmapProps {
  data: QuizHistory[];
}

interface DayActivity {
  date: Date;
  questionsCount: number;
}

export const CalendarHeatmap = ({ data }: CalendarHeatmapProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update the current date every 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    return () => clearInterval(interval);
  }, []);

  const activityData = useMemo(() => {
    const activityMap = new Map<string, DayActivity>();
    const yearAgo = subDays(currentDate, 365);
    
    // Initialize all days in the past year
    for (let i = 0; i < 365; i++) {
      const date = addDays(yearAgo, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      activityMap.set(dateStr, {
        date,
        questionsCount: 0
      });
    }
    
    // Fill in activity data based on number of questions attempted
    data.forEach(quiz => {
      const date = format(new Date(quiz.date), 'yyyy-MM-dd');
      const existing = activityMap.get(date);
      if (existing) {
        existing.questionsCount += quiz.questionAttempts.length;
      }
    });

    return Array.from(activityMap.values());
  }, [data, currentDate]);

  const getIntensityClass = (questionsCount: number) => {
    // Define thresholds for question count (adjust these based on your needs)
    if (questionsCount === 0) return "bg-[#ebedf0] dark:bg-gray-900";
    if (questionsCount <= 5) return "bg-[#9be9a8] dark:bg-green-900";
    if (questionsCount <= 10) return "bg-[#40c463] dark:bg-green-700";
    if (questionsCount <= 20) return "bg-[#30a14e] dark:bg-green-600";
    if (questionsCount <= 30) return "bg-[#216e39] dark:bg-green-500";
    return "bg-[#1b4c2a] dark:bg-green-400";
  };

  const weeks = useMemo(() => {
    const weeks: DayActivity[][] = [];
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
    if (day.questionsCount === 0) return "No questions attempted";
    return `${format(day.date, 'MMM d, yyyy')}: ${day.questionsCount} questions attempted`;
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
                  className={`w-2 h-2 rounded-sm ${getIntensityClass(day.questionsCount)}`}
                  title={getTooltipText(day)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 5, 10, 20, 30, 40].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-sm ${getIntensityClass(level)}`}
                title={`${level} questions`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
