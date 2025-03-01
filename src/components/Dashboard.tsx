
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { useNavigate } from "react-router-dom";
import { QuestionFiltersBar } from "@/components/QuestionFiltersBar";
import { useQBankStore } from "@/store/qbank/qbankStore";
import { useMetricsStore } from "@/store/metrics/metricsStore";
import { useQuizConfig } from "@/hooks/useQuizConfig";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Get state from stores
  const { 
    selectedQBank, 
    selectQBank, 
    unselectQBank,
    toggleFilter,
    filters
  } = useQBankStore();
  
  const {
    overallAccuracy,
    questionsAttempted,
    totalQuestions,
    calculateMetrics
  } = useMetricsStore();
  
  const {
    tutorMode,
    setTutorMode,
    timerEnabled,
    setTimerEnabled,
    timeLimit,
    setTimeLimit,
    questionCount,
    setQuestionCount,
    handleStartQuiz
  } = useQuizConfig();
  
  // Fetch the selected QBank from localStorage on mount
  useEffect(() => {
    const storedQBank = localStorage.getItem('selectedQBank');
    if (storedQBank && !selectedQBank) {
      try {
        const qbankData = JSON.parse(storedQBank);
        selectQBank(qbankData);
      } catch (error) {
        console.error("Failed to parse QBank from localStorage:", error);
      }
    }
  }, [selectedQBank, selectQBank]);
  
  // Calculate metrics when dashboard is mounted
  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);
  
  const handleQBankSelection = () => {
    navigate('/select-qbank');
  };
  
  const handleUnlockQBank = () => {
    unselectQBank();
    localStorage.removeItem('selectedQBank');
  };
  
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
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedQBank.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Add filters bar when a question bank is selected */}
          {selectedQBank && (
            <QuestionFiltersBar 
              filters={filters}
              onToggleFilter={toggleFilter}
            />
          )}
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
                max={selectedQBank ? selectedQBank.questions.length : 20}
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
      
      <div className="mt-6 p-4 bg-card border rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Your Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Overall Accuracy</h3>
            <p className="text-2xl font-bold">{overallAccuracy.toFixed(1)}%</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Questions Attempted</h3>
            <p className="text-2xl font-bold">{questionsAttempted} / {totalQuestions}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Completion Rate</h3>
            <p className="text-2xl font-bold">{(questionsAttempted / totalQuestions * 100).toFixed(1)}%</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
