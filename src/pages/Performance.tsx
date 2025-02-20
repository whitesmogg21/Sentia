
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ScatterChart, Scatter } from "recharts";
import { QuizHistory } from "../types/quiz";
import CircularProgress from "../components/CircularProgress";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerformanceProps {
  quizHistory: QuizHistory[];
}

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
        const question = quiz.questions?.find(q => q.id === attempt.questionId);
        if (question) {
          question.tags.forEach(tag => {
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
    }));
  }, [quizHistory]);

  // Calculate time-based performance trends
  const timeBasedPerformance = useMemo(() => {
    const performanceByMonth: { [key: string]: { total: number; correct: number } } = {};
    
    quizHistory.forEach(quiz => {
      const monthYear = new Date(quiz.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!performanceByMonth[monthYear]) {
        performanceByMonth[monthYear] = { total: 0, correct: 0 };
      }
      performanceByMonth[monthYear].total += quiz.questionAttempts.length;
      performanceByMonth[monthYear].correct += quiz.questionAttempts.filter(a => a.isCorrect).length;
    });

    return Object.entries(performanceByMonth).map(([month, stats]) => ({
      month,
      accuracy: (stats.correct / stats.total) * 100,
      questionsAttempted: stats.total,
    }));
  }, [quizHistory]);

  // Calculate overall accuracy
  const overallAccuracy = useMemo(() => {
    const totalCorrect = quizHistory.reduce((acc, quiz) => 
      acc + quiz.questionAttempts.filter(attempt => attempt.isCorrect).length, 0);
    const totalAttempts = quizHistory.reduce((acc, quiz) => 
      acc + quiz.questionAttempts.filter(attempt => attempt.selectedAnswer !== null).length, 0);
    
    return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
  }, [quizHistory]);

  // Calculate weak areas (tags with < 60% accuracy)
  const weakAreas = useMemo(() => {
    return tagPerformance.filter(tag => tag.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [tagPerformance]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Performance Analytics</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
              <CircularProgress percentage={overallAccuracy} />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
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

        <TabsContent value="trends" className="space-y-6">
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
            <h3 className="text-lg font-semibold mb-4">Areas Needing Improvement</h3>
            <div className="space-y-4">
              {weakAreas.map((area) => (
                <div key={area.tag} className="flex justify-between items-center">
                  <span className="font-medium">{area.tag}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {area.questionsAttempted} questions attempted
                    </span>
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div
                        className="bg-destructive h-2 rounded-full"
                        style={{ width: `${area.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm">{Math.round(area.accuracy)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
