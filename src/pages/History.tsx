import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuizHistory } from "../types/quiz";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { resetMetrics } from "@/utils/metricsUtils";
import { loadQuizData } from "@/hooks/quiz";

const History = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const history = await loadQuizData();
        setQuizHistory(history || []);
      } catch (error) {
        console.error("Error loading quiz history:", error);
        setQuizHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    const handleQuizHistoryUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      setQuizHistory(customEvent.detail || []);
    };

    window.addEventListener('quizHistoryUpdated', handleQuizHistoryUpdated);
    window.addEventListener('quizDataCleared', () => setQuizHistory([]));

    return () => {
      window.removeEventListener('quizHistoryUpdated', handleQuizHistoryUpdated);
      window.removeEventListener('quizDataCleared', () => setQuizHistory([]));
    };
  }, []);

  const handleClearConfirm = async () => {
    await resetMetrics();
    setQuizHistory([]);
    import('@/hooks/quiz').then(module => {
      module.clearQuizData();
    });
    setShowClearDialog(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="destructive" 
          onClick={() => setShowClearDialog(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Previous Quizzes</h1>
      <div className="bg-card rounded-2xl shadow-lg p-6">
        {isLoading ? (
          <div className="py-10 text-center">Loading quiz history...</div>
        ) : quizHistory.length === 0 ? (
          <div className="py-10 text-center">No quiz history available</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-foreground">Date</TableHead>
                <TableHead className="text-foreground">Question Bank</TableHead>
                <TableHead className="text-foreground">Score</TableHead>
                <TableHead className="text-foreground">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizHistory.map((quiz) => (
                <TableRow key={quiz.id} className="hover:bg-muted/50">
                  <TableCell className="text-foreground">{quiz.date}</TableCell>
                  <TableCell className="text-foreground">{quiz.qbankId}</TableCell>
                  <TableCell className="text-foreground">{quiz.score}/{quiz.totalQuestions}</TableCell>
                  <TableCell className="text-foreground">{((quiz.score / quiz.totalQuestions) * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Quiz History</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all performance metrics and quiz history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button 
              onClick={handleClearConfirm}
            >
              Clear History
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
