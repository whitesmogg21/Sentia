import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QBank, QuestionFilter } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFilteredQuestions, initializeMetrics, syncFiltersWithLocalStorage } from "@/utils/metricsUtils";
import QuestionFiltersBar from "@/components/QuestionFiltersBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectQBankProps {
  qbanks: QBank[];
  onSelect: (qbank: QBank) => void;
}

const SelectQBank = ({ qbanks, onSelect }: SelectQBankProps) => {
  const navigate = useNavigate();
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [dropdownQbank, setDropdownQbank] = useState('');
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
    const syncedFilters = syncFiltersWithLocalStorage();
    setFilters(syncedFilters);
  }, []);

  const handleToggleFilter = useCallback((key: keyof QuestionFilter) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      const isAnyFilterActive = Object.values(updated).some(v => v);
      return isAnyFilterActive
        ? updated
        : {
            unused: false,
            used: false,
            incorrect: false,
            correct: false,
            flagged: false,
            omitted: false,
          };
    });
  }, []);

  const filterObjectsById = (objects: QBank[], id: string): QBank[] => {
    if (!id || id === "all") return objects;
    const match = objects.find(obj => obj.id === id);
    return match ? [match] : [];
  };

  const filteredQBanks = useMemo(() => {
    const activeFilters = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);

    const baseQbanks = filterObjectsById(qbanks, dropdownQbank);

    if (!activeFilters.length) return baseQbanks;

    return baseQbanks
      .map(qbank => {
        const filteredQuestions = getFilteredQuestions(qbank.questions, activeFilters);
        if (!filteredQuestions.length) return null;

        return {
          ...qbank,
          questions: filteredQuestions,
          filteredCount: filteredQuestions.length,
        };
      })
      .filter(Boolean) as QBank[];
  }, [qbanks, filters, dropdownQbank]);

  const handleQBankClick = (qbank: QBank) => setSelectedQBank(qbank);

  const handleConfirmSelection = () => {
    if (!selectedQBank) return;

    const activeFilters = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);

    const originalQBank = qbanks.find(q => q.id === selectedQBank.id);

    if (!originalQBank) return;

    if (activeFilters.length > 0) {
      const filteredIds = selectedQBank.questions.map(q => q.id);
      localStorage.setItem("filteredQuestionIds", JSON.stringify(filteredIds));

      const filteredQBank = {
        ...originalQBank,
        questions: selectedQBank.questions,
        isFiltered: true,
      };

      localStorage.setItem("selectedQBank", JSON.stringify(originalQBank));
      localStorage.setItem("filteredQBank", JSON.stringify(filteredQBank));
    } else {
      localStorage.removeItem("filteredQuestionIds");
      localStorage.removeItem("filteredQBank");
      localStorage.setItem("selectedQBank", JSON.stringify(originalQBank));
    }

    onSelect(selectedQBank);
    navigate("/");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Select Questions</h1>

      <div className="flex justify-between">
        <QuestionFiltersBar
          filters={filters}
          onToggleFilter={handleToggleFilter}
          questions={
            selectedQBank
              ? selectedQBank.questions
              : 
              filteredQBanks.flatMap(qb => qb.questions)
          }
        />

        {/* <Select value={dropdownQbank} onValueChange={setDropdownQbank}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Q-Bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {qbanks.map(qbank => (
              <SelectItem key={qbank.id} value={qbank.id}>
                {qbank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>

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
