
import { useState } from "react";
import { QBank, QuizHistory } from "../types/quiz";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface DashboardProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
  onStartQuiz: (qbankId: string, questionCount: number) => void;
}

const Dashboard = ({ qbanks, quizHistory, onStartQuiz }: DashboardProps) => {
  const [selectedQBank, setSelectedQBank] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);

  const handleStartQuiz = () => {
    if (selectedQBank && questionCount > 0) {
      onStartQuiz(selectedQBank, questionCount);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-[400px] bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Performance History</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={quizHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
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
              <label className="block text-sm font-medium mb-2">
                Number of Questions
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleStartQuiz}
              disabled={!selectedQBank || questionCount <= 0}
              className="w-full"
            >
              Create Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
