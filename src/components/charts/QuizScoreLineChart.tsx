
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "../ui/card";

interface QuizScoreData {
  attemptNumber: number;
  score: number;
  date: string;
}

interface QuizScoreLineChartProps {
  data: QuizScoreData[];
}

const QuizScoreLineChart: React.FC<QuizScoreLineChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">No quiz data available yet. Take a quiz to see your progress!</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Quiz Score Progress</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="attemptNumber"
              label={{ value: "Quiz Number", position: "insideBottomRight", offset: -10 }}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: "Score (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Score"]}
              labelFormatter={(label) => `Quiz #${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Score (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default QuizScoreLineChart;
