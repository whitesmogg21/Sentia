
import { useState, useEffect } from "react";
import { QBank, QuestionMetrics } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface SelectQBankProps {
  qbanks: QBank[];
}

const SelectQBank = ({ qbanks }: SelectQBankProps) => {
  const navigate = useNavigate();
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);

  const handleSelectQBank = (qbank: QBank) => {
    setSelectedQBank(qbank);
    localStorage.setItem('selectedQBank', JSON.stringify(qbank));
    navigate('/');
    toast({
      title: "QBank Selected",
      description: `${qbank.name} has been selected.`,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select Question Bank</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {qbanks.map((qbank) => (
          <div
            key={qbank.id}
            className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleSelectQBank(qbank)}
          >
            <h2 className="text-lg font-semibold">{qbank.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{qbank.description}</p>
            <div className="flex gap-2 flex-wrap">
              {qbank.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {qbank.questions.length} questions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectQBank;
