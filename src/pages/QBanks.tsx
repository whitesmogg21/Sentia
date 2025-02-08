
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QBank } from "../types/quiz";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface QBanksProps {
  qbanks: QBank[];
}

const QBanks = ({ qbanks }: QBanksProps) => {
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [newQBankName, setNewQBankName] = useState("");
  const [newQBankDescription, setNewQBankDescription] = useState("");
  const [showNewQBankDialog, setShowNewQBankDialog] = useState(false);

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Question Banks</h1>
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Question Banks</h2>
          <div className="grid gap-4">
            {qbanks.map((qbank) => (
              <div
                key={qbank.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedQBank?.id === qbank.id
                    ? "border-primary"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1"
                    onClick={() => setSelectedQBank(qbank)}
                  >
                    <h3 className="font-bold">{qbank.name}</h3>
                    <p className="text-sm text-gray-600">{qbank.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {qbank.questions.length} questions
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDeleteQBank(qbank.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedQBank && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions in {selectedQBank.name}</h2>
            <div className="space-y-4">
              {selectedQBank.questions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <p className="font-medium">{question.question}</p>
                  <div className="mt-2 space-y-1">
                    {question.options.map((option, index) => (
                      <p
                        key={index}
                        className={`text-sm pl-4 ${
                          index === question.correctAnswer
                            ? "text-green-600 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {option}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Add New Question</h3>
              <Input placeholder="Question text" />
              <div className="grid gap-2">
                <Input placeholder="Option 1" />
                <Input placeholder="Option 2" />
                <Input placeholder="Option 3" />
                <Input placeholder="Option 4" />
              </div>
              <Input
                type="number"
                min={0}
                max={3}
                placeholder="Correct answer (0-3)"
              />
              <Button className="w-full">Add Question</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QBanks;
