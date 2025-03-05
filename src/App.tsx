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

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedQBanks = await loadQBanks();
        if (loadedQBanks && loadedQBanks.length > 0) {
          console.log("Loaded question banks from database:", loadedQBanks.length);
          setQBanks(loadedQBanks);
        } else {
          console.log("No question banks found in database, using defaults");
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
    setQuizHistory((prev) => [...prev, history]);

    const selectedQBank = qbanks.find(qb => qb.id === history.qbankId);
    if (selectedQBank) {
      const updatedQBanks = [...qbanks];
      const qbankIndex = updatedQBanks.findIndex(qb => qb.id === history.qbankId);

      history.questionAttempts.forEach(attempt => {
        const question = selectedQBank.questions.find(q => q.id === attempt.questionId);
        if (question) {
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
      
      updatedQBanks[qbankIndex] = selectedQBank;
      setQBanks(updatedQBanks);
      
      localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
    }

    toast({
      title: "Quiz completed!",
      description: `You scored ${history.score} out of ${history.totalQuestions}`,
    });
  };

  const handleQBankSelect = (qbank: QBank) => {
    localStorage.setItem('selectedQBank', JSON.stringify(qbank));
  };

  const handleQuizStart = () => {
    setInQuiz(true);
    const updatedQBanks = qbanks.map(qbank => ({
      ...qbank,
      questions: qbank.questions.map(question => ({
        ...question,
        attempts: [],
        isFlagged: false
      }))
    }));
    
    setQBanks(updatedQBanks);
    localStorage.removeItem('selectedQBank');
  };
  
  const handleQuizEnd = () => setInQuiz(false);

  const handleClearHistory = () => {
    setQuizHistory([]);
    const updatedQBanks = qbanks.map(qbank => ({
      ...qbank,
      questions: qbank.questions.map(question => ({
        ...question,
        attempts: [],
        isFlagged: false
      }))
    }));
    
    setQBanks(updatedQBanks);
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
                    <Route path="/qbanks/media" element={<MediaLibrary qbanks={qbanks} />} />
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
