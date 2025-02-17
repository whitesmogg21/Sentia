
import React, { useState, useEffect } from 'react';
import { Question, QBank } from '@/types/quiz';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import QuestionForm from './QuestionForm';
import { Search, Tag, Plus } from 'lucide-react';

interface QuestionLibraryProps {
  questions: Question[];
  qbanks: QBank[];
  onUpdateQuestion: (question: Question) => void;
  onAddQuestion: (question: Question) => void;
}

export const QuestionLibrary = ({
  questions,
  qbanks,
  onUpdateQuestion,
  onAddQuestion,
}: QuestionLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Initialize all existing tags
  useEffect(() => {
    const tags = new Set<string>();
    questions.forEach(q => q.tags.forEach(tag => tags.add(tag)));
    qbanks.forEach(qb => qb.tags.forEach(tag => tags.add(tag)));
    setAllTags(Array.from(tags));
  }, [questions, qbanks]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    if (allTags.includes(newTag.toLowerCase())) {
      toast({
        title: "Tag already exists",
        description: "Would you like to merge or rename this tag?",
        variant: "destructive",
      });
      return;
    }

    setAllTags(prev => [...prev, newTag.toLowerCase()]);
    setNewTag('');
    setShowAddTagDialog(false);
  };

  const handleTagQuestion = (question: Question, tag: string) => {
    const updatedQuestion = {
      ...question,
      tags: [...question.tags, tag],
    };
    onUpdateQuestion(updatedQuestion);

    // Automatically add to QBanks that match all tags
    qbanks.forEach(qbank => {
      if (updatedQuestion.tags.every(tag => qbank.tags.includes(tag))) {
        if (!qbank.questions.some(q => q.id === question.id)) {
          qbank.questions.push(updatedQuestion);
        }
      }
    });
  };

  const removeTagFromQuestion = (question: Question, tagToRemove: string) => {
    const updatedQuestion = {
      ...question,
      tags: question.tags.filter(tag => tag !== tagToRemove),
    };
    onUpdateQuestion(updatedQuestion);

    if (updatedQuestion.tags.length === 0) {
      toast({
        title: "Question Unassigned",
        description: "This question is now unassigned. Add a tag to include it in a QBank.",
      });
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => question.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <QuestionForm
              question={{
                id: Date.now(),
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                tags: [],
              }}
              onSave={onAddQuestion}
              onDelete={() => {}}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {allTags.map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => {
              setSelectedTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              );
            }}
          >
            {tag}
          </Badge>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddTagDialog(true)}
        >
          <Tag className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter tag name..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <Button onClick={handleAddTag}>Add Tag</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            No questions found matching your criteria
          </div>
        ) : (
          filteredQuestions.map(question => (
            <div
              key={question.id}
              className="p-4 border rounded-lg space-y-2"
            >
              <p className="font-medium">{question.question}</p>
              <div className="flex gap-2 flex-wrap">
                {question.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTagFromQuestion(question, tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                {question.tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    This question is currently unassigned. Add a tag to include it in a QBank.
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
