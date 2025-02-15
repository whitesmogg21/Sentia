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
    const seenQuestions = new Set<number>();
    const correctQuestions = new Set<number>();
    const incorrectQuestions = new Set<number>();
    const omittedQuestions = new Set<number>();
    const flaggedQuestions = new Set<number>();

    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        const attempts = question.attempts || [];
        const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

        if (attempts.length > 0) {
          seenQuestions.add(question.id);

          if (lastAttempt?.selectedAnswer === null) {
            omittedQuestions.add(question.id);
          } else if (lastAttempt.isCorrect) {
            correctQuestions.add(question.id);
            incorrectQuestions.delete(question.id); // ✅ Move out of Incorrect if later answered correctly
          } else {
            incorrectQuestions.add(question.id);
          }
        }

        if (question.isMarked) {
          flaggedQuestions.add(question.id);
        }
      });
    });

    const totalQuestions = qbanks.reduce((acc, qbank) => acc + qbank.questions.length, 0);

    return {
      unused: totalQuestions - seenQuestions.size,
      used: seenQuestions.size,
      correct: correctQuestions.size,
      incorrect: incorrectQuestions.size,
      flagged: flaggedQuestions.size,
      omitted: omittedQuestions.size,
    };
  }, [qbanks]);

  // Filter QBanks based on selected filter
  const filteredQBanks = useMemo(() => {
    if (!Object.values(filters).some(v => v)) return qbanks; // Show all if no filter is active

    return qbanks.filter(qbank =>
      qbank.questions.some(question => {
        const lastAttempt = question.attempts?.[question.attempts.length - 1] || null;

        return (
          (filters.unused && !question.attempts) ||
          (filters.used && question.attempts) ||
          (filters.correct && lastAttempt?.isCorrect) ||
          (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
          (filters.omitted && lastAttempt?.selectedAnswer === null) ||
          (filters.flagged && question.isMarked)
        );
      })
    );
  }, [qbanks, filters]);

  const handleQBankClick = (qbank: QBank) => {
    setSelectedQBank(qbank);
  };

  const handleConfirmSelection = () => {
    if (selectedQBank) {
      onSelect(selectedQBank);
      localStorage.setItem("selectedQBank", JSON.stringify(selectedQBank));
      navigate("/");
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
        onToggleFilter={(key) =>
          setFilters(prev => {
            const newFilters = { ...prev, [key]: !prev[key] };

            // Ensure at least one filter remains active
            if (!Object.values(newFilters).some(v => v)) {
              return { unused: true }; // Default to "Unused" if no filters are active
            }

            return newFilters;
          })
        }
      />
      <div className="grid gap-4">
        {filteredQBanks.map(qbank => (
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
        <Button onClick={handleConfirmSelection} disabled={!selectedQBank}>
          Lock Selection
        </Button>
      </div>
    </div>
  );
};

export default SelectQBank;
