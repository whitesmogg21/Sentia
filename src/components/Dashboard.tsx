
import { useState } from "react";
import { QBank, QuizHistory } from "../types/quiz";
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
}

const Dashboard = ({ qbanks, quizHistory, onStartQuiz }: DashboardProps) => {
  const [selectedQBank, setSelectedQBank] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [tutorMode, setTutorMode] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleStartQuiz = () => {
    if (selectedQBank && questionCount > 0) {
      onStartQuiz(selectedQBank, questionCount, tutorMode, timerEnabled, timeLimit);
    }
  };

  // Calculate statistics from quiz history
  const totalQuestions = qbanks.reduce((acc, qbank) => acc + qbank.questions.length, 0);
  const totalAnswered = quizHistory.reduce((acc, quiz) => acc + quiz.totalQuestions, 0);
  const totalCorrect = quizHistory.reduce((acc, quiz) => acc + quiz.score, 0);
  const totalIncorrect = totalAnswered - totalCorrect;

  const categories: CategoryStats[] = [
    {
      label: "Unused",
      count: totalQuestions - totalAnswered,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Incorrect",
      count: totalIncorrect,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Marked",
      count: 76, // This would need to be connected to actual marking functionality
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Omitted",
      count: 35, // This would need to be connected to actual omission tracking
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Correct",
      count: totalCorrect,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  // Transform quiz history data to percentage scores
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
              onClick={() => setSelectedCategory(category.label)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
                category.bgColor,
                category.color,
                selectedCategory === category.label && "ring-2 ring-offset-2",
                "hover:opacity-90"
              )}
            >
              <Check 
                className={cn(
                  "w-4 h-4",
                  selectedCategory === category.label ? "opacity-100" : "opacity-0"
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
            {qbanks.map((qbank) => (
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
