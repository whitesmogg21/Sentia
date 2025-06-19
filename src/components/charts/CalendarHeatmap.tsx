import { QuizHistory } from "@/types/quiz";
import {
  addDays,
  format,
  startOfYear,
  endOfYear,
  getYear,
  isLeapYear,
  getMonth,
  getDate,
} from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Link } from "react-router-dom";

interface CalendarHeatmapProps {
  data: QuizHistory[];
}

interface DayActivity {
  date: Date;
  questionsCount: number;
}

const COLOR_THRESHOLDS = [
  { limit: 0, class: "bg-[#ebedf0] dark:bg-gray-900" },
  { limit: 5, class: "bg-[#9be9a8] dark:bg-green-900" },
  { limit: 10, class: "bg-[#40c463] dark:bg-green-700" },
  { limit: 20, class: "bg-[#30a14e] dark:bg-green-600" },
  { limit: 30, class: "bg-[#216e39] dark:bg-green-500" },
  { limit: Infinity, class: "bg-[#1b4c2a] dark:bg-green-400" },
];

const getIntensityClass = (count: number) =>
  COLOR_THRESHOLDS.find(({ limit }) => count <= limit)?.class || "";

export const CalendarHeatmap = ({ data }: CalendarHeatmapProps) => {
  const currentYear = getYear(new Date());
  const recentYears = Array.from({ length: 6 }, (_, i) => currentYear - i).reverse();

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const activityData = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0));
    const end = endOfYear(new Date(selectedYear, 0));
    const days = isLeapYear(start) ? 366 : 365;

    const map = new Map<string, DayActivity>();

    for (let i = 0; i < days; i++) {
      const date = addDays(start, i);
      const key = format(date, "yyyy-MM-dd");
      map.set(key, { date, questionsCount: 0 });
    }

    data.forEach((quiz) => {
      const dateObj = new Date(quiz.date);
      if (getYear(dateObj) !== selectedYear) return;

      const key = format(dateObj, "yyyy-MM-dd");
      if (map.has(key)) {
        map.get(key)!.questionsCount += quiz.questionAttempts.length;
      }
    });

    return Array.from(map.values());
  }, [data, selectedYear]);

  const weeks = useMemo(() => {
    return activityData.reduce<DayActivity[][]>((weeks, day, i) => {
      const weekIndex = Math.floor(i / 7);
      if (!weeks[weekIndex]) weeks[weekIndex] = [];
      weeks[weekIndex].push(day);
      return weeks;
    }, []);
  }, [activityData]);

  const monthLabels = useMemo(() => {
    const seen = new Set<number>();
    return weeks.map((week, i) => {
      const firstDay = week[0];
      const month = getMonth(firstDay.date);
      if (!seen.has(month)) {
        seen.add(month);
        return { index: i, name: format(firstDay.date, "MMM") };
      }
      return null;
    }).filter(Boolean) as { index: number; name: string }[];
  }, [weeks]);

  const getTooltipText = (day: DayActivity) => {
    return day.questionsCount === 0
      ? "No questions attempted"
      : `${format(day.date, "MMM d, yyyy")}: ${day.questionsCount} questions attempted`;
  };

  return (
    <Card className="p-5 overflow-x-auto">
      <h3 className="text-sm font-medium mb-2">Daily Performance</h3>
      <div className="flex flex-col gap-2 min-w-fit">
        {/* Year Filter */}
        <div className="flex gap-2 items-center flex-wrap pt-2">
          {recentYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-2 py-1 text-xs border rounded-full transition ${
                year === selectedYear
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/60 text-muted-foreground"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Month Labels */}
        <div className="flex ml-6 gap-[2px]">
          {weeks.map((_, i) => {
            const label = monthLabels.find((m) => m.index === i);
            return (
              <div key={i} className="w-3 h-3 text-[10px] text-muted-foreground">
                {label?.name ?? ""}
              </div>
            );
          })}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day, dayIndex) => (
                <Link to={'/history'} state={day.date}>
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm cursor-pointer ${getIntensityClass(day.questionsCount)}`}
                  title={getTooltipText(day)}
                  />
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
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
    </Card>
  );
};
