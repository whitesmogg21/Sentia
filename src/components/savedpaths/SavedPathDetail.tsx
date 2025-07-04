import { useState, useMemo } from "react";
import { SavedPath } from "@/types/savedPath";
import { QBank, Question, QuestionFilter } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Play, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  Circle,
  Flag
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface SavedPathDetailProps {
  savedPath: SavedPath;
  qbanks: QBank[];
  onBack: () => void;
  onStartQuiz: (questionIds: number[]) => void;
}

export const SavedPathDetail = ({
  savedPath,
  qbanks,
  onBack,
  onStartQuiz
}: SavedPathDetailProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QuestionFilter>({
    unused: false,
    used: false,
    correct: false,
    incorrect: false,
    flagged: false,
    omitted: false,
  });

  // Get all questions for this saved path
  const pathQuestions = useMemo(() => {
    const questions: Question[] = [];
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        if (savedPath.questionIds.includes(question.id)) {
          questions.push(question);
        }
      });
    });
    return questions;
  }, [qbanks, savedPath.questionIds]);

  // Filter questions based on search term and filters
  const filteredQuestions = useMemo(() => {
    let filtered = pathQuestions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filters
    if (Object.values(filters).some(v => v)) {
      filtered = filtered.filter(question => {
        const hasBeenAttempted = question.attempts && question.attempts.length > 0;
        const lastAttempt = hasBeenAttempted ? question.attempts[question.attempts.length - 1] : null;

        return (
          (filters.unused && !hasBeenAttempted) ||
          (filters.used && hasBeenAttempted) ||
          (filters.correct && lastAttempt?.isCorrect) ||
          (filters.incorrect && lastAttempt && !lastAttempt.isCorrect) ||
          (filters.flagged && question.isFlagged) ||
          (filters.omitted && lastAttempt?.selectedAnswer === null)
        );
      });
    }

    return filtered;
  }, [pathQuestions, searchTerm, filters]);

  const handleFilterChange = (key: keyof QuestionFilter) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getQuestionStatus = (question: Question) => {
    const hasBeenAttempted = question.attempts && question.attempts.length > 0;
    if (!hasBeenAttempted) return 'unused';
    
    const lastAttempt = question.attempts[question.attempts.length - 1];
    if (lastAttempt.selectedAnswer === null) return 'omitted';
    return lastAttempt.isCorrect ? 'correct' : 'incorrect';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'omitted':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{savedPath.name}</h2>
            <p className="text-muted-foreground">{savedPath.description}</p>
          </div>
        </div>
        <Button 
          onClick={() => onStartQuiz(filteredQuestions.map(q => q.id))}
          disabled={filteredQuestions.length === 0}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Quiz ({filteredQuestions.length})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-3">
              <h4 className="font-medium">Filter by Status</h4>
              {Object.entries({
                unused: "Unused",
                used: "Used",
                correct: "Correct",
                incorrect: "Incorrect",
                flagged: "Flagged",
                omitted: "Omitted"
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={filters[key as keyof QuestionFilter]}
                    onCheckedChange={() => handleFilterChange(key as keyof QuestionFilter)}
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">Total Questions</div>
          <div className="text-2xl font-bold">{pathQuestions.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">Filtered</div>
          <div className="text-2xl font-bold">{filteredQuestions.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">Attempted</div>
          <div className="text-2xl font-bold">
            {pathQuestions.filter(q => q.attempts && q.attempts.length > 0).length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-2xl font-bold">
            {(() => {
              const attempted = pathQuestions.filter(q => q.attempts && q.attempts.length > 0);
              const correct = attempted.filter(q => 
                q.attempts[q.attempts.length - 1]?.isCorrect
              );
              return attempted.length > 0 ? Math.round((correct.length / attempted.length) * 100) : 0;
            })()}%
          </div>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No questions match your current filters
          </div>
        ) : (
          filteredQuestions.map((question, index) => {
            const status = getQuestionStatus(question);
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">Q{index + 1}</span>
                        {question.isFlagged && (
                          <Flag className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      
                      <p className="text-sm line-clamp-2 mb-3">
                        {question.question}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {question.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};