
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

export const TagPerformanceChart = ({ qbanks, quizHistory }: TagPerformanceChartProps) => {
  const tagPerformance = useMemo(() => {
    const tagStats: { [key: string]: { correct: number; total: number } } = {};
    
    const uniqueTags = new Set<string>();
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.tags.forEach(tag => uniqueTags.add(tag));
      });
    });

    uniqueTags.forEach(tag => {
      tagStats[tag] = { correct: 0, total: 0 };
    });

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

    return Object.entries(tagStats)
      .filter(([_, stats]) => stats.total > 0)
      .map(([tag, stats]) => ({
        tag,
        score: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        correct: stats.correct,
        total: stats.total,
      }));
  }, [qbanks, quizHistory]);

  if (tagPerformance.length === 0) {
    return (
      <Card className="p-4 flex flex-col items-center">
        <h3 className="text-sm font-medium mb-2">Performance by Tag</h3>
        <p className="text-sm text-muted-foreground">No tag data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col items-center">
      <h3 className="text-sm font-medium mb-2">Performance by Tag</h3>
      <div className="w-[100px] h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={tagPerformance} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <PolarGrid 
              stroke="hsl(var(--muted-foreground))" 
              strokeOpacity={0.2}
            />
            <PolarAngleAxis
              dataKey="tag"
              tick={({ x, y, payload, index }) => (
                <g transform={`translate(${x},${y})`}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <circle
                        cx={0}
                        cy={0}
                        r={3}
                        fill="hsl(var(--muted-foreground))"
                        opacity={0.5}
                        style={{ cursor: 'pointer' }}
                      />
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="right" 
                      align="start" 
                      className="w-[150px] bg-card"
                    >
                      <p className="text-sm font-medium">{payload.value}</p>
                    </HoverCardContent>
                  </HoverCard>
                </g>
              )}
              tickFormatter={() => ''}
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
