import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import Performance from "./pages/Performance";
import History from "./pages/History";
import QBanks from "./pages/QBanks";
import SelectQBank from "./pages/SelectQBank";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { QuizHistory, QBank, Question } from "./types/quiz";
import { qbanks } from "./data/questions";
import { toast } from "@/components/ui/use-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import QuestionLibrary from "@/components/qbanks/QuestionLibrary";
import MediaLibrary from "@/components/qbanks/MediaLibrary";

const queryClient = new QueryClient();

const App = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [inQuiz, setInQuiz] = useState(false);

  const handleQuizComplete = (history: QuizHistory) => {
    // Update quiz history
    setQuizHistory((prev) => [...prev, history]);

    // Update the qbank with the new attempts
    const selectedQBank = qbanks.find(qb => qb.id === history.qbankId);
    if (selectedQBank) {
      history.questionAttempts.forEach(attempt => {
        const question = selectedQBank.questions.find(q => q.id === attempt.questionId);
        if (question) {
          question.attempts = [
            ...(question.attempts || []),
            {
              selectedAnswer: attempt.selectedAnswer,
              isCorrect: attempt.isCorrect,
              date: new Date().toISOString()
            }
          ];
        }
      });
      
      // Save updated qbank to localStorage
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
    // Reset all questions in qbanks
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        question.attempts = [];
        question.isFlagged = false;
      });
    });
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
    // Clear localStorage
    localStorage.removeItem('selectedQBank');
  };

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                {!inQuiz && <AppSidebar />}
                <main className="flex-1">
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
                      path="/performance"
                      element={<Performance quizHistory={quizHistory} />}
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
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
