
import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card } from './ui/card';
import { QBank, QuizHistory } from '@/types/quiz';

interface TagPerformanceChartProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
}

export const TagPerformanceChart = ({ qbanks, quizHistory }: TagPerformanceChartProps) => {
  const tagPerformance = useMemo(() => {
    const tagStats: { [key: string]: { correct: number; total: number } } = {};
    
    // First collect all unique tags from qbanks
    const uniqueTags = new Set<string>();
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.tags.forEach(tag => uniqueTags.add(tag));
      });
    });

    // Initialize statistics for all tags
    uniqueTags.forEach(tag => {
      tagStats[tag] = { correct: 0, total: 0 };
    });

    // Calculate statistics from quiz history
    quizHistory.forEach(quiz => {
      quiz.questionAttempts.forEach(attempt => {
        const question = qbanks
          .flatMap(qbank => qbank.questions)
          .find(q => q.id === attempt.questionId);
          
        if (question) {
          question.tags.forEach(tag => {
            tagStats[tag].total += 1;
            if (attempt.isCorrect) {
              tagStats[tag].correct += 1;
            }
          });
        }
      });
    });

    // Transform stats into array format for RadarChart
    return Object.entries(tagStats)
      .filter(([_, stats]) => stats.total > 0)
      .map(([tag, stats]) => ({
        tag,
        score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
      }));
  }, [qbanks, quizHistory]);

  if (tagPerformance.length === 0) {
    return (
      <Card className="p-4 flex flex-col items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No tag data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col items-center h-full aspect-square">
      <h3 className="text-sm font-medium mb-2">Tag Performance</h3>
      <div className="w-full h-[calc(100%-2rem)] min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={tagPerformance}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <PolarGrid 
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.2}
            />
            <PolarAngleAxis
              dataKey="tag"
              tick={{ 
                fill: "hsl(var(--foreground))",
                fontSize: 10
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ 
                fill: "hsl(var(--foreground))",
                fontSize: 10
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number, name: string) => [`${value}%`, name]}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
