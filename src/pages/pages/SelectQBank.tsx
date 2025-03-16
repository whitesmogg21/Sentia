
import { useState, useMemo, useEffect } from "react";
import { QBank, QuestionFilter } from "@/types/quiz";
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
  const [filters, setFilters] = useState<QuestionFilter>({
    unused: false,
    used: false,
    incorrect: false,
    correct: false,
    flagged: false,
    omitted: false,
  });

  useEffect(() => {
    initializeMetrics();
    
    // Import the sync function and use it to set filters
    import('@/utils/metricsUtils').then(module => {
      const syncedFilters = module.syncFiltersWithLocalStorage();
      setFilters(syncedFilters);
    });
  }, []);
  
  // Filter QBanks based on selected filters
  const filteredQBanks = useMemo(() => {
    if (!Object.values(filters).some(v => v)) return qbanks; // Show all if no filter is active

    // Create an array of active filter keys
    const activeFilters = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);

    // Log what we're filtering by for debugging
    console.log("Filtering by:", activeFilters);

    return qbanks
      .map(qbank => {
        // Get filtered questions for this qbank
        const filteredQuestions = getFilteredQuestions(qbank.questions, activeFilters);
        
        // Log filtered questions count
        console.log(`Found ${filteredQuestions.length} matching questions in ${qbank.name}`);
        
        // If there are no matches, return null
        if (filteredQuestions.length === 0) return null;
        
        // Return a modified qbank with only the filtered questions
        return {
          ...qbank,
          questions: filteredQuestions,
          filteredCount: filteredQuestions.length  // Add this to display count
        };
      })
      .filter(Boolean) as QBank[]; // Remove null entries
  }, [qbanks, filters]);

  const handleQBankClick = (qbank: QBank) => {
    setSelectedQBank(qbank);
  };

  // const handleConfirmSelection = () => {
  //   if (selectedQBank) {
  //     // Since we're filtering questions, we need to preserve the filtered questions
  //     // when selecting a QBank with active filters
  //     const activeFilters = Object.entries(filters)
  //       .filter(([_, isActive]) => isActive)
  //       .map(([key]) => key);
      
  //     // Get the original qbank with all questions
  //     const originalQBank = qbanks.find(q => q.id === selectedQBank.id);
      
  //     if (originalQBank) {
  //       // If filters are active, add the filtered question IDs to localStorage
  //       if (activeFilters.length > 0) {
  //         const filteredIds = selectedQBank.questions.map(q => q.id);
  //         localStorage.setItem("filteredQuestionIds", JSON.stringify(filteredIds));
  //         console.log(`Saved ${filteredIds.length} filtered question IDs`);
  //       } else {
  //         // Clear any previously filtered IDs
  //         localStorage.removeItem("filteredQuestionIds");
  //       }
        
  //       // Save the original QBank with all questions
  //       onSelect(originalQBank);
  //       localStorage.setItem("selectedQBank", JSON.stringify(originalQBank));
        
  //       navigate("/");
  //     }
  //   }
  // };

  const handleConfirmSelection = () => {
    if (selectedQBank) {
      // Since we're filtering questions, we need to preserve the filtered questions
      // when selecting a QBank with active filters
      const activeFilters = Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key);
      
      // Get the original qbank with all questions
      const originalQBank = qbanks.find(q => q.id === selectedQBank.id);
      
      if (originalQBank) {
        // If filters are active, add the filtered question IDs to localStorage
        if (activeFilters.length > 0) {
          const filteredIds = selectedQBank.questions.map(q => q.id);
          localStorage.setItem("filteredQuestionIds", JSON.stringify(filteredIds));
          console.log(`Saved ${filteredIds.length} filtered question IDs`);
          
          // Also create a modified qbank that only contains the filtered questions
          // but preserve the original ID and metadata
          const filteredQBank = {
            ...originalQBank,
            questions: selectedQBank.questions,
            isFiltered: true // Add a flag to indicate this is a filtered qbank
          };
          
          // Save both the original and filtered qbank
          localStorage.setItem("selectedQBank", JSON.stringify(originalQBank));
          localStorage.setItem("filteredQBank", JSON.stringify(filteredQBank));
        } else {
          // Clear any previously filtered IDs
          localStorage.removeItem("filteredQuestionIds");
          localStorage.removeItem("filteredQBank");
          
          // Save the original QBank with all questions
          localStorage.setItem("selectedQBank", JSON.stringify(originalQBank));
        }
        
        // Always send the original QBank to the parent component
        onSelect(originalQBank);
        
        navigate("/");
      }
    }
  };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Select Questions</h1>
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
