
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

function App() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/history" element={<History />} />
            <Route path="/qbanks" element={<QBanks />} />
            <Route path="/qbanks/media" element={<MediaLibrary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
