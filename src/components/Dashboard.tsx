
import { useState, useMemo } from "react";
import { QBank, QuizHistory, QuestionFilter } from "../types/quiz";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Check, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface DashboardProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
  onStartQuiz: (qbankId: string, questionCount: number, tutorMode: boolean, timerEnabled: boolean, timeLimit: number) => void;
}

interface CategoryStats {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  key: keyof QuestionFilter;
}

const Dashboard = ({ qbanks, quizHistory, onStartQuiz }: DashboardProps) => {
  const [selectedQBank, setSelectedQBank] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [tutorMode, setTutorMode] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [filters, setFilters] = useState<QuestionFilter>({
    unused: false,
    used: false,
    incorrect: false,
    correct: false,
    marked: false,
    omitted: false,
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalQuestions = qbanks.reduce((acc, qbank) => acc + qbank.questions.length, 0);
    const attemptedQuestions = new Set();
    const correctQuestions = new Set();
    const incorrectQuestions = new Set();
    const markedQuestions = new Set();
    const omittedQuestions = new Set();

    quizHistory.forEach(quiz => {
      quiz.questionAttempts.forEach(attempt => {
        attemptedQuestions.add(attempt.questionId);
        if (attempt.selectedAnswer === null) {
          omittedQuestions.add(attempt.questionId);
        } else if (attempt.isCorrect) {
          correctQuestions.add(attempt.questionId);
        } else {
          incorrectQuestions.add(attempt.questionId);
        }
      });
    });

    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        if (question.isMarked) {
          markedQuestions.add(question.id);
        }
      });
    });

    return {
      unused: totalQuestions - attemptedQuestions.size,
      used: attemptedQuestions.size,
      correct: correctQuestions.size,
      incorrect: incorrectQuestions.size,
      marked: markedQuestions.size,
      omitted: omittedQuestions.size,
    };
  }, [qbanks, quizHistory]);

  const categories: CategoryStats[] = [
    {
      label: "Unused",
      count: metrics.unused,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      key: "unused"
    },
    {
      label: "Used",
      count: metrics.used,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      key: "used"
    },
    {
      label: "Incorrect",
      count: metrics.incorrect,
      color: "text-red-600",
      bgColor: "bg-red-50",
      key: "incorrect"
    },
    {
      label: "Correct",
      count: metrics.correct,
      color: "text-green-600",
      bgColor: "bg-green-50",
      key: "correct"
    },
    {
      label: "Marked",
      count: metrics.marked,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      key: "marked"
    },
    {
      label: "Omitted",
      count: metrics.omitted,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      key: "omitted"
    },
  ];

  // Filter questions based on selected categories
  const filteredQBanks = useMemo(() => {
    if (!Object.values(filters).some(Boolean)) return qbanks;

    return qbanks.map(qbank => ({
      ...qbank,
      questions: qbank.questions.filter(question => {
        const isUsed = quizHistory.some(quiz => 
          quiz.questionAttempts.some(attempt => attempt.questionId === question.id)
        );
        const attempts = quizHistory.flatMap(quiz => 
          quiz.questionAttempts.filter(attempt => attempt.questionId === question.id)
        );
        const isCorrect = attempts.some(attempt => attempt.isCorrect);
        const isIncorrect = attempts.some(attempt => !attempt.isCorrect);
        const isOmitted = attempts.some(attempt => attempt.selectedAnswer === null);

        return (
          (filters.unused && !isUsed) ||
          (filters.used && isUsed) ||
          (filters.correct && isCorrect) ||
          (filters.incorrect && isIncorrect) ||
          (filters.marked && question.isMarked) ||
          (filters.omitted && isOmitted)
        );
      })
    })).filter(qbank => qbank.questions.length > 0);
  }, [qbanks, quizHistory, filters]);

  const handleStartQuiz = () => {
    if (selectedQBank && questionCount > 0) {
      if (questionCount > filteredQBanks.find(qb => qb.id === selectedQBank)?.questions.length!) {
        toast({
          title: "Invalid Question Count",
          description: "The selected number of questions exceeds the available questions in the filtered set.",
          variant: "destructive"
        });
        return;
      }
      onStartQuiz(selectedQBank, questionCount, tutorMode, timerEnabled, timeLimit);
    }
  };

  const toggleFilter = (key: keyof QuestionFilter) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Transform quiz history data for the chart
  const chartData = quizHistory.map((quiz, index) => ({
    quizNumber: index + 1,
    score: (quiz.score / quiz.totalQuestions) * 100,
    date: quiz.date,
  }));

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => toggleFilter(category.key)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
                category.bgColor,
                category.color,
                filters[category.key] && "ring-2 ring-offset-2",
                "hover:opacity-90"
              )}
            >
              <Check 
                className={cn(
                  "w-4 h-4",
                  filters[category.key] ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="font-medium">{category.label}</span>
              <span className="px-2 py-0.5 bg-white rounded-full text-sm">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full h-[400px] bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Performance History</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="quizNumber" 
                label={{ value: 'Quiz Number', position: 'bottom' }}
              />
              <YAxis 
                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
                labelFormatter={(label) => `Quiz ${label}`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
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
            {filteredQBanks.map((qbank) => (
              <Card
                key={qbank.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedQBank === qbank.id
                    ? "border-primary border-2"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedQBank(qbank.id)}
              >
                <h3 className="font-bold">{qbank.name}</h3>
                <p className="text-sm text-gray-600">{qbank.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {qbank.questions.length} questions available
                </p>
              </Card>
            ))}
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
