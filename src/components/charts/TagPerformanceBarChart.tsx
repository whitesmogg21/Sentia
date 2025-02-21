
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ErrorBar
} from 'recharts';
import { QBank, QuizHistory } from '@/types/quiz';
import { useMemo } from 'react';

interface TagPerformanceBarChartProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
}

export const TagPerformanceBarChart = ({ qbanks, quizHistory }: TagPerformanceBarChartProps) => {
  const tagPerformance = useMemo(() => {
    const tagStats: { [key: string]: { scores: number[]; total: number } } = {};
    
    // First collect all unique tags from qbanks
    const uniqueTags = new Set<string>();
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.tags.forEach(tag => uniqueTags.add(tag));
      });
    });

    // Initialize statistics for all tags
    uniqueTags.forEach(tag => {
      tagStats[tag] = { scores: [], total: 0 };
    });

    // Calculate statistics from quiz history
    quizHistory.forEach(quiz => {
      const quizTagStats: { [key: string]: { correct: number; total: number } } = {};
      
      quiz.questionAttempts.forEach(attempt => {
        const question = qbanks
          .flatMap(qbank => qbank.questions)
          .find(q => q.id === attempt.questionId);
          
        if (question) {
          question.tags.forEach(tag => {
            if (!quizTagStats[tag]) {
              quizTagStats[tag] = { correct: 0, total: 0 };
            }
            quizTagStats[tag].total += 1;
            if (attempt.isCorrect) {
              quizTagStats[tag].correct += 1;
            }
          });
        }
      });

      // Calculate and store score for each tag in this quiz
      Object.entries(quizTagStats).forEach(([tag, stats]) => {
        if (stats.total > 0) {
          const score = (stats.correct / stats.total) * 100;
          tagStats[tag].scores.push(score);
          tagStats[tag].total += stats.total;
        }
      });
    });

    // Transform stats into array format for BarChart with error bars
    return Object.entries(tagStats)
      .filter(([_, stats]) => stats.scores.length > 0)
      .map(([tag, stats]) => {
        const mean = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
        const variance = stats.scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / stats.scores.length;
        const stdError = Math.sqrt(variance / stats.scores.length);

        return {
          tag,
          score: Math.round(mean),
          errorPlus: Math.min(100 - mean, stdError * 1.96),
          errorMinus: Math.min(mean, stdError * 1.96),
          totalQuestions: stats.total,
        };
      });
  }, [qbanks, quizHistory]);

  if (tagPerformance.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No tag data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={tagPerformance}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="tag"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            label={{
              value: "Score (%)",
              angle: -90,
              position: "insideLeft",
              fill: "hsl(var(--foreground))",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            formatter={(value: number) => [`${value}%`, "Score"]}
          />
          <Bar
            dataKey="score"
            fill="hsl(var(--primary))"
            fillOpacity={0.8}
          >
            <ErrorBar
              dataKey="errorMinus"
              direction="y"
              stroke="hsl(var(--foreground))"
              strokeWidth={1}
            />
            <ErrorBar
              dataKey="errorPlus"
              direction="y"
              stroke="hsl(var(--foreground))"
              strokeWidth={1}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
