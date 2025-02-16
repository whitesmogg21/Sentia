
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QBank } from "@/types/quiz";
import { Trash2, Edit2, Download } from "lucide-react";
import MediaManager from "@/components/MediaManager";
import { toast } from "@/components/ui/use-toast";

interface QBanksProps {
  qbanks: QBank[];
}

const QBanks = ({ qbanks }: QBanksProps) => {
  const [editingQBank, setEditingQBank] = useState<QBank | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const handleEditClick = (qbank: QBank, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQBank(qbank);
    setEditingName(qbank.name);
    setEditingDescription(qbank.description);
  };

  const handleSaveEdit = (qbank: QBank) => {
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
    setEditingQBank(null);
    toast({
      title: "Success",
      description: "Question bank updated successfully",
    });
  };

  const handleDeleteQBank = (qbankId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = qbanks.findIndex((qbank) => qbank.id === qbankId);
    if (index !== -1) {
      qbanks.splice(index, 1);
      toast({
        title: "Success",
        description: "Question bank deleted successfully",
      });
    }
  };

  const handleMediaUpdate = () => {
    toast({
      title: "Success",
      description: "Media files updated successfully",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Question Banks</h1>
      
      <div className="grid gap-4">
        {qbanks.map((qbank) => (
          <div
            key={qbank.id}
            className="p-4 rounded-lg border border-gray-200 bg-card"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editingQBank?.id === qbank.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Question bank name"
                    />
                    <Input
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleSaveEdit(qbank)}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingQBank(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold">{qbank.name}</h3>
                    <p className="text-sm text-gray-600">{qbank.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {qbank.questions.length} questions
                    </p>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                <MediaManager qbank={qbank} onMediaUpdate={handleMediaUpdate} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleEditClick(qbank, e)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90"
                  onClick={(e) => handleDeleteQBank(qbank.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QBanks;
