
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useQuizStore } from "@/store/quiz/quizStore";
import { useQBankStore } from "@/store/qbank/qbankStore";

const History = () => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { history, clearHistory } = useQuizStore();
  const { qbanks } = useQBankStore();

  const handleClearHistory = () => {
    clearHistory();
    setShowClearDialog(false);
  };

  const getQBankName = (qbankId: string) => {
    const qbank = qbanks.find(qb => qb.id === qbankId);
    return qbank ? qbank.name : "Unknown";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quiz History</h1>
        {history.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={() => setShowClearDialog(true)}
          >
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center p-12 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No quizzes yet</h2>
          <p className="text-muted-foreground">
            Complete quizzes to see your history and track your progress
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...history].reverse().map((quiz) => (
            <Card key={quiz.id} className="p-4 flex flex-col">
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">
                  {formatDistanceToNow(parseISO(quiz.date), { addSuffix: true })}
                </div>
                <h3 className="font-semibold">{getQBankName(quiz.qbankId)}</h3>
              </div>
              
              <div className="flex justify-between items-center mt-auto">
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quiz.score} of {quiz.totalQuestions} correct
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear quiz history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all of your quiz history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
