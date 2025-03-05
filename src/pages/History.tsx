
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
import { Trash2, DownloadCloud } from "lucide-react";
import { useState } from "react";
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
import { toast } from "@/components/ui/use-toast";

interface HistoryProps {
  quizHistory: QuizHistory[];
  onClearHistory: () => void;
}

const History = ({ quizHistory, onClearHistory }: HistoryProps) => {
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearConfirm = () => {
    // Reset metrics (but keep flags)
    resetMetrics();
    
    // Clear history
    onClearHistory();
    setShowClearDialog(false);
    
    toast({
      title: "History cleared",
      description: "All quiz history has been cleared."
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Previous Quizzes ({quizHistory.length})</h1>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-2"
            disabled={quizHistory.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        </div>
      </div>
      
      {quizHistory.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
          <p className="text-muted-foreground">No quiz history available.</p>
          <p className="text-sm text-muted-foreground mt-2">Complete a quiz to see your results here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-lg p-6">
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
                  <TableCell className="text-foreground">{formatDate(quiz.date)}</TableCell>
                  <TableCell className="text-foreground">{quiz.qbankId}</TableCell>
                  <TableCell className="text-foreground">{quiz.score}/{quiz.totalQuestions}</TableCell>
                  <TableCell className="text-foreground">{((quiz.score / quiz.totalQuestions) * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
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
              variant="destructive"
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
