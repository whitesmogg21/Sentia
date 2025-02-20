
import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Card } from './ui/card';
import { QBank, QuizHistory } from '@/types/quiz';

interface TagPerformanceChartProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
}

interface TagStats {
  tag: string;
  score: number;
  correct: number;
  total: number;
}

export const TagPerformanceChart = ({ qbanks, quizHistory }: TagPerformanceChartProps) => {
  const tagPerformance = useMemo(() => {
    const tagStats: { [key: string]: { correct: number; total: number } } = {};
    
    // Collect all unique tags from questions
    const uniqueTags = new Set<string>();
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.tags.forEach(tag => uniqueTags.add(tag));
      });
    });

    // Initialize stats for all tags
    uniqueTags.forEach(tag => {
      tagStats[tag] = { correct: 0, total: 0 };
    });

    // Calculate performance for each tag
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

    // Convert to array and sort by tag name for consistency
    return Object.entries(tagStats)
      .filter(([_, stats]) => stats.total > 0)
      .map(([tag, stats]) => ({
        tag,
        score: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        correct: stats.correct,
        total: stats.total,
      }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [qbanks, quizHistory]);

  if (tagPerformance.length === 0) {
    return (
      <Card className="p-4 flex flex-col items-center">
        <h3 className="text-sm font-medium mb-2">Tag Performance</h3>
        <p className="text-sm text-muted-foreground">No tag data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col items-center">
      <h3 className="text-sm font-medium mb-2">Tag Performance</h3>
      <div className="w-[150px] h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={tagPerformance} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <PolarGrid stroke="hsl(var(--muted-foreground))" />
            <PolarAngleAxis
              dataKey="tag"
              tick={({ x, y, payload, index }) => (
                <g transform={`translate(${x},${y})`}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <circle
                        cx={0}
                        cy={0}
                        r={4}
                        fill="hsl(var(--primary))"
                        style={{ cursor: 'pointer' }}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent side="right" align="start" className="w-[200px]">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{payload.value}</p>
                        <div className="text-sm">
                          <p>Score: {tagPerformance[index].score.toFixed(1)}%</p>
                          <p>Correct: {tagPerformance[index].correct}</p>
                          <p>Total: {tagPerformance[index].total}</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </g>
              )}
              stroke="hsl(var(--muted-foreground))"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Hover over points to see details
      </div>
    </Card>
  );
};
