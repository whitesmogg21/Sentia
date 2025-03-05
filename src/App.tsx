
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import History from "./pages/History";
import QBanks from "./pages/QBanks";
import SelectQBank from "./pages/SelectQBank";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { QuizHistory, QBank } from "./types/quiz";
import { qbanks as defaultQBanks } from "./data/questions";
import { toast } from "@/components/ui/use-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import QuestionLibrary from "@/components/qbanks/QuestionLibrary";
import MediaLibrary from "@/components/qbanks/MediaLibrary";
import { loadQBanks, saveQBanks } from "./services/dbService";

const queryClient = new QueryClient();

const App = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [inQuiz, setInQuiz] = useState(false);
  const [qbanks, setQBanks] = useState<QBank[]>(defaultQBanks);
  const [isLoading, setIsLoading] = useState(true);

  // Load question banks from database on app startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedQBanks = await loadQBanks();
        if (loadedQBanks && loadedQBanks.length > 0) {
          console.log("Loaded question banks from database:", loadedQBanks.length);
          setQBanks(loadedQBanks);
        } else {
          console.log("No question banks found in database, using defaults");
          // Save default qbanks to database if none found
          await saveQBanks(defaultQBanks);
        }
      } catch (error) {
        console.error("Error loading question banks:", error);
        toast({
          title: "Error",
          description: "Failed to load question banks from database",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save qbanks to database whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await saveQBanks(qbanks);
          console.log("Saved question banks to database");
        } catch (error) {
          console.error("Error saving question banks:", error);
        }
      };

      saveData();
    }
  }, [qbanks, isLoading]);

  const handleQuizComplete = (history: QuizHistory) => {
    // Update quiz history
    setQuizHistory((prev) => [...prev, history]);

    // Update the qbank with the new attempts
    const updatedQBanks = [...qbanks];
    const selectedQBank = updatedQBanks.find(qb => qb.id === history.qbankId);
    
    if (selectedQBank) {
      history.questionAttempts.forEach(attempt => {
        const questionIndex = selectedQBank.questions.findIndex(q => q.id === attempt.questionId);
        if (questionIndex !== -1) {
          const question = selectedQBank.questions[questionIndex];
          question.attempts = [
            ...(question.attempts || []),
            {
              questionId: attempt.questionId,
              selectedAnswer: attempt.selectedAnswer,
              isCorrect: attempt.isCorrect,
              date: new Date().toISOString(),
              isFlagged: attempt.isFlagged,
              tags: question.tags
            }
          ];
        }
      });
      
      // Save updated qbank to localStorage for backward compatibility
      localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
      setQBanks(updatedQBanks);
    }

    toast({
      title: "Quiz completed!",
      description: `You scored ${history.score} out of ${history.totalQuestions}`,
    });
  };

  const handleQBankSelect = (qbank: QBank) => {
    // Make sure the selected qbank is based on the current qbank state
    const selectedQBank = qbanks.find(q => q.id === qbank.id);
    if (selectedQBank) {
      localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
    }
  };

  const handleQuizStart = () => {
    setInQuiz(true);
  };
  
  const handleQuizEnd = () => setInQuiz(false);

  const handleClearHistory = () => {
    setQuizHistory([]);
    // Reset attempts in qbanks
    const updatedQBanks = qbanks.map(qbank => ({
      ...qbank,
      questions: qbank.questions.map(question => ({
        ...question,
        attempts: [],
        isFlagged: false
      }))
    }));
    
    setQBanks(updatedQBanks);
    // Clear localStorage
    localStorage.removeItem('selectedQBank');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <SidebarProvider>
              <div className="min-h-screen flex w-full overflow-hidden">
                {!inQuiz && <AppSidebar />}
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Index
                          quizHistory={quizHistory}
                          onQuizComplete={handleQuizComplete}
                          onQuizStart={handleQuizStart}
                          onQuizEnd={handleQuizEnd}
                        />
                      }
                    />
                    <Route
                      path="/history"
                      element={<History quizHistory={quizHistory} onClearHistory={handleClearHistory} />}
                    />
                    <Route path="/qbanks" element={<QBanks qbanks={qbanks} setQBanks={setQBanks} />} />
                    <Route path="/qbanks/questions" element={<QuestionLibrary qbanks={qbanks} setQBanks={setQBanks} />} />
                    <Route path="/qbanks/media" element={<MediaLibrary />} />
                    <Route 
                      path="/select-qbank" 
                      element={<SelectQBank qbanks={qbanks} onSelect={handleQBankSelect} />} 
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
