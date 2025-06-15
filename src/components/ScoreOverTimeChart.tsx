
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from './ui/card';
import { QuizHistory } from '@/types/quiz';

interface ScoreOverTimeChartProps {
  quizHistory: QuizHistory[];
}

export const ScoreOverTimeChart = ({ quizHistory }: ScoreOverTimeChartProps) => {
  const chartData = useMemo(() =>
    quizHistory.map((quiz, index) => ({
      attemptNumber: index + 1,
      score: Math.round((quiz.score / quiz.totalQuestions) * 100),
      date: quiz.date,
    })), [quizHistory]);

  if (chartData.length === 0) {
    return (
      <Card className="p-4 flex flex-col items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No quiz data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-medium mb-2">Score Over Time</h3>
      <div className="w-full h-32 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="attemptNumber"
              tick={{
                fill: "hsl(var(--foreground))",
                fontSize: 12,
              }}
              tickMargin={5}
            />
            <YAxis
              domain={[0, 100]}
              tick={{
                fill: "hsl(var(--foreground))",
                fontSize: 12,
              }}
              tickMargin={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, "Score"]}
              labelFormatter={(label) => `Quiz #${label}`}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: "hsl(var(--primary))",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke: "hsl(var(--primary))",
                strokeWidth: 2,
                fill: "hsl(var(--background))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
