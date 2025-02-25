
import { useState, useMemo, useEffect } from "react";
import { QBank, QuizHistory } from "../types/quiz";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { QuestionFilter } from "@/types/quiz";
import { useQuiz } from "@/hooks/quiz";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const { calculateOverallAccuracy } = useQuiz({});

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

    return {
      unused: totalQuestions - seenQuestionIds.size,
      used: seenQuestionIds.size,
      correct: correctQuestionIds.size,
      incorrect: incorrectQuestionIds.size,
      flagged: flaggedQuestionIds.size,
      omitted: omittedQuestionIds.size,
    };
  }, [qbanks, quizHistory]);

  const overallAccuracy = useMemo(() => {
    return calculateOverallAccuracy();
  }, [calculateOverallAccuracy]);

  const qbankScoreData = useMemo(() => {
    // Create a map to store cumulative scores and question counts per QBank
    const qbankResults = new Map<string, { score: number; total: number; name: string }>();

    // First initialize all qbanks with zero values
    qbanks.forEach(qbank => {
      qbankResults.set(qbank.id, { score: 0, total: 0, name: qbank.name });
    });

    // Sum up scores and question counts from quiz history
    quizHistory.forEach(quiz => {
      const qbankData = qbankResults.get(quiz.qbankId);
      if (qbankData) {
        qbankData.score += quiz.score;
        qbankData.total += quiz.totalQuestions;
        qbankResults.set(quiz.qbankId, qbankData);
      }
    });

    // Convert to array format with percentage calculation for chart
    return Array.from(qbankResults.values())
      .filter(result => result.total > 0) // Only include QBanks with attempts
      .map(result => ({
        name: result.name,
        percentage: ((result.score / result.total) * 100).toFixed(1)
      }));
  }, [qbanks, quizHistory]);

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

  const handleQBankSelection = () => {
    navigate('/select-qbank');
  };

  const handleUnlockQBank = () => {
    setSelectedQBank(null);
    localStorage.removeItem('selectedQBank');
  };

  const totalAttempts = useMemo(() => 
    quizHistory.reduce((acc, quiz) => acc + quiz.questionAttempts.length, 0), 
    [quizHistory]
  );
  
  const correctAttempts = useMemo(() => 
    quizHistory.reduce((acc, quiz) => acc + quiz.questionAttempts.filter(a => a.isCorrect).length, 0), 
    [quizHistory]
  );
  
  const totalQuestions = useMemo(() => 
    qbanks.reduce((acc, qbank) => acc + qbank.questions.length, 0), 
    [qbanks]
  );
  
  const questionsAttempted = useMemo(() => 
    new Set(quizHistory.flatMap(quiz => quiz.questionAttempts.map(a => a.questionId))).size, 
    [quizHistory]
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      {/* Performance Summary Section - Now Above QBank Selection */}
      <div className="mt-6 p-4 bg-card border rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Your Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Overall Accuracy</h3>
            <p className="text-2xl font-bold">{overallAccuracy.toFixed(1)}%</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Questions Attempted</h3>
            <p className="text-2xl font-bold">{questionsAttempted} / {totalQuestions}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Total Quizzes Taken</h3>
            <p className="text-2xl font-bold">{quizHistory.length}</p>
          </Card>
        </div>

        {/* QBank Performance Chart */}
        {qbankScoreData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Performance by Question Bank</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={qbankScoreData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                  />
                  <YAxis 
                    label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="percentage" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mt-8">
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
                className="w-48"
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
