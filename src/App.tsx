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
import { qbanks, saveQBanksToStorage } from "./data/questions";
import { toast } from "@/components/ui/use-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import QuestionLibrary from "@/components/qbanks/QuestionLibrary";
import MediaLibrary from "@/components/qbanks/MediaLibrary";
import { useMetricsInit } from './hooks/use-metrics-init';
import { initializeMetrics } from "@/utils/metricsUtils";
import SessionDetail from "./pages/SessionDetail";
import AudioLibrary from "@/components/qbanks/AudioLibrary";

const queryClient = new QueryClient();

const App = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [inQuiz, setInQuiz] = useState(false);

  // Initialize metrics system on app load
  useMetricsInit();

  useEffect(() => {
    // Small delay to ensure the UI has time to render
    const timer = setTimeout(() => {
      if (window.electronAPI && typeof window.electronAPI.removePreloader === 'function') {
        console.log('Removing preloader...');
        window.electronAPI.removePreloader();
      }
    }, 1000); // 1 second delay gives the app time to render

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load quiz history from localStorage
    try {
      const savedHistory = localStorage.getItem('quizHistory');
      if (savedHistory) {
        setQuizHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
    }
  }, []);

  // Save quiz history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    } catch (error) {
      console.error('Error saving quiz history:', error);
    }
  }, [quizHistory]);

  const handleQuizComplete = (historyWithShuffling: QuizHistory) => {
    // pushing to history with correct index as stored in questionLibrary 
    const history = {
      ...historyWithShuffling,
      startTime: historyWithShuffling.startTime || new Date().toISOString(),
      endTime: historyWithShuffling.endTime || new Date().toISOString(),
      questionAttempts: historyWithShuffling.questionAttempts.map(q => {
        const selectedOptionText = q.options?.[q.selectedAnswer];
        const originalIndex = selectedOptionText != null
          ? q.originalOptions.findIndex(opt => opt === selectedOptionText)
          : null;
    
        return {
          ...q,
          selectedAnswer: originalIndex
        };
      })
    };
    
    console.log(history);
    // Update quiz history
    setQuizHistory((prev) => [...prev, history]);

    // Update the qbank with the new attempts
    const selectedQBank = qbanks.find(qb => qb.id === history.qbankId);
    if (selectedQBank) {
      history.questionAttempts.forEach(attempt => {
        const question = selectedQBank.questions.find(q => q.id === attempt.questionId);
        if (question) {
          console.log(attempt.selectedAnswer);
          // console.log(attempt.originalOptions.indexOf(attempt.options[attempt.selectedAnswer]));
          
          question.attempts = [
            ...(question.attempts || []),
            {
              questionId: attempt.questionId,
              selectedAnswer: attempt.selectedAnswer,
              // selectedAnswer: question.options.indexOf(attempt.options[attempt.selectedAnswer]),
              isCorrect: attempt.isCorrect,
              date: new Date().toISOString(),
              isFlagged: attempt.isFlagged,
              tags: question.tags
            }
          ];
        }
      });

      // Save updated qbank to localStorage
      // localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
      saveQBanksToStorage(); // Save qbanks to localStorage as well
      initializeMetrics(); // Recalculate metrics so the logic bar updates
    }
    // console.log(history);

    toast({
      title: "Quiz completed!",
      // description: `You scored ${history.questionAttempts.filter(q=>q.isCorrect).length || 0} out of ${history.totalQuestions}`,
      description: `You scored ${history.score} out of ${history.totalQuestions}`,

    });
  };

  const handleQBankSelect = (qbank: QBank) => {
    localStorage.setItem('selectedQBank', JSON.stringify(qbank));
  };

  const handleQuizStart = () => {
    setInQuiz(true);
    // Reset all questions in qbanks
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.attempts = [];
        question.isFlagged = false;
      });
    });
    saveQBanksToStorage(); // Save the reset state
    localStorage.removeItem('selectedQBank');
  };

  const handleQuizEnd = () => setInQuiz(false);

  const handleClearHistory = () => {
    setQuizHistory([]);
    // Reset attempts in qbanks
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.attempts = [];
        question.isFlagged = false;
      });
    });
    saveQBanksToStorage(); // Save the reset state
    // Clear localStorage
    localStorage.removeItem('selectedQBank');
  };

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
                    <Route path="/session-history" element={<SessionDetail                           onQuizStart={()=>setInQuiz(true)}
                          onQuizEnd={()=>setInQuiz(false)}/>} />
                    <Route path="/qbanks" element={<QBanks qbanks={qbanks} />} />
                    <Route path="/qbanks/questions" element={<QuestionLibrary qbanks={qbanks} />} />
                    <Route path="/qbanks/media" element={<MediaLibrary qbanks={qbanks} />} />
                    <Route
                      path="/select-qbank"
                      element={<SelectQBank qbanks={qbanks} onSelect={handleQBankSelect} />}
                    />
                    <Route path="/qbanks/audio" element={<AudioLibrary />} />
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
