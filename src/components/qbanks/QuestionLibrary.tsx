import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Tag, Check, X, ArrowUpDown, Upload, Edit } from "lucide-react";
import { Question, QBank } from "@/types/quiz";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MediaSelector from "./MediaSelector";
import Papa from 'papaparse';

interface QuestionLibraryProps {
  qbanks: QBank[];
}

type SortConfig = {
  key: keyof Question | 'correctAnswerText' | null;
  direction: 'asc' | 'desc';
};

const QuestionLibrary = ({ qbanks }: QuestionLibraryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    tags: [],
    media: {
      type: "image",
      url: "",
      showWith: "question"
    }
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const existingTags = Array.from(new Set(
    qbanks.flatMap(qbank => qbank.questions.flatMap(q => q.tags))
  ));

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !selectedTags.includes(normalizedTag)) {
      setSelectedTags([...selectedTags, normalizedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!newQuestion.question || newQuestion.options?.some(opt => !opt)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (selectedTags.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one tag",
        variant: "destructive"
      });
      return;
    }

    const question: Question = {
      id: Date.now(),
      question: newQuestion.question!,
      options: newQuestion.options!,
      correctAnswer: newQuestion.correctAnswer!,
      qbankId: selectedTags[0],
      tags: selectedTags,
      attempts: []
    };

    if (newQuestion.explanation?.trim()) {
      question.explanation = newQuestion.explanation;
    }

    if (newQuestion.media?.type && newQuestion.media.url) {
      question.media = {
        type: newQuestion.media.type as 'image' | 'audio' | 'video',
        url: newQuestion.media.url,
        showWith: newQuestion.media.showWith as 'question' | 'answer'
      };
    }

    selectedTags.forEach(tag => {
      let qbank = qbanks.find(qb => qb.id === tag);
      
      if (!qbank) {
        qbank = {
          id: tag,
          name: tag.charAt(0).toUpperCase() + tag.slice(1),
          description: `Questions tagged with ${tag}`,
          questions: []
        };
        qbanks.push(qbank);
      }
      
      qbank.questions.push({ ...question });
    });

    setIsOpen(false);
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      tags: [],
      media: {
        type: "image",
        url: "",
        showWith: "question"
      }
    });
    setSelectedTags([]);

    toast({
      title: "Success",
      description: `Question added to ${selectedTags.length} question bank(s)`,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion(question);
    setSelectedTags(question.tags);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleUpdate = () => {
    if (!editingQuestion) return;

    qbanks.forEach(qbank => {
      const questionIndex = qbank.questions.findIndex(q => q.id === editingQuestion.id);
      if (questionIndex !== -1) {
        qbank.questions[questionIndex] = {
          ...editingQuestion,
          ...newQuestion,
          tags: selectedTags,
          qbankId: selectedTags[0]
        } as Question;
      }
    });

    setIsOpen(false);
    setIsEditMode(false);
    setEditingQuestion(null);
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      tags: [],
      media: { type: "image", url: "", showWith: "question" }
    });
    setSelectedTags([]);

    toast({
      title: "Success",
      description: "Question updated successfully",
    });
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive"
          });
          return;
        }

        try {
          const questions = results.data.slice(1).map((row: string[]) => {
            if (!Array.isArray(row) || row.length < 5) {
              throw new Error("Invalid row format");
            }

            const question = row[0];
            const correctAnswer = row[1];
            const otherChoices = row[2] || "";
            const tags = row[3] || "";
            const explanation = row[4] || "";

            if (!question || !correctAnswer) {
              throw new Error("Question and correct answer are required");
            }

            const options = [correctAnswer, ...otherChoices.split(';').filter(Boolean)];
            const questionTags = tags.split(';')
              .map(tag => tag.trim())
              .filter(Boolean);

            if (questionTags.length === 0) {
              questionTags.push('general');
            }

            const newQuestion: Question = {
              id: Date.now() + Math.random(),
              question,
              options,
              correctAnswer: 0,
              qbankId: questionTags[0],
              tags: questionTags,
              explanation,
              attempts: []
            };

            questionTags.forEach(tag => {
              let qbank = qbanks.find(qb => qb.id === tag);
              if (!qbank) {
                qbank = {
                  id: tag,
                  name: tag.charAt(0).toUpperCase() + tag.slice(1),
                  description: `Questions tagged with ${tag}`,
                  questions: []
                };
                qbanks.push(qbank);
              }
              qbank.questions.push({ ...newQuestion });
            });

            return newQuestion;
          });

          toast({
            title: "Success",
            description: `${questions.length} questions imported successfully`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to import questions",
            variant: "destructive"
          });
        }
      },
      error: (error) => {
        toast({
          title: "Error",
          description: "Failed to read CSV file",
          variant: "destructive"
        });
      }
    });

    event.target.value = '';
  };

  const filteredQuestions = qbanks.flatMap(qbank => 
    qbank.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = sortConfig.key === 'correctAnswerText' 
      ? a.options[a.correctAnswer]
      : a[sortConfig.key];
    let bValue = sortConfig.key === 'correctAnswerText'
      ? b.options[b.correctAnswer]
      : b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return 0;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Library</h1>
        <div className="flex gap-2">
          <Input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </span>
            </Button>
          </label>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Question" : "Create New Question"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter question text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {newQuestion.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      <Button
                        variant={index === newQuestion.correctAnswer ? "default" : "outline"}
                        size="icon"
                        onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleAddTag(tagInput)}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  {existingTags.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-sm text-gray-500">Existing tags:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {existingTags.map(tag => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTag(tag)}
                            className="text-xs"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    placeholder="Enter explanation"
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion(prev => ({
                      ...prev,
                      explanation: e.target.value
                    }))}
                  />
                </div>

                <Button onClick={isEditMode ? handleUpdate : handleSubmit}>
                  {isEditMode ? "Update Question" : "Create Question"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search questions by text or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('question')}>
                Question
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('correctAnswerText')}>
                Correct Answer
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Other Choices</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Explanation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">{question.question}</TableCell>
                <TableCell>{question.options[question.correctAnswer]}</TableCell>
                <TableCell>
                  {question.options
                    .filter((_, index) => index !== question.correctAnswer)
                    .join('; ')}
                </TableCell>
                <TableCell>{question.tags.join('; ')}</TableCell>
                <TableCell>{question.explanation || '-'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuestionLibrary;
