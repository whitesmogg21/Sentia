
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { QuizHistory } from "../types/quiz";

interface PerformanceProps {
  quizHistory: QuizHistory[];
}

const Performance = ({ quizHistory }: PerformanceProps) => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Detailed Performance</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={quizHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Performance;
