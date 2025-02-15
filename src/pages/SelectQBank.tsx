
import { useState, useMemo } from "react";
import { QBank, QuestionFilter } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import QuestionFiltersBar from "@/components/QuestionFiltersBar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SelectQBankProps {
  qbanks: QBank[];
  onSelect: (qbank: QBank) => void;
}

const SelectQBank = ({ qbanks, onSelect }: SelectQBankProps) => {
  const navigate = useNavigate();
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [filters, setFilters] = useState<QuestionFilter>({
    unused: false,
    used: false,
    incorrect: false,
    correct: false,
    flagged: false,
    omitted: false,
  });

  // Calculate metrics for the filter bar
  const metrics = useMemo(() => {
  const seenQuestionIds = new Set<number>();
  const correctQuestionIds = new Set<number>();
  const incorrectQuestionIds = new Set<number>();
  const omittedQuestionIds = new Set<number>();
  const flaggedQuestionIds = new Set<number>();

  qbanks.forEach(qbank => {
    qbank.questions.forEach(question => {
      const attempts = question.attempts || [];
      const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

      if (attempts.length > 0) {
        seenQuestionIds.add(question.id);
        if (lastAttempt?.selectedAnswer === null) {
          omittedQuestionIds.add(question.id);
        } else if (lastAttempt.isCorrect) {
          correctQuestionIds.add(question.id);
          incorrectQuestionIds.delete(question.id); // ✅ Ensure it moves out of Incorrect
        } else {
          incorrectQuestionIds.add(question.id);
        }
      }

      if (question.isMarked) {
        flaggedQuestionIds.add(question.id);
      }
    });
  });

  const totalQuestions = qbanks.reduce((acc, qbank) => acc + qbank.questions.length, 0);

  return {
    unused: totalQuestions - seenQuestionIds.size,
    used: seenQuestionIds.size,
    correct: correctQuestionIds.size,
    incorrect: incorrectQuestionIds.size,
    flagged: flaggedQuestionIds.size,
    omitted: omittedQuestionIds.size,
  };
}, [qbanks]);

  const handleQBankClick = (qbank: QBank) => {
    setSelectedQBank(qbank);
  };

  const handleConfirmSelection = () => {
    if (selectedQBank) {
      onSelect(selectedQBank);
      localStorage.setItem('selectedQBank', JSON.stringify(selectedQBank));
      navigate('/');
      toast({
        title: "QBank Selected",
        description: `Selected ${selectedQBank.name} for quiz`,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Select Question Bank</h1>
      <QuestionFiltersBar
        metrics={metrics}
        filters={filters}
        onToggleFilter={(key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
      />
      <div className="grid gap-4">
  {qbanks
    .filter((qbank) => {
      // If no filter is selected, show all QBanks
      if (!Object.values(filters).some(v => v)) return true;

      // Check if the QBank has at least one question in the selected filter
      return qbank.questions.some((question) => {
        const lastAttempt = question.attempts?.[question.attempts.length - 1] || null;
        return (
          (filters.unused && !question.attempts) ||
          (filters.used && question.attempts) ||
          (filters.correct && lastAttempt?.isCorrect) ||
          (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
          (filters.omitted && lastAttempt?.selectedAnswer === null) ||
          (filters.flagged && question.isMarked)
        );
      });
    })
    .map((qbank) => (
          <Card
            key={qbank.id}
            className={cn(
              "p-4 cursor-pointer transition-colors",
              selectedQBank?.id === qbank.id && "border-primary border-2"
            )}
            onClick={() => handleQBankClick(qbank)}
          >
            <h3 className="font-bold">{qbank.name}</h3>
            <p className="text-sm text-gray-600">{qbank.description}</p>
            <p className="text-sm text-gray-600">Questions: {qbank.questions.length}</p>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleConfirmSelection}
          disabled={!selectedQBank}
        >
          Lock Selection
        </Button>
      </div>
    </div>
  );
};

export default SelectQBank;
