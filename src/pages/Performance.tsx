import { useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Legend, ScatterChart, Scatter, AreaChart, Area, ComposedChart, Cell, Pie, PieChart 
} from "recharts";
import { QuizHistory } from "../types/quiz";
import CircularProgress from "../components/CircularProgress";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarHeatmap } from "@/components/charts/CalendarHeatmap";

interface PerformanceProps {
  quizHistory: QuizHistory[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Performance = ({ quizHistory }: PerformanceProps) => {
  // Transform quiz history data to percentage scores over time
  const chartData = quizHistory.map((quiz, index) => ({
    quizNumber: index + 1,
    score: (quiz.score / quiz.totalQuestions) * 100,
    date: new Date(quiz.date).toLocaleDateString(),
  }));

  // Calculate performance by tags
  const tagPerformance = useMemo(() => {
    const tagStats: { [key: string]: { correct: number; total: number } } = {};
    
    quizHistory.forEach(quiz => {
      quiz.questionAttempts.forEach(attempt => {
        // Get tags from the question attempt itself since it's part of QuizHistory
        if (attempt.tags) {
          attempt.tags.forEach(tag => {
            if (!tagStats[tag]) {
              tagStats[tag] = { correct: 0, total: 0 };
            }
            tagStats[tag].total += 1;
            if (attempt.isCorrect) {
              tagStats[tag].correct += 1;
            }
          });
        }
      });
    });

    return Object.entries(tagStats).map(([tag, stats]) => ({
      tag,
      accuracy: (stats.correct / stats.total) * 100,
      questionsAttempted: stats.total,
      correct: stats.correct,
      incorrect: stats.total - stats.correct,
    }));
  }, [quizHistory]);

  // Add new transformed data for tag scores
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

  // Calculate time-based performance trends
  const timeBasedPerformance = useMemo(() => {
    const performanceByMonth: { [key: string]: { total: number; correct: number; avgTimeSpent: number } } = {};
    
    quizHistory.forEach(quiz => {
      const monthYear = new Date(quiz.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!performanceByMonth[monthYear]) {
        performanceByMonth[monthYear] = { total: 0, correct: 0, avgTimeSpent: 0 };
      }
      performanceByMonth[monthYear].total += quiz.questionAttempts.length;
      performanceByMonth[monthYear].correct += quiz.questionAttempts.filter(a => a.isCorrect).length;
    });

    return Object.entries(performanceByMonth).map(([month, stats]) => ({
      month,
      accuracy: (stats.correct / stats.total) * 100,
      questionsAttempted: stats.total,
      avgTimeSpent: stats.avgTimeSpent,
    }));
  }, [quizHistory]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const total = quizHistory.reduce((acc, quiz) => acc + quiz.questionAttempts.length, 0);
    const correct = quizHistory.reduce((acc, quiz) => 
      acc + quiz.questionAttempts.filter(a => a.isCorrect).length, 0);
    const skipped = quizHistory.reduce((acc, quiz) => 
      acc + quiz.questionAttempts.filter(a => a.selectedAnswer === null).length, 0);
    
    return [
      { name: 'Correct', value: correct },
      { name: 'Incorrect', value: total - correct - skipped },
      { name: 'Skipped', value: skipped },
    ];
  }, [quizHistory]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Performance Analytics</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
              <CircularProgress percentage={overallStats[0].value} />
            </Card>

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
        </TabsContent>

        <TabsContent value="topics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Topic Performance</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={tagPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="tag" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Accuracy"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Questions per Topic</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="questionsAttempted" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeBasedPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Topic Progress</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="questionsAttempted" name="Questions Attempted" />
                    <YAxis dataKey="accuracy" name="Accuracy %" domain={[0, 100]} />
                    <Tooltip />
                    <Scatter name="Topics" data={tagPerformance} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {overallStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Topic Performance Breakdown</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="correct" stackId="a" fill="#00C49F" name="Correct" />
                    <Bar dataKey="incorrect" stackId="a" fill="#FF8042" name="Incorrect" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Progress Over Time</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeBasedPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Activity Heatmap</h3>
              <div className="h-[300px]">
                <CalendarHeatmap data={quizHistory} />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tag Performance Matrix</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="questionsAttempted" name="Questions Attempted" />
                    <YAxis type="number" dataKey="accuracy" name="Accuracy %" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Topics" data={tagPerformance} fill="#8884d8">
                      {tagPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
