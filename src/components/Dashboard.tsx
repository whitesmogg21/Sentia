import { useState, useMemo, useEffect } from "react";
import { QBank, QuizHistory, QuestionFilter } from "../types/quiz";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import CircularProgress from "./CircularProgress";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { CalendarHeatmap } from "./charts/CalendarHeatmap";
import { TagPerformanceChart } from "./TagPerformanceChart";

interface DashboardProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
  onStartQuiz: (qbankId: string, questionCount: number, tutorMode: boolean, timerEnabled: boolean, timeLimit: number) => void;
}

const Dashboard = ({ qbanks, quizHistory, onStartQuiz }: DashboardProps) => {
  const navigate = useNavigate();
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [tutorMode, setTutorMode] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [filters, setFilters] = useState<QuestionFilter>({
    unused: false,
    used: false,
    correct: false,
    incorrect: false,
    flagged: false,
    omitted: false,
  });
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedQBank = localStorage.getItem('selectedQBank');
    if (storedQBank) {
      const qbankData = JSON.parse(storedQBank);
      const foundQBank = qbanks.find(qb => qb.id === qbankData.id);
      if (foundQBank) {
        setSelectedQBank(foundQBank);
      }
    }
  }, [qbanks]);

  const metrics = useMemo(() => {
    const seenQuestionIds = new Set<number>();
    const correctQuestionIds = new Set<number>();
    const incorrectQuestionIds = new Set<number>();
    const omittedQuestionIds = new Set<number>();
    const flaggedQuestionIds = new Set<number>();
    
    quizHistory.forEach(quiz => {
      quiz.questionAttempts.forEach(attempt => {
        seenQuestionIds.add(attempt.questionId);
        
        if (attempt.selectedAnswer === null) {
          incorrectQuestionIds.add(attempt.questionId);
          omittedQuestionIds.add(attempt.questionId);
        } else if (attempt.isCorrect) {
          correctQuestionIds.add(attempt.questionId);
        } else {
          incorrectQuestionIds.add(attempt.questionId);
        }
      });
    });

    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        if (question.isFlagged) {
          flaggedQuestionIds.add(question.id);
        }
      });
    });

    const totalQuestions = qbanks.reduce((acc, qbank) => 
      acc + qbank.questions.length, 0);

    const unusedCount = totalQuestions - seenQuestionIds.size;

    return {
      unused: unusedCount,
      used: seenQuestionIds.size,
      correct: correctQuestionIds.size,
      incorrect: incorrectQuestionIds.size,
      flagged: flaggedQuestionIds.size,
      omitted: omittedQuestionIds.size,
    };
  }, [qbanks, quizHistory]);

  const overallAccuracy = useMemo(() => {
    const totalAttempted = metrics.correct + metrics.incorrect;
    return totalAttempted > 0 ? (metrics.correct / totalAttempted) * 100 : 0;
  }, [metrics]);

  const chartData = useMemo(() => 
    quizHistory.map((quiz, index) => ({
      attemptNumber: index + 1,
      score: (quiz.score / quiz.totalQuestions) * 100,
      date: quiz.date,
    })), [quizHistory]);

  const filteredQuestions = useMemo(() => {
    if (!selectedQBank) return [];
      
    return selectedQBank.questions.filter(question => {
      if (!Object.values(filters).some(v => v)) return true;
        
      const hasBeenAttempted = question.attempts && question.attempts.length > 0;
      const lastAttempt = hasBeenAttempted ? question.attempts[question.attempts.length - 1] : null;
        
      return (
        (filters.unused && !hasBeenAttempted) ||
        (filters.used && hasBeenAttempted) ||
        (filters.correct && lastAttempt?.isCorrect) ||
        (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
        (filters.flagged && question.isFlagged) ||
        (filters.omitted && lastAttempt?.selectedAnswer === null)
      );
    });
  }, [selectedQBank, filters]);
  
  const handleStartQuiz = () => {
    if (selectedQBank && questionCount > 0) {
      if (questionCount > filteredQuestions.length) {
        toast({
          title: "Invalid Question Count",
          description: "The selected number of questions exceeds the available questions in the filtered set.",
          variant: "destructive"
        });
        return;
      }
      onStartQuiz(selectedQBank.id, questionCount, tutorMode, timerEnabled, timeLimit);
    }
  };

  const toggleFilter = (key: keyof QuestionFilter) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleQBankSelection = () => {
    navigate('/select-qbank');
  };

  const handleUnlockQBank = () => {
    setSelectedQBank(null);
    localStorage.removeItem('selectedQBank');
  };

  const totalAttempts = useMemo(() => quizHistory.reduce((acc, quiz) => acc + quiz.questionAttempts.length, 0), [quizHistory]);
  const correctAttempts = useMemo(() => quizHistory.reduce((acc, quiz) => 
    acc + quiz.questionAttempts.filter(a => a.isCorrect).length, 0), [quizHistory]);
  
  const totalQuestions = useMemo(() => qbanks.reduce((acc, qbank) => acc + qbank.questions.length, 0), [qbanks]);
  const questionsAttempted = useMemo(() => new Set(quizHistory.flatMap(quiz => 
    quiz.questionAttempts.map(a => a.questionId)
  )).size, [quizHistory]);

  const tagStats = useMemo(() => {
    const stats: { [key: string]: { correct: number; total: number } } = {};
    quizHistory.forEach(quiz => {
      quiz.questionAttempts.forEach(attempt => {
        const question = qbanks.find(qbank => qbank.questions.find(q => q.id === attempt.questionId))
          ?.questions.find(q => q.id === attempt.questionId);
        const tags = question?.tags || [];

        tags.forEach(tag => {
          if (!stats[tag]) stats[tag] = { correct: 0, total: 0 };
          stats[tag].total += 1;
          if (attempt.isCorrect) stats[tag].correct += 1;
        });
      });
    });
    return stats;
  }, [qbanks, quizHistory]);

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

  const overallAccuracyCalc = useMemo(() => totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0, [correctAttempts, totalAttempts]);
  const completionRate = useMemo(() => totalQuestions > 0 ? (questionsAttempted / totalQuestions) * 100 : 0, [questionsAttempted, totalQuestions]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="p-4">
              <CalendarHeatmap data={quizHistory} />
            </Card>
            
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Overall Accuracy</h3>
                <CircularProgress percentage={overallAccuracyCalc} size="small" />
              </Card>
              
              <Card className="p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Completion Rate</h3>
                <CircularProgress percentage={completionRate} size="small" />
              </Card>
              
              <Card className="p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">Tag Performance</h3>
                <div className="w-[100px] h-[100px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <TagPerformanceChart qbanks={qbanks} quizHistory={quizHistory} />
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-6 h-[400px]">
            <h3 className="text-lg font-medium mb-4">Last Quiz Performance</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="attemptNumber" 
                  label={{ value: 'Attempt Number', position: 'bottom' }}
                  className="text-foreground"
                />
                <YAxis 
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                  className="text-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
                  labelFormatter={(label) => `Attempt ${label}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold">Available Question Banks</h2>
          <div className="grid gap-4">
            <Card
              className={`p-4 cursor-pointer transition-colors ${
                selectedQBank ? "border-primary border-2" : "hover:border-primary/50"
              }`}
              onClick={selectedQBank ? handleUnlockQBank : handleQBankSelection}
              onDoubleClick={selectedQBank ? handleUnlockQBank : undefined}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">
                    {selectedQBank ? selectedQBank.name : "Select QBank"}
                  </h3>
                  {selectedQBank && (
                    <p className="text-sm text-gray-600">
                      {selectedQBank.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold">Quiz Configuration</h2>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">
                Number of Questions
              </Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="tutor-mode"
                checked={tutorMode}
                onCheckedChange={setTutorMode}
              />
              <Label htmlFor="tutor-mode">Enable Tutor Mode</Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="timer-mode"
                  checked={timerEnabled}
                  onCheckedChange={setTimerEnabled}
                />
                <Label htmlFor="timer-mode">Enable Timer</Label>
              </div>
              {timerEnabled && (
                <div className="space-y-2">
                  <Label>Time per Question (seconds): {timeLimit}</Label>
                  <Slider
                    value={[timeLimit]}
                    onValueChange={(value) => setTimeLimit(value[0])}
                    min={10}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </div>
            <Button
              onClick={handleStartQuiz}
              disabled={!selectedQBank || questionCount <= 0}
              className="w-full"
            >
              Start Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
