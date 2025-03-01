
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import History from "./pages/History";
import QBanks from "./pages/QBanks";
import SelectQBank from "./pages/SelectQBank";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import QuestionLibrary from "@/components/qbanks/QuestionLibrary";
import MediaLibrary from "@/components/qbanks/MediaLibrary";
import { useQuizStore } from "@/store/quiz/quizStore";
import { useQBankStore } from "@/store/qbank/qbankStore";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { inQuiz, showScore, addQuizHistory } = useQuizStore();
  const { qbanks } = useQBankStore();
  
  // Initialize app state from localStorage if available
  useEffect(() => {
    // Load quiz history from localStorage
    const storedHistory = localStorage.getItem('quizHistory');
    if (storedHistory) {
      try {
        const historyData = JSON.parse(storedHistory);
        if (Array.isArray(historyData)) {
          historyData.forEach(quiz => addQuizHistory(quiz));
        }
      } catch (error) {
        console.error("Failed to parse quiz history from localStorage:", error);
      }
    }
  }, [addQuizHistory]);

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full overflow-hidden">
                {!inQuiz && <AppSidebar />}
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/qbanks" element={<QBanks />} />
                    <Route path="/qbanks/questions" element={<QuestionLibrary qbanks={qbanks} />} />
                    <Route path="/qbanks/media" element={<MediaLibrary qbanks={qbanks} />} />
                    <Route path="/select-qbank" element={<SelectQBank onSelect={() => {}} />} />
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
