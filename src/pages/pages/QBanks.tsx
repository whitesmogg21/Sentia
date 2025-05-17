import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QBank, Question } from "@/types/quiz";
import { Trash2, Edit2, Download, Upload } from "lucide-react";
import MediaUploader from "@/components/MediaUploader";
import MediaManager from "@/components/MediaManager";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { saveQBanksToStorage } from "@/data/questions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import Pagination from "@/components/Pagintion";
import { Dialog as Modal, DialogContent as ModalContent, DialogHeader as ModalHeader, DialogTitle as ModalTitle } from "@/components/ui/dialog";

interface QBanksProps {
  qbanks: QBank[];
}

const QBanks = ({ qbanks }: QBanksProps) => {
  const navigate = useNavigate();
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [showQBankConfirmDialog, setShowQBankConfirmDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
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
  const [selectedQBankForMedia, setSelectedQBankForMedia] = useState<QBank | null>(null);
  const [importSummary, setImportSummary] = useState<{ count: number; name: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const QBANKS_PER_PAGE = 10;
  const totalPages = Math.ceil(qbanks.length / QBANKS_PER_PAGE);
  const paginatedQBanks = qbanks.slice((currentPage - 1) * QBANKS_PER_PAGE, currentPage * QBANKS_PER_PAGE);


  const handleMediaUpload = (files: File[]) => {
    setMediaFiles(files);
    toast({
      title: "Media Files Ready",
      description: `${files.length} files will be used for the next CSV import`,
    });
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
        const imageFilename = row[10]?.trim();

        // Find matching media file
        const mediaFile = mediaFiles.find(file => file.name === imageFilename);
        const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : undefined;

        return {
          id: Date.now() + index,
          question: row[1],
          options,
          correctAnswer: parseInt(row[2]) - 1,
          qbankId: `imported-${Date.now()}`,
          explanation: row[12] || undefined,
          attempts: [],
          tags: ['imported', 'qbank'],
          media: imageFilename && mediaUrl ? {
            type: 'image',
            url: mediaUrl,
            showWith: 'question'
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
      saveQBanksToStorage();
      setMediaFiles([]);
      setImportSummary({ count: questions.length, name: newQBank.name });
      toast({
        title: "Success",
        description: "QBank imported successfully with media files",
      });
    };
    reader.readAsText(file);
  };

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

    // Explicitly save to localStorage
    saveQBanksToStorage();
    console.log('Created new qbank and saved:', qbanks.length);

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

      // Explicitly save to localStorage
      saveQBanksToStorage();
      console.log('Deleted qbank and saved:', qbanks.length);

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

      // Explicitly save to localStorage
      saveQBanksToStorage();
      console.log('Updated qbank and saved:', qbanks.length);

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
        attempts: [],
        tags: ['qbank']
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

      // Explicitly save to localStorage
      saveQBanksToStorage();
      console.log('Added question to qbank and saved:', selectedQBank.questions.length);

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
    setShowQBankConfirmDialog(true);
  };

  const handleManageMedia = (qbank: QBank) => {
    setSelectedQBankForMedia(qbank);
    setShowMediaDialog(true);
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

  const calculateQuestionMetrics = (qbank: QBank) => {
    const metrics = {
      unused: 0,
      used: 0,
      correct: 0,
      incorrect: 0,
      omitted: 0,
      flagged: 0
    };

    qbank.questions.forEach(question => {
      if (!question.attempts || question.attempts.length === 0) {
        metrics.unused++;
      } else {
        metrics.used++;
        const lastAttempt = question.attempts[question.attempts.length - 1];
        if (lastAttempt.selectedAnswer === null) {
          metrics.omitted++;
        } else if (lastAttempt.isCorrect) {
          metrics.correct++;
        } else {
          metrics.incorrect++;
        }
      }
      if (question.isFlagged) {
        metrics.flagged++;
      }
    });

    return metrics;
  };

  const updateMedia = () => {
    toast({
      title: "Success",
      description: "Media files updated successfully",
    });
  };

  const handleCloseImportSummary = () => {
    setImportSummary(null);
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Banks</h1>
        <div className="flex gap-2">
          <MediaUploader onUploadComplete={handleMediaUpload} />
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
        {paginatedQBanks.map((qbank) => {
          const metrics = calculateQuestionMetrics(qbank);

          return (
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
                  <div className="mt-2 flex gap-2 text-sm">
                    <span className="text-green-600">✓ {metrics.correct}</span>
                    <span className="text-red-600">✗ {metrics.incorrect}</span>
                    <span className="text-yellow-600">⚑ {metrics.flagged}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    handleManageMedia(qbank);
                  }}>
                    Manage Media
                  </Button>
                  <Button variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    exportToCSV(qbank);
                  }}>
                    Export
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
          );
        })}
        {qbanks.length > 5 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <AlertDialog open={showQBankConfirmDialog} onOpenChange={setShowQBankConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock in Question Bank?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to select this question bank? You won't be able to change it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSelection}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Media</DialogTitle>
          </DialogHeader>
          {selectedQBankForMedia && (
            <MediaManager
              qbank={selectedQBankForMedia}
              onMediaUpdate={() => {
                setShowMediaDialog(false);
                setSelectedQBankForMedia(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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

      {importSummary && (
        <Modal open={true} onOpenChange={handleCloseImportSummary}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Import Complete</ModalTitle>
            </ModalHeader>
            <div className="py-4 text-center">
              <p className="text-lg font-semibold mb-2">{importSummary.count} questions imported</p>
              <p className="text-gray-600">QBank: <span className="font-bold">{importSummary.name}</span></p>
              <Button className="mt-6" onClick={handleCloseImportSummary}>OK</Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default QBanks;
