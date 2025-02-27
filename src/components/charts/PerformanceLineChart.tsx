
import { useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from "recharts";
import { QuizHistory } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface PerformanceLineChartProps {
  quizHistory: QuizHistory[];
}

const PerformanceLineChart = ({ quizHistory }: PerformanceLineChartProps) => {
  const chartData = useMemo(() => {
    return quizHistory.map((quiz, index) => {
      const scorePercentage = (quiz.score / quiz.totalQuestions) * 100;
      return {
        name: `Quiz ${index + 1}`,
        score: parseFloat(scorePercentage.toFixed(1)),
        date: format(new Date(quiz.date), 'MMM d, yyyy'),
        totalQuestions: quiz.totalQuestions,
      };
    });
  }, [quizHistory]);

  if (quizHistory.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">Take quizzes to see your performance over time</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Performance Over Time</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'rgba(107, 114, 128, 0.6)' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'rgba(107, 114, 128, 0.6)' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Score']}
              labelFormatter={(label) => `${label}`}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
                      <p className="font-medium">{label} - {data.date}</p>
                      <p className="text-primary font-bold">{`Score: ${data.score}%`}</p>
                      <p className="text-sm text-gray-500">{`Questions: ${data.totalQuestions}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <ReferenceLine 
              y={70} 
              label={{ 
                value: "Passing (70%)", 
                position: "insideBottomRight",
                fontSize: 11
              }} 
              stroke="#84cc16" 
              strokeDasharray="3 3" 
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Score (%)"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PerformanceLineChart;
