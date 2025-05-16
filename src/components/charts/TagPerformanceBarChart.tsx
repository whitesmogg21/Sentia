import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
  Cell
} from 'recharts';
import { QBank, QuizHistory } from '@/types/quiz';
import { useMemo } from 'react';

interface TagPerformanceBarChartProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
}

export const TagPerformanceBarChart = ({ qbanks, quizHistory }: TagPerformanceBarChartProps) => {
  // Move uniqueTags calculation outside of tagPerformance useMemo
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.tags.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags);
  }, [qbanks]);

  const tagPerformance = useMemo(() => {
    const tagStats: { [key: string]: { percentages: number[]; total: number } } = {};

    // Initialize statistics for all tags
    uniqueTags.forEach(tag => {
      tagStats[tag] = { percentages: [], total: 0 };
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

      // Calculate and store percentage for each tag in this quiz
      Object.entries(quizTagStats).forEach(([tag, stats]) => {
        if (stats.total > 0) {
          const percentage = (stats.correct / stats.total) * 100;
          tagStats[tag].percentages.push(percentage);
          tagStats[tag].total += stats.total;
        } else {
          tagStats[tag].percentages.push(0);
        }
      });
    });

    // Transform stats into array format for BarChart with error bars
    return Object.entries(tagStats)
      .filter(([_, stats]) => stats.percentages.length > 0)
      .map(([tag, stats]) => {
        const mean = stats.percentages.reduce((a, b) => a + b, 0) / stats.percentages.length;
        const variance = stats.percentages.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / stats.percentages.length;
        const stdError = Math.sqrt(variance / stats.percentages.length);

        return {
          tag,
          percentage: Math.round(mean),
          errorPlus: Math.round(Math.min(100 - mean, stdError * 1.96)),
          errorMinus: Math.round(Math.min(mean, stdError * 1.96)),
          totalQuestions: stats.total,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [qbanks, quizHistory, uniqueTags]);

  // Custom colors for bars
  const colors = [
    '#9b87f5', // Primary purple
    '#8B5CF6', // Vivid purple
    '#D946EF', // Magenta pink
    '#F97316', // Bright orange
    '#0EA5E9', // Ocean blue
  ];

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
          margin={{ top: 20, right: 40, left: 40, bottom: 60 }}
          barGap={4}
          barCategoryGap="12%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            opacity={0.2}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="tag"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
            interval={0}
            tickMargin={8}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
            tickMargin={10}
            padding={{ top: 10 }}
            label={{
              value: "Percentage (%)",
              angle: -90,
              position: "insideLeft",
              fill: "hsl(var(--foreground))",
              style: {
                textAnchor: 'middle',
                fontSize: '14px',
                marginLeft: '10px'
              }
            }}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              padding: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value}% ± ${props.payload.errorPlus}%`,
              "Percentage",
            ]}
            labelFormatter={(label) => `Tag: ${label}`}
          />
          <Bar
            dataKey="percentage"
            fillOpacity={0.85}
            radius={[6, 6, 0, 0]}
          >
            {tagPerformance.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
            <ErrorBar
              dataKey="errorMinus"
              direction="y"
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              opacity={0.4}
              width={8}
            />
            <ErrorBar
              dataKey="errorPlus"
              direction="y"
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              opacity={0.4}
              width={8}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};