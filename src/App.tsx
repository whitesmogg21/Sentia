
import { Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/pages/Index";
import Performance from "@/pages/Performance";
import History from "@/pages/History";
import QBanks from "@/pages/QBanks";
import MediaLibrary from "@/pages/qbanks/MediaLibrary";
import NotFound from "@/pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { QBank, QuizHistory } from "./types/quiz";
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [qbanks, setQbanks] = useState<QBank[]>([]);

  const handleClearHistory = () => {
    setQuizHistory([]);
  };

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/performance" element={<Performance quizHistory={quizHistory} />} />
              <Route 
                path="/history" 
                element={
                  <History 
                    quizHistory={quizHistory}
                    onClearHistory={handleClearHistory}
                  />
                } 
              />
              <Route path="/qbanks" element={<QBanks qbanks={qbanks} />} />
              <Route path="/qbanks/media" element={<MediaLibrary />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
