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

  // Function to update the filters based on the latest quiz results
  const updateFiltersAfterQuiz = (quizResults: { questionId: number; selectedAnswer: number | null; isCorrect: boolean }[]) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };

      quizResults.forEach(({ questionId, selectedAnswer, isCorrect }) => {
        updatedFilters.unused = false; // Mark all questions as used
        updatedFilters.used = true;

        if (selectedAnswer === null) {
          updatedFilters.omitted = true; // Mark as omitted if skipped
        } else {
          updatedFilters.omitted = false;
        }

        if (isCorrect) {
          updatedFilters.correct = true;
          updatedFilters.incorrect = false; // Remove from incorrect if corrected
        } else {
          updatedFilters.correct = false;
          updatedFilters.incorrect = true; // Mark as incorrect
        }
      });

      return updatedFilters;
    });
  };

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

        if (question.isFlagged) {
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
          (filters.unused && (!question.attempts || question.attempts.length === 0)) ||
          (filters.used && question.attempts && question.attempts.length > 0) ||
          (filters.correct && lastAttempt?.isCorrect) ||
          (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
          (filters.omitted && lastAttempt?.selectedAnswer === null) ||
          (filters.flagged && question.isFlagged)
        );
      })
    );
  }, [qbanks, filters]);

  const handleQBankClick = (qbank: QBank) => {
    setSelectedQBank(qbank);
    updateFilters(qbank); 
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

  // Update the filters based on actual question attempts
  const updateFilters = (qbank: QBank) => {
    const hasUsed = qbank.questions.some(q => q.attempts?.length > 0);
    const hasUnused = qbank.questions.some(q => !q.attempts?.length);
    const hasCorrect = qbank.questions.some(q => q.attempts?.[q.attempts.length - 1]?.isCorrect);
    const hasIncorrect = qbank.questions.some(q => q.attempts?.[q.attempts.length - 1]?.isCorrect === false);
    const hasOmitted = qbank.questions.some(q => q.attempts?.[q.attempts.length - 1]?.selectedAnswer === null);
    const hasFlagged = qbank.questions.some(q => q.isFlagged);

    setFilters({
      used: hasUsed,
      unused: hasUnused,
      correct: hasCorrect,
      incorrect: hasIncorrect,
      omitted: hasOmitted,
      flagged: hasFlagged
    });
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
            return Object.values(newFilters).some(v => v) 
              ? newFilters 
              : {
                  unused: true,
                  used: false,
                  incorrect: false,
                  correct: false,
                  flagged: false,
                  omitted: false,
                };
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
