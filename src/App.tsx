
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

const queryClient = new QueryClient();

const App = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
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
