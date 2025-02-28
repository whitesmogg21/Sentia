
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { QuizHistory } from "../types/quiz";
import CircularProgress from "../components/CircularProgress";

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

  // Calculate overall accuracy
  const overallAccuracy = useMemo(() => {
    const totalCorrect = quizHistory.reduce((acc, quiz) => 
      acc + quiz.questionAttempts.filter(attempt => attempt.isCorrect).length, 0);
    const totalAttempts = quizHistory.reduce((acc, quiz) => 
      acc + quiz.questionAttempts.filter(attempt => attempt.selectedAnswer !== null).length, 0);
    
    return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
  }, [quizHistory]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Detailed Performance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left section - Circular Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center">
          <CircularProgress percentage={overallAccuracy} />
        </div>

        {/* Right section - Performance Graph */}
        <div className="bg-white rounded-2xl shadow-lg p-6 h-[400px]">
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
    </div>
  );
};

export default Performance;
