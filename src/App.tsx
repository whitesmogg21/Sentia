
import { Routes, Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import QBanks from "./pages/QBanks";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import SelectQBank from "./pages/SelectQBank";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import { useDBInit } from "./hooks/use-db-init";
import { useEffect, useState } from "react";
import { toast } from "./components/ui/use-toast";
import { getQBanks, qbanks } from "./data/questions";
import { QBank } from "./types/quiz";

function App() {
  const { isInitialized, error } = useDBInit();
  const [loadedQBanks, setLoadedQBanks] = useState<QBank[]>(qbanks);
  
  // Handle selected qbank
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  
  // Load qbanks when the app initializes
  useEffect(() => {
    const loadQBanksData = async () => {
      const banks = await getQBanks();
      setLoadedQBanks(banks);
    };
    
    loadQBanksData();
  }, [isInitialized]);
  
  // Load selected qbank from storage
  useEffect(() => {
    const loadSelectedQBank = () => {
      try {
        const savedQBank = localStorage.getItem('selectedQBank');
        if (savedQBank) {
          setSelectedQBank(JSON.parse(savedQBank));
        }
      } catch (error) {
        console.error('Error loading selected QBank', error);
      }
    };
    
    loadSelectedQBank();
  }, []);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Database Error",
        description: "Failed to initialize the database. Some features may not work correctly.",
        variant: "destructive",
      });
    }
  }, [error]);

  const handleSelectQBank = (qbank: QBank) => {
    setSelectedQBank(qbank);
    localStorage.setItem('selectedQBank', JSON.stringify(qbank));
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/qbanks" element={<QBanks qbanks={loadedQBanks} />} />
          <Route path="/history" element={<History />} />
          <Route path="/select-qbank" element={<SelectQBank qbanks={loadedQBanks} onSelect={handleSelectQBank} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
