import { useState, useMemo, useEffect } from "react";
import { QBank, QuizHistory } from "../types/quiz";
import { Moon, Sun, Maximize, Minimize } from "lucide-react";
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
import { useFullscreen } from "@/hooks/use-fullscreen";
import { TagPerformanceChart } from "./TagPerformanceChart";
import { getFilteredQuestions } from "@/utils/metricsUtils";

interface DashboardProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
  onStartQuiz: (
    qbankId: string,
    questionCount: number,
    tutorMode: boolean,
    timerEnabled: boolean,
    timeLimit: number
  ) => void;
}

const Dashboard = ({ qbanks, quizHistory, onStartQuiz }: DashboardProps) => {
  const navigate = useNavigate();
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(40);
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
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // useEffect(() => {
  //   const storedQBank = localStorage.getItem('selectedQBank');
  //   if (storedQBank) {
  //     const qbankData = JSON.parse(storedQBank);
  //     const foundQBank = qbanks.find(qb => qb.id === qbankData.id);
  //     if (foundQBank) {
  //       setSelectedQBank(foundQBank);
  //     }
  //   }
  // }, [qbanks]);
  useEffect(() => {
    const storedQBank = localStorage.getItem('selectedQBank');
    if (storedQBank) {
      const qbankData = JSON.parse(storedQBank);
      const foundQBank = qbanks.find(qb => qb.id === qbankData.id);
      if (foundQBank) {
        setSelectedQBank(foundQBank);

        // Check if we have any filtered question IDs
        const filteredIds = localStorage.getItem('filteredQuestionIds');
        if (filteredIds) {
          const parsedIds = JSON.parse(filteredIds);
          console.log(`Found ${parsedIds.length} filtered question IDs`);

          // Determine which filters are active based on the IDs
          const questionMetrics = parsedIds.map(id => {
            const question = foundQBank.questions.find(q => q.id === id);
            if (!question) return null;

            const hasBeenAttempted = question.attempts && question.attempts.length > 0;
            const lastAttempt = hasBeenAttempted ? question.attempts[question.attempts.length - 1] : null;

            return {
              id,
              unused: !hasBeenAttempted,
              used: hasBeenAttempted,
              correct: lastAttempt?.isCorrect,
              incorrect: lastAttempt && !lastAttempt.isCorrect,
              flagged: question.isFlagged,
              omitted: lastAttempt?.selectedAnswer === null
            };
          }).filter(Boolean);

          // Check which filters should be active
          const activeFilters: QuestionFilter = {
            unused: false,
            used: false,
            correct: false,
            incorrect: false,
            flagged: false,
            omitted: false
          };

          // If all filtered questions share a property, that filter should be active
          if (questionMetrics.length > 0) {
            if (questionMetrics.every(q => q.unused)) activeFilters.unused = true;
            if (questionMetrics.every(q => q.used)) activeFilters.used = true;
            if (questionMetrics.every(q => q.correct)) activeFilters.correct = true;
            if (questionMetrics.every(q => q.incorrect)) activeFilters.incorrect = true;
            if (questionMetrics.every(q => q.flagged)) activeFilters.flagged = true;
            if (questionMetrics.every(q => q.omitted)) activeFilters.omitted = true;
          }

          setFilters(activeFilters);
        }
      }
    }
  }, [qbanks]);

  const filteredQuestions = useMemo(() => {
    if (!selectedQBank) return [];

    // Get active filters as an array
    const activeFilters = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);

    // If no filters are active, return all questions
    if (activeFilters.length === 0) return selectedQBank.questions;

    // Use the getFilteredQuestions utility to get filtered questions
    return getFilteredQuestions(selectedQBank.questions, activeFilters);
  }, [selectedQBank, filters]);

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
    return calculateOverallAccuracy();
  }, [calculateOverallAccuracy, quizHistory]);

  const chartData = useMemo(() =>
    quizHistory.map((quiz, index) => ({
      attemptNumber: index + 1,
      score: (quiz.score / quiz.totalQuestions) * 100,
      date: quiz.date,
    })), [quizHistory]);

  const handleStartQuiz = () => {
    if (selectedQBank && questionCount > 0) {
      // Make sure we have filtered questions
      if (filteredQuestions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "There are no questions available with the current filters.",
          variant: "destructive"
        });
        return;
      }

      // Log for debugging
      console.log(`Starting quiz with ${filteredQuestions.length} filtered questions`);
      console.log("Active filters:", Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key));

      // Create a filtered QBank with only the questions that match the filters
      const filteredQBank = {
        ...selectedQBank,
        questions: filteredQuestions,
        isFiltered: true
      };
      
      // Store the filtered QBank in localStorage
      localStorage.setItem("filteredQBank", JSON.stringify(filteredQBank));
      
      // Store the filtered question IDs
      localStorage.setItem("filteredQuestionIds", JSON.stringify(filteredQuestions.map(q => q.id)));

      // Start the quiz with the filtered questions
      onStartQuiz(
        selectedQBank.id,
        Math.min(questionCount, filteredQuestions.length),
        tutorMode,
        timerEnabled,
        timeLimit
      );
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


  useEffect(() => {
    if (selectedQBank) {
      // Default to 40 questions or all available filtered questions if less than 40
      const defaultCount = Math.min(40, filteredQuestions.length);

      // Only update if the current count is invalid (0, greater than available, or not set)
      if (questionCount <= 0 || questionCount > filteredQuestions.length) {
        setQuestionCount(defaultCount);
      }
    }
  }, [selectedQBank, filteredQuestions.length]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="rounded-full"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
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
              Number of Questions ({filteredQuestions.length} available)
            </Label>
            <Input
              type="number"
              min={1}
              max={filteredQuestions.length || 1}
              value={questionCount > filteredQuestions.length ? filteredQuestions.length : questionCount}
              onChange={(e) => {
                const value = Number(e.target.value);
                const validValue = Math.min(Math.max(1, value), filteredQuestions.length);
                setQuestionCount(validValue);
              }}
              className="w-48"
              disabled={filteredQuestions.length === 0}
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

      <div className="mt-6 p-4 bg-card border rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Your Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Overall Accuracy</h3>
            <p className="text-2xl font-bold">{calculateOverallAccuracy().toFixed(1)}%</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Questions Attempted</h3>
            <p className="text-2xl font-bold">{metrics.used} / {metrics.used + metrics.unused}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Total Quizzes Taken</h3>
            <p className="text-2xl font-bold">{quizHistory.length}</p>
          </Card>
        </div>
      </div>

      {/* Tag Performance Radar Chart */}
      <div className="my-8">
        <TagPerformanceChart qbanks={qbanks} quizHistory={quizHistory} />
      </div>
    </div>
  );
};

export default Dashboard;
