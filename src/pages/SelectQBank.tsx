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
  onSelect: (qbank: QBank, filteredQuestions: number[]) => void;
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
    const questionCounts = {
      unused: 0,
      used: 0,
      incorrect: 0,
      correct: 0,
      flagged: 0,
      omitted: 0,
    };

    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        const lastAttempt = question.attempts?.[question.attempts.length - 1] || null;

        if (!question.attempts?.length) {
          questionCounts.unused++;
        } else {
          questionCounts.used++;
        }

        if (lastAttempt?.selectedAnswer === null) {
          questionCounts.omitted++;
        } else if (lastAttempt?.isCorrect) {
          questionCounts.correct++;
        } else {
          questionCounts.incorrect++;
        }

        if (question.isFlagged) {
          questionCounts.flagged++;
        }
      });
    });

    return questionCounts;
  }, [qbanks]);

  // Ensure only questions that match the selected filter are available
  const filteredQBanks = useMemo(() => {
    if (!Object.values(filters).some(v => v)) return qbanks; // Show all if no filter is active

    return qbanks
      .map(qbank => {
        const filteredQuestions = qbank.questions.filter(question => {
          const lastAttempt = question.attempts?.[question.attempts.length - 1] || null;
          return (
            (filters.unused && !question.attempts) ||
            (filters.used && question.attempts) ||
            (filters.correct && lastAttempt?.isCorrect) ||
            (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
            (filters.omitted && lastAttempt?.selectedAnswer === null) ||
            (filters.flagged && question.isFlagged)
          );
        });

        return filteredQuestions.length > 0 ? { ...qbank, questions: filteredQuestions } : null;
      })
      .filter(Boolean) as QBank[];
  }, [qbanks, filters]);

  const handleQBankClick = (qbank: QBank) => {
    setSelectedQBank(qbank);
  };

  const handleConfirmSelection = () => {
    if (selectedQBank) {
      const filteredQuestions = selectedQBank.questions.map(q => q.id); // Only send filtered questions
      onSelect(selectedQBank, filteredQuestions);
      localStorage.setItem("selectedQBank", JSON.stringify(selectedQBank));
      navigate("/");

      toast({
        title: "QBank Selected",
        description: `Selected ${selectedQBank.name} for quiz (${filteredQuestions.length} questions)`,
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
              return { unused: true };
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
            <p className="text-sm text-gray-600">
              Questions: {qbank.questions.length} {/* Now shows filtered question count */}
            </p>
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
