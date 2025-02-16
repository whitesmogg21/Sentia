
import { Moon, Sun, Maximize, Minimize, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useTheme } from "next-themes";

interface QuizTopBarProps {
  onToggleSidebar: () => void;
}

const QuizTopBar = ({ onToggleSidebar }: QuizTopBarProps) => {
  const { toggleFullscreen, isFullscreen } = useFullscreen();
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-background border-b flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuizTopBar;
