import { useMemo, useState, useRef, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TagPerformanceChartProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
}

export const TagPerformanceChart = ({ qbanks, quizHistory }: TagPerformanceChartProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tagPerformance = useMemo(() => {
    const tagStats: Record<string, { correct: number; total: number }> = {};

    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.tags.forEach(tag => {
          if (!tagStats[tag]) tagStats[tag] = { correct: 0, total: 0 };
        });
      });
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
        score: Math.round((stats.correct / stats.total) * 100),
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
      }));
  }, [qbanks, quizHistory]);

  const performanceTags = tagPerformance.map(tp => tp.tag);

  // Ensure at least one tag is always selected
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        if (prev.length === 1) return prev; // prevent empty
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Initialize selectedTags on first load
  useEffect(() => {
    if (tagPerformance.length > 0 && selectedTags.length === 0) {
      setSelectedTags(tagPerformance.map(tp => tp.tag));
    }
  }, [tagPerformance]);

  const filteredData = tagPerformance.filter(perf => selectedTags.includes(perf.tag));

  if (filteredData.length === 0) {
    return (
      <Card className="p-4 flex flex-col items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No tag data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-medium mb-2 text-center">Tag Performance</h3>

      {/* Radar Chart */}
      <div className="flex-1 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={filteredData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
            <PolarAngleAxis
              dataKey="tag"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
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

      {/* Tag Filter Bar */}
      <div className="w-full overflow-x-auto mb-2">
        <div className="flex gap-2 w-max px-1">
          {performanceTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                'px-3 py-1 text-sm rounded-full border transition-colors whitespace-nowrap',
                selectedTags.includes(tag)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-muted text-foreground border-border'
              )}
            >
              <div className="flex items-center gap-1">
                {selectedTags.includes(tag) && <Check size={14} />}
                <span>{tag}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
