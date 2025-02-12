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
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { QuizHistory } from "./types/quiz";
import { qbanks } from "./data/questions";
import { toast } from "@/components/ui/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [inQuiz, setInQuiz] = useState(false);

  const handleQuizComplete = (history: QuizHistory) => {
    setQuizHistory((prev) => [...prev, history]);
    toast({
      title: "Quiz completed!",
      description: `You scored ${history.score} out of ${history.totalQuestions}`,
    });
  };

  const handleQuizStart = () => setInQuiz(true);
  const handleQuizEnd = () => setInQuiz(false);

  return (
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
                    element={<History quizHistory={quizHistory} />}
                  />
                  <Route path="/qbanks" element={<QBanks qbanks={qbanks} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

