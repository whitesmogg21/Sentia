
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { QuizHistory } from "../types/quiz";

interface PerformanceProps {
  quizHistory: QuizHistory[];
}

const Performance = ({ quizHistory }: PerformanceProps) => {
  // Transform quiz history data to percentage scores
  const chartData = quizHistory.map((quiz, index) => ({
    quizNumber: index + 1,
    score: (quiz.score / quiz.totalQuestions) * 100,
    date: quiz.date,
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Detailed Performance</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="quizNumber" 
              label={{ value: 'Quiz Number', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
              labelFormatter={(label) => `Quiz ${label}`}
            />
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
