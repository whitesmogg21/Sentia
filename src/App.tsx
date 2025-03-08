
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QBanks from "./pages/QBanks";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import SelectQBank from "./pages/SelectQBank";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import { useDBInit } from "./hooks/use-db-init";
import { useEffect } from "react";
import { toast } from "./components/ui/use-toast";

function App() {
  const { isInitialized, error } = useDBInit();

  useEffect(() => {
    if (error) {
      toast({
        title: "Database Error",
        description: "Failed to initialize the database. Some features may not work correctly.",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/qbanks" element={<QBanks />} />
        <Route path="/history" element={<History />} />
        <Route path="/select-qbank" element={<SelectQBank />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
