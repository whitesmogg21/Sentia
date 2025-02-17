
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { QBank, Question } from "@/types/quiz";
import QuestionForm from "./QuestionForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

interface EditQBankModalProps {
  qbank: QBank;
  isOpen: boolean;
  onClose: () => void;
}

const EditQBankModal = ({ qbank, isOpen, onClose }: EditQBankModalProps) => {
  const [questions, setQuestions] = useState<Question[]>(qbank.questions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = async (question: Question) => {
    setIsLoading(true);
    try {
      const updatedQuestions = questions.map(q => 
        q.id === question.id ? question : q
      );
      setQuestions(updatedQuestions);
      qbank.questions = updatedQuestions;
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    const newQuestion: Question = {
      id: Date.now(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      qbankId: qbank.id,
    };
    setQuestions([...questions, newQuestion]);
    setHasUnsavedChanges(true);
  };

  const handleDelete = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    setHasUnsavedChanges(true);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Do you want to discard them?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Questions - {qbank.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[60vh] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions available. Click 'Add New Question' to create one.
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question) => (
                  <QuestionForm
                    key={question.id}
                    question={question}
                    onSave={handleSave}
                    onDelete={() => handleDelete(question.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQBankModal;
