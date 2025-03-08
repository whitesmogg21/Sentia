
import { useState, useMemo, useEffect } from "react";
import { QBank, QuestionFilter, Question } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import QuestionFiltersBar from "@/components/QuestionFiltersBar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getFilteredQuestions, initializeMetrics } from "@/utils/metricsUtils";

interface SelectQBankProps {
  qbanks: QBank[];
  onSelect: (qbank: QBank) => void;
}

const SelectQBank = ({ qbanks, onSelect }: SelectQBankProps) => {
  const navigate = useNavigate();
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [processedQBanks, setProcessedQBanks] = useState<QBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<QuestionFilter>({
    unused: false,
    used: false,
    incorrect: false,
    correct: false,
    flagged: false,
    omitted: false,
  });

  // Initialize metrics when component mounts
  useEffect(() => {
    initializeMetrics();
  }, []);

  // Process QBanks to ensure questions are arrays not promises
  useEffect(() => {
    const processQBanks = async () => {
      try {
        setIsLoading(true);
        
        // Create a deep copy and ensure it's properly typed as QBank[]
        const banksToProcess = JSON.parse(JSON.stringify(qbanks)) as QBank[];
        
        // Ensure all questions are arrays
        const processed: QBank[] = banksToProcess.map((qbank: QBank) => ({
          ...qbank,
          questions: Array.isArray(qbank.questions) ? qbank.questions : []
        }));
        
        setProcessedQBanks(processed);
        setIsLoading(false);
      } catch (error) {
        console.error("Error processing question banks:", error);
        setIsLoading(false);
        
        // Fallback to empty arrays if there's an error
        const fallback: QBank[] = qbanks.map(qbank => ({
          ...qbank,
          questions: Array.isArray(qbank.questions) ? qbank.questions : []
        }));
        
        setProcessedQBanks(fallback);
      }
    };

    processQBanks();
  }, [qbanks]);

  // Filter QBanks based on selected filters
  const filteredQBanks = useMemo(() => {
    if (isLoading || !processedQBanks.length) return [];
    
    if (!Object.values(filters).some(v => v)) return processedQBanks; // Show all if no filter is active

    // Create an array of active filter keys
    const activeFilters = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);

    return processedQBanks
      .map(qbank => {
        // Get filtered questions for this qbank
        const filteredQuestions = getFilteredQuestions(qbank.questions, activeFilters);
        
        // If there are no matches, return null
        if (filteredQuestions.length === 0) return null;
        
        // Return a modified qbank with only the filtered questions
        return {
          ...qbank,
          questions: filteredQuestions
        };
      })
      .filter(Boolean) as QBank[]; // Remove null entries
  }, [processedQBanks, filters, isLoading]);

  const handleQBankClick = (qbank: QBank) => {
    setSelectedQBank(qbank);
  };

  const handleConfirmSelection = () => {
    if (selectedQBank) {
      // Since we're filtering questions, we need to make sure we preserve
      // the original qbank structure with all questions when selecting
      const originalQBank = processedQBanks.find(q => q.id === selectedQBank.id);
      if (originalQBank) {
        onSelect(originalQBank);
        localStorage.setItem("selectedQBank", JSON.stringify(originalQBank));
        navigate("/");
        
        toast({
          title: "QBank Selected",
          description: `Selected ${originalQBank.name} for quiz`,
        });
      }
    }
  };

  // Show loading indicator while loading
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Select Question Bank</h1>
        <div className="flex justify-center items-center h-40">
          <p>Loading question banks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Select Question Bank</h1>
      <QuestionFiltersBar
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
        {filteredQBanks.length > 0 ? (
          filteredQBanks.map(qbank => (
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
          ))
        ) : (
          <p>No question banks match the selected filters.</p>
        )}
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
