import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QBank, Question } from "../types/quiz";
import { Trash2, Edit2, Download, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface QBanksProps {
  qbanks: QBank[];
}

const QBanks = ({ qbanks }: QBanksProps) => {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [newQBankName, setNewQBankName] = useState("");
  const [newQBankDescription, setNewQBankDescription] = useState("");
  const [showNewQBankDialog, setShowNewQBankDialog] = useState(false);
  const [editingQBankId, setEditingQBankId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    media: {
      type: "" as "image" | "audio" | "video" | "",
      url: "",
      showWith: "question" as "question" | "answer"
    }
  });

  const handleCreateQBank = () => {
    if (!newQBankName.trim() || !newQBankDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newQBank: QBank = {
      id: `qbank-${Date.now()}`,
      name: newQBankName,
      description: newQBankDescription,
      questions: [],
    };

    qbanks.push(newQBank);
    setNewQBankName("");
    setNewQBankDescription("");
    setShowNewQBankDialog(false);
    toast({
      title: "Success",
      description: "Question bank created successfully",
    });
  };

  const handleDeleteQBank = (qbankId: string) => {
    const index = qbanks.findIndex((qbank) => qbank.id === qbankId);
    if (index !== -1) {
      qbanks.splice(index, 1);
      setSelectedQBank(null);
      toast({
        title: "Success",
        description: "Question bank deleted successfully",
      });
    }
  };

  const startEditing = (qbank: QBank) => {
    setEditingQBankId(qbank.id);
    setEditingName(qbank.name);
    setEditingDescription(qbank.description);
  };

  const handleSaveEdit = (qbankId: string) => {
    const qbank = qbanks.find((q) => q.id === qbankId);
    if (qbank) {
      if (!editingName.trim() || !editingDescription.trim()) {
        toast({
          title: "Error",
          description: "Name and description cannot be empty",
          variant: "destructive",
        });
        return;
      }
      qbank.name = editingName;
      qbank.description = editingDescription;
      setEditingQBankId(null);
      toast({
        title: "Success",
        description: "Question bank updated successfully",
      });
    }
  };

  const handleAddQuestion = () => {
    if (selectedQBank) {
      if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const question: Question = {
        id: Date.now(),
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        qbankId: selectedQBank.id,
      };

      if (newQuestion.explanation.trim()) {
        question.explanation = newQuestion.explanation;
      }

      if (newQuestion.media.type && newQuestion.media.url) {
        question.media = {
          type: newQuestion.media.type,
          url: newQuestion.media.url,
          showWith: newQuestion.media.showWith,
        };
      }

      selectedQBank.questions.push(question);
      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        media: {
          type: "",
          url: "",
          showWith: "question"
        }
      });
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    }
  };

  const handleSelectQBank = (qbank: QBank) => {
    setSelectedQBank(qbank);
    setShowConfirmDialog(true);
  };

  const handleConfirmSelection = () => {
    if (selectedQBank) {
      localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
      navigate('/');
      toast({
        title: "QBank Selected",
        description: `${selectedQBank.name} has been locked in.`,
      });
    }
  };

  const exportToCSV = (qbank: QBank) => {
    const csvRows = [
      ['Serial', 'Question', 'Correct Answer', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6', 'Option 7', 'Question Image', 'Answer Image', 'Explanation'],
      ...qbank.questions.map((q, index) => [
        index + 1,
        q.question,
        q.correctAnswer + 1,
        ...q.options,
        ...(Array(7 - q.options.length).fill('')), // Pad with empty strings if less than 7 options
        q.media?.showWith === 'question' ? q.media.url : '',
        q.media?.showWith === 'answer' ? q.media.url : '',
        q.explanation || ''
      ])
    ];

    const csvContent = csvRows.map(row => row.map(cell => 
      `"${String(cell).replace(/"/g, '""')}"`
    ).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${qbank.name}.csv`;
    link.click();
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => 
        row.split(',').map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'))
      );

      // Skip header row
      const questions: Question[] = rows.slice(1).map((row, index) => {
        const options = row.slice(3, 10).filter(opt => opt.trim() !== '');
        return {
          id: Date.now() + index,
          question: row[1],
          options,
          correctAnswer: parseInt(row[2]) - 1,
          qbankId: `imported-${Date.now()}`,
          explanation: row[12] || undefined,
          media: row[10] || row[11] ? {
            type: 'image',
            url: row[10] || row[11],
            showWith: row[10] ? 'question' : 'answer'
          } : undefined
        };
      });

      const newQBank: QBank = {
        id: `imported-${Date.now()}`,
        name: file.name.replace('.csv', ''),
        description: `Imported from ${file.name}`,
        questions
      };

      qbanks.push(newQBank);
      toast({
        title: "Success",
        description: "QBank imported successfully",
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Banks</h1>
        <div className="flex gap-2">
          <Button asChild>
            <label>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {qbanks.map((qbank) => (
          <div
            key={qbank.id}
            className="p-4 rounded-lg border-2 cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => handleSelectQBank(qbank)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{qbank.name}</h3>
                <p className="text-sm text-gray-600">{qbank.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {qbank.questions.length} questions
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToCSV(qbank);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(qbank);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQBank(qbank.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock in QBank</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to lock in {selectedQBank?.name}? You can unlock it later by double-clicking the tile on the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSelection}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showNewQBankDialog} onOpenChange={setShowNewQBankDialog}>
        <DialogTrigger asChild>
          <Button>Create New Question Bank</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Question Bank</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Enter question bank name"
                value={newQBankName}
                onChange={(e) => setNewQBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Enter description"
                value={newQBankDescription}
                onChange={(e) => setNewQBankDescription(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleCreateQBank}>
              Create Question Bank
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QBanks;
