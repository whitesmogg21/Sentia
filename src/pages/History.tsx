import { QBank, QuizHistory } from "@/types/quiz";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface HistoryProps {
  quizHistory: QuizHistory[];
  qbanks: QBank[];
}

const History = ({ quizHistory, qbanks }: HistoryProps) => {
  const chartData = useMemo(() => 
    quizHistory.map((quiz, index) => ({
      attemptNumber: index + 1,
      score: (quiz.score / quiz.totalQuestions) * 100,
      date: new Date(quiz.date).toLocaleDateString(),
    })), [quizHistory]);

  const tagScores = useMemo(() => {
    const tagStats: { [key: string]: { correct: number; total: number } } = {};
    
    quizHistory.forEach(quiz => {
      quiz.questionAttempts.forEach(attempt => {
        attempt.tags.forEach(tag => {
          if (!tagStats[tag]) {
            tagStats[tag] = { correct: 0, total: 0 };
          }
          tagStats[tag].total += 1;
          if (attempt.isCorrect) {
            tagStats[tag].correct += 1;
          }
        });
      });
    });

    return Object.entries(tagStats).map(([tag, stats]) => ({
      tag,
      score: (stats.correct / stats.total) * 100
    }));
  }, [quizHistory]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Quiz History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
          <div className="h-[300px] grid grid-rows-2 gap-4">
            <div className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagScores}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="tag"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="hsl(var(--primary))"
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default History;
