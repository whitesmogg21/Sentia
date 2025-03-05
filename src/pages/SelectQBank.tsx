
import { useState, useMemo, useEffect } from "react";
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

  // Load previously selected qbank from localStorage if available
  useEffect(() => {
    const storedQBank = localStorage.getItem('selectedQBank');
    if (storedQBank) {
      try {
        const parsedQBank = JSON.parse(storedQBank);
        const matchingQBank = qbanks.find(qb => qb.id === parsedQBank.id);
        if (matchingQBank) {
          setSelectedQBank(matchingQBank);
          updateFilters(matchingQBank);
        }
      } catch (e) {
        console.error("Error parsing stored qbank:", e);
      }
    }
  }, [qbanks]);

  // Calculate metrics for the filter bar
  const metrics = useMemo(() => {
    // Initialize counters
    let unusedCount = 0;
    let usedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let omittedCount = 0;
    let flaggedCount = 0;
    
    // We'll only count questions from the selected qbank if one is selected
    const relevantQBanks = selectedQBank ? [selectedQBank] : qbanks;
    
    relevantQBanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        const attempts = question.attempts || [];
        
        if (attempts.length === 0) {
          unusedCount++;
        } else {
          usedCount++;
          
          // Get the latest attempt
          const lastAttempt = attempts[attempts.length - 1];
          
          if (lastAttempt.selectedAnswer === null) {
            omittedCount++;
            incorrectCount++; // Omitted is also counted as incorrect
          } else if (lastAttempt.isCorrect) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        }
        
        if (question.isFlagged) {
          flaggedCount++;
        }
      });
    });

    return {
      unused: unusedCount,
      used: usedCount,
      correct: correctCount,
      incorrect: incorrectCount,
      flagged: flaggedCount,
      omitted: omittedCount,
    };
  }, [qbanks, selectedQBank]);

  // Filter QBanks based on selected filter
  const filteredQBanks = useMemo(() => {
    if (!Object.values(filters).some(v => v)) return qbanks; // Show all if no filter is active

    return qbanks.filter(qbank =>
      qbank.questions.some(question => {
        const attempts = question.attempts || [];
        const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
        
        return (
          (filters.unused && attempts.length === 0) ||
          (filters.used && attempts.length > 0) ||
          (filters.correct && lastAttempt?.isCorrect) ||
          (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
          (filters.omitted && lastAttempt?.selectedAnswer === null) ||
          (filters.flagged && question.isFlagged)
        );
      })
    );
  }, [qbanks, filters]);

  const handleQBankClick = (qbank: QBank) => {
    // Toggle selection if clicking the same qbank
    if (selectedQBank && selectedQBank.id === qbank.id) {
      setSelectedQBank(null);
      setFilters({
        unused: false,
        used: false,
        incorrect: false,
        correct: false,
        flagged: false,
        omitted: false,
      });
    } else {
      setSelectedQBank(qbank);
      updateFilters(qbank);
    }
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

  // Update the filters based on actual question attempts for the selected qbank
  const updateFilters = (qbank: QBank) => {
    const hasUnused = qbank.questions.some(q => !q.attempts || q.attempts.length === 0);
    const hasUsed = qbank.questions.some(q => q.attempts && q.attempts.length > 0);
    const hasCorrect = qbank.questions.some(q => {
      const attempts = q.attempts || [];
      return attempts.length > 0 && attempts[attempts.length - 1].isCorrect;
    });
    const hasIncorrect = qbank.questions.some(q => {
      const attempts = q.attempts || [];
      return attempts.length > 0 && !attempts[attempts.length - 1].isCorrect;
    });
    const hasOmitted = qbank.questions.some(q => {
      const attempts = q.attempts || [];
      return attempts.length > 0 && attempts[attempts.length - 1].selectedAnswer === null;
    });
    const hasFlagged = qbank.questions.some(q => q.isFlagged);

    setFilters({
      unused: hasUnused,
      used: hasUsed,
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
            // Toggle the filter
            const newFilters = { ...prev, [key]: !prev[key] };
            
            // If all filters are off, use a default filter
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
              selectedQBank?.id === qbank.id 
                ? "border-primary border-2" 
                : "hover:border-primary/50"
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
