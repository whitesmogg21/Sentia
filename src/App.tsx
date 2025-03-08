
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
import { qbanks, saveQBanksToStorage, loadQBanks } from "./data/questions";
import { toast } from "@/components/ui/use-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import QuestionLibrary from "@/components/qbanks/QuestionLibrary";
import MediaLibrary from "@/components/qbanks/MediaLibrary";
import { useMetricsInit } from './hooks/use-metrics-init';
import useIndexedDBInit from './hooks/use-indexeddb-init';
import { loadQuizData, saveQuizData } from './hooks/quiz';

const queryClient = new QueryClient();

const App = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [inQuiz, setInQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize IndexedDB first
  const { isInitialized, error } = useIndexedDBInit();
  
  // Initialize metrics system on app load
  useMetricsInit();

  // Load data from IndexedDB once it's initialized
  useEffect(() => {
    if (!isInitialized) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load quiz history from IndexedDB
        const history = await loadQuizData();
        if (history) {
          setQuizHistory(history);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isInitialized]);

  // Save quiz history to IndexedDB whenever it changes
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    const saveHistory = async () => {
      try {
        await saveQuizData(quizHistory);
      } catch (error) {
        console.error('Error saving quiz history:', error);
      }
    };
    
    saveHistory();
  }, [quizHistory, isInitialized, isLoading]);

  const handleQuizComplete = async (history: QuizHistory) => {
    // Update quiz history
    setQuizHistory((prev) => [...prev, history]);

    // Update the qbank with the new attempts
    try {
      const selectedQBank = qbanks.find(qb => qb.id === history.qbankId);
      if (selectedQBank) {
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
        
        // Save updated qbanks
        await saveQBanksToStorage();
      }
    } catch (error) {
      console.error('Error updating qbank with attempts:', error);
    }

    toast({
      title: "Quiz completed!",
      description: `You scored ${history.score} out of ${history.totalQuestions}`,
    });
  };

  const handleQBankSelect = async (qbank: QBank) => {
    try {
      localStorage.setItem('selectedQBank', JSON.stringify(qbank));
    } catch (error) {
      console.error('Error saving selected qbank:', error);
    }
  };

  const handleQuizStart = async () => {
    setInQuiz(true);
    try {
      // Reset all questions in qbanks
      qbanks.forEach(qbank => {
        qbank.questions.forEach(question => {
          question.attempts = [];
          question.isFlagged = false;
        });
      });
      await saveQBanksToStorage();
      localStorage.removeItem('selectedQBank');
    } catch (error) {
      console.error('Error resetting questions for quiz:', error);
    }
  };
  
  const handleQuizEnd = () => setInQuiz(false);

  const handleClearHistory = async () => {
    setQuizHistory([]);
    try {
      // Reset attempts in qbanks
      qbanks.forEach(qbank => {
        qbank.questions.forEach(question => {
          question.attempts = [];
          question.isFlagged = false;
        });
      });
      await saveQBanksToStorage();
      // Clear selected qbank from localStorage
      localStorage.removeItem('selectedQBank');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // If IndexedDB initialization failed, show an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-red-50 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Storage Initialization Error</h1>
          <p className="text-red-600 mb-4">{error.message}</p>
          <p>Please try refreshing the page or using a different browser.</p>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Quiz Master</h1>
          <p className="mb-4">Initializing storage and loading data...</p>
        </div>
      </div>
    );
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
                    <Route path="/qbanks" element={<QBanks qbanks={qbanks} />} />
                    <Route path="/qbanks/questions" element={<QuestionLibrary qbanks={qbanks} />} />
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
