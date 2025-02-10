
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

interface DashboardProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
  onStartQuiz: (qbankId: string, questionCount: number, tutorMode: boolean, timerEnabled: boolean, timeLimit: number) => void;
}

const Dashboard = ({ qbanks, quizHistory, onStartQuiz }: DashboardProps) => {
  const [selectedQBank, setSelectedQBank] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [tutorMode, setTutorMode] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);

  const handleStartQuiz = () => {
    if (selectedQBank && questionCount > 0) {
      onStartQuiz(selectedQBank, questionCount, tutorMode, timerEnabled, timeLimit);
    }
  };

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
        className="w-full h-[400px] bg-white rounded-2xl shadow-lg p-6"
      >
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
