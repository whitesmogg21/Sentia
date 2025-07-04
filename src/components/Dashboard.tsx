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
import { calculateAverageTimePerQuestion, formatTime } from "@/utils/timeUtils";
import { ScoreOverTimeChart } from "./ScoreOverTimeChart";
import { CalendarHeatmap } from "./charts/CalendarHeatmap";
interface DashboardProps {
  qbanks: QBank[];
  quizHistory: QuizHistory[];
  onStartQuiz: (
    qbankId: string,
    questionCount: number,
    tutorMode: boolean,
    timerEnabled: boolean,
    timeLimit: number,
    filteredQuestionIds?: number[] // Add this parameter
  ) => void;
  timeLimitMin: number;
  setTimeLimitMin: (timeLimitMin: number) => void;
  sessionTimerToggle: boolean;
  setSessionTimerToggle: (boolean) => void;
}

const Dashboard = ({
  qbanks,
  quizHistory,
  onStartQuiz,
  timeLimitMin,
  setTimeLimitMin,
  sessionTimerToggle,
  setSessionTimerToggle
}: DashboardProps) => {
  const navigate = useNavigate();
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(40);
  const [tutorMode, setTutorMode] = useState(false);
  // const [strictMode, setStrictMode] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(10);
  // const [timeLimitMin, setTimeLimitMin] = useState(60);
  const [majorTimerToggle, setMajorTimerToggle] = useState(false);
  // const [sessionTimerToggle, setSessionTimerToggle] = useState(false);
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

  useEffect(() => {
    const storedQBank = localStorage.getItem("selectedQBank");
    if (storedQBank) {
      const qbankData = JSON.parse(storedQBank);
      const foundQBank = qbanks.find((qb) => qb.id === qbankData.id);
      if (foundQBank) {
        // setSelectedQBank(foundQBank);
        setSelectedQBank(qbankData);
      }
    }
  }, [qbanks]);

  // useEffect(() => {
  //   const storedQBank = localStorage.getItem('selectedQBank');
  //   if (storedQBank) {
  //     const qbankData = JSON.parse(storedQBank);
  //     const foundQBank = qbanks.find(qb => qb.id === qbankData.id);
  //     if (foundQBank) {
  //       setSelectedQBank(foundQBank);

  //       // Check if we have any filtered question IDs
  //       const filteredIds = localStorage.getItem('filteredQuestionIds');
  //       if (filteredIds) {
  //         const parsedIds = JSON.parse(filteredIds);
  //         console.log(`Found ${parsedIds.length} filtered question IDs`);

  //         // Determine which filters are active based on the IDs
  //         const questionMetrics = parsedIds.map(id => {
  //           const question = foundQBank.questions.find(q => q.id === id);
  //           if (!question) return null;

  //           const hasBeenAttempted = question.attempts && question.attempts.length > 0;
  //           const lastAttempt = hasBeenAttempted ? question.attempts[question.attempts.length - 1] : null;

  //           return {
  //             id,
  //             unused: !hasBeenAttempted,
  //             used: hasBeenAttempted,
  //             correct: lastAttempt?.isCorrect,
  //             incorrect: lastAttempt && !lastAttempt.isCorrect,
  //             flagged: question.isFlagged,
  //             omitted: lastAttempt?.selectedAnswer === null
  //           };
  //         }).filter(Boolean);

  //         // Check which filters should be active
  //         const activeFilters: QuestionFilter = {
  //           unused: false,
  //           used: false,
  //           correct: false,
  //           incorrect: false,
  //           flagged: false,
  //           omitted: false
  //         };

  //         // If all filtered questions share a property, that filter should be active
  //         if (questionMetrics.length > 0) {
  //           if (questionMetrics.every(q => q.unused)) activeFilters.unused = true;
  //           if (questionMetrics.every(q => q.used)) activeFilters.used = true;
  //           if (questionMetrics.every(q => q.correct)) activeFilters.correct = true;
  //           if (questionMetrics.every(q => q.incorrect)) activeFilters.incorrect = true;
  //           if (questionMetrics.every(q => q.flagged)) activeFilters.flagged = true;
  //           if (questionMetrics.every(q => q.omitted)) activeFilters.omitted = true;
  //         }

  //         setFilters(activeFilters);
  //       }
  //     }
  //   }
  // }, [qbanks]);

  const metrics = useMemo(() => {
    const seenQuestionIds = new Set<number>();
    const correctQuestionIds = new Set<number>();
    const incorrectQuestionIds = new Set<number>();
    const omittedQuestionIds = new Set<number>();
    const flaggedQuestionIds = new Set<number>();

    quizHistory.forEach((quiz) => {
      quiz.questionAttempts.forEach((attempt) => {
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

    qbanks.forEach((qbank) => {
      qbank.questions.forEach((question) => {
        if (question.isFlagged) {
          flaggedQuestionIds.add(question.id);
        }
      });
    });

    const totalQuestions = qbanks.reduce(
      (acc, qbank) => acc + qbank.questions.length,
      0
    );

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

  const chartData = useMemo(
    () =>
      quizHistory.map((quiz, index) => ({
        attemptNumber: index + 1,
        score: (quiz.score / quiz.totalQuestions) * 100,
        date: quiz.date,
      })),
    [quizHistory]
  );

  // const filteredQuestions = useMemo(() => {
  //   if (!selectedQBank) return [];

  //   return selectedQBank.questions.filter(question => {
  //     // If no filters are active, return all questions
  //     if (!Object.values(filters).some(v => v)) return true;

  //     const hasBeenAttempted = question.attempts && question.attempts.length > 0;
  //     const lastAttempt = hasBeenAttempted ? question.attempts[question.attempts.length - 1] : null;

  //     return (
  //       (filters.unused && !hasBeenAttempted) ||
  //       (filters.used && hasBeenAttempted) ||
  //       (filters.correct && lastAttempt?.isCorrect) ||
  //       (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
  //       (filters.flagged && question.isFlagged) ||
  //       (filters.omitted && lastAttempt?.selectedAnswer === null)
  //     );
  //   });
  // }, [selectedQBank, filters]);

  const filteredQuestions = selectedQBank?.questions || [];
  console.log(filteredQuestions.length);

  // Add average time per question calculation
  const averageTimePerQuestion = useMemo(() => {
    return calculateAverageTimePerQuestion(quizHistory);
  }, [quizHistory]);

  const handleStartQuiz = () => {
    if (selectedQBank && questionCount > 0) {
      // Make sure we have filtered questions
      if (filteredQuestions.length === 0) {
        toast({
          title: "No Questions Available",
          description:
            "There are no questions available with the current filters.",
          variant: "destructive",
        });
        return;
      }

      // Log for debugging
      console.log(
        `Starting quiz with ${filteredQuestions.length} filtered questions`
      );
      console.log(
        "Active filters:",
        Object.entries(filters)
          .filter(([_, isActive]) => isActive)
          .map(([key]) => key)
      );

      // Pass only the filtered question IDs to the quiz
      onStartQuiz(
        selectedQBank.id,
        Math.min(questionCount, filteredQuestions.length),
        tutorMode,
        timerEnabled,
        timeLimit,
        filteredQuestions.map((q) => q.id)
      );
    }
  };

  const toggleFilter = (key: keyof QuestionFilter) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleQBankSelection = () => {
    navigate("/select-qbank");
  };

  const handleUnlockQBank = () => {
    setSelectedQBank(null);
    localStorage.removeItem("selectedQBank");
  };

  const totalAttempts = useMemo(
    () =>
      quizHistory.reduce((acc, quiz) => acc + quiz.questionAttempts.length, 0),
    [quizHistory]
  );
  const correctAttempts = useMemo(
    () =>
      quizHistory.reduce(
        (acc, quiz) =>
          acc + quiz.questionAttempts.filter((a) => a.isCorrect).length,
        0
      ),
    [quizHistory]
  );

  const totalQuestions = useMemo(
    () => 
      // qbanks.reduce((acc, qbank) => acc + qbank.questions.length, 0),

    // this is gonna get unique questions with unique ids
          new Set(
        qbanks.flatMap((qbank) =>
          qbank.questions.map((a) => a.id)
        )
      ).size,
    [qbanks]
  );
  const questionsAttempted = useMemo(
    () =>
      new Set(
        quizHistory.flatMap((quiz) =>
          quiz.questionAttempts.map((a) => a.questionId)
        )
      ).size,
    [quizHistory]
  );

  const tagStats = useMemo(() => {
    const stats: { [key: string]: { correct: number; total: number } } = {};
    quizHistory.forEach((quiz) => {
      quiz.questionAttempts.forEach((attempt) => {
        const question = qbanks
          .find((qbank) =>
            qbank.questions.find((q) => q.id === attempt.questionId)
          )
          ?.questions.find((q) => q.id === attempt.questionId);
        const tags = question?.tags || [];

        tags.forEach((tag) => {
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
    qbanks.forEach((qbank) => {
      qbank.questions.forEach((question) => {
        question.tags.forEach((tag) => uniqueTags.add(tag));
      });
    });

    uniqueTags.forEach((tag) => {
      tagStats[tag] = { correct: 0, total: 0 };
    });

    quizHistory.forEach((quiz) => {
      quiz.questionAttempts.forEach((attempt) => {
        const question = qbanks
          .flatMap((qbank) => qbank.questions)
          .find((q) => q.id === attempt.questionId);

        if (question) {
          question.tags.forEach((tag) => {
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

  const overallAccuracyCalc = useMemo(
    () => (totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0),
    [correctAttempts, totalAttempts]
  );
  const completionRate = useMemo(
    () =>
      totalQuestions > 0 ? (questionsAttempted / totalQuestions) * 100 : 0,
    [questionsAttempted, totalQuestions]
  );

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

  // console.log(selectedQBank)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              Dashboard
            </motion.h1>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full hover:bg-secondary/80 transition-all duration-300"
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
                className="rounded-full hover:bg-secondary/80 transition-all duration-300"
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
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Top Tag Tiles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-foreground/90">Organized Study Paths</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tagPerformance.slice(0, 10).map((tag, index) => (
              <motion.div
                key={tag.tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group cursor-pointer"
              >
                <Card className="p-4 h-24 bg-gradient-to-br from-card via-card to-secondary/10 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${tag.score >= 80 ? 'bg-success' : tag.score >= 60 ? 'bg-primary' : 'bg-error'}`} />
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {tag.tag}
                      </h3>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-bold text-primary">
                        {Math.round(tag.score)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tag.total} qs
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="p-6 bg-gradient-to-br from-card via-card to-success/5 border-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                <p className="text-3xl font-bold text-success">
                  {overallAccuracyCalc.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions Attempted</p>
                <p className="text-3xl font-bold text-primary">
                  {questionsAttempted}
                </p>
                <p className="text-xs text-muted-foreground">of {totalQuestions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card via-card to-accent/5 border-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-3xl font-bold text-accent">
                  {quizHistory.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card via-card to-secondary/10 border-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Time/Question</p>
                <p className="text-3xl font-bold">
                  {formatTime(averageTimePerQuestion)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* QBank Selection and Quiz Config */}
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-0 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Question Bank</h3>
              <div
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${selectedQBank
                    ? "bg-primary/10 border-2 border-primary/30"
                    : "bg-secondary/20 hover:bg-secondary/30 border border-border/50"
                  }`}
                onClick={selectedQBank ? handleUnlockQBank : handleQBankSelection}
              >
                <h4 className="font-medium">
                  {selectedQBank ? selectedQBank.name : "Select QBank"}
                </h4>
                {selectedQBank && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedQBank.description}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 bg-gradient-to-br from-card via-card to-secondary/5 border-0 shadow-lg">
              <h3 className="text-lg font-semibold mb-6">Quiz Configuration</h3>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Questions ({filteredQuestions.length} available)
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
                    className="mt-2 bg-background/50"
                    disabled={filteredQuestions.length === 0}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="tutor-mode" className="text-sm font-medium">Tutor Mode</Label>
                  <Switch
                    id="tutor-mode"
                    checked={tutorMode}
                    onCheckedChange={setTutorMode}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Session Timer</Label>
                      <Switch
                        checked={sessionTimerToggle}
                        onCheckedChange={setSessionTimerToggle}
                      />
                    </div>
                    {sessionTimerToggle && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Duration: {timeLimitMin} minutes
                        </Label>
                        <Slider
                          value={[timeLimitMin]}
                          onValueChange={(value) => setTimeLimitMin(value[0])}
                          min={5}
                          max={300}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Per-Question Timer</Label>
                      <Switch
                        checked={timerEnabled}
                        onCheckedChange={setTimerEnabled}
                      />
                    </div>
                    {timerEnabled && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Duration: {timeLimit} seconds
                        </Label>
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
                </div>

                <Button
                  onClick={handleStartQuiz}
                  disabled={!selectedQBank || questionCount <= 0}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300"
                >
                  Start Quiz
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-80"
          >
            <TagPerformanceChart qbanks={qbanks} quizHistory={quizHistory} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="h-80"
          >
            <ScoreOverTimeChart quizHistory={quizHistory} />
          </motion.div>
        </div>

        {/* Calendar Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <CalendarHeatmap data={quizHistory} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
