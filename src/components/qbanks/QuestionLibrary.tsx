import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash, Upload, Tag, Edit, Check, X } from "lucide-react";
import { Question, QBank } from "@/types/quiz";
import { toast } from "@/components/ui/use-toast";
import MediaSelector from "./MediaSelector";

interface QuestionLibraryProps {
  qbanks: QBank[];
}

interface QuestionWithTags extends Question {
  tags: string[];
}

const QuestionLibrary = ({ qbanks }: QuestionLibraryProps) => {
  const [selectedQBank, setSelectedQBank] = useState<QBank | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    tags: ['default', 'practice'],
    media: {
      type: "image",
      url: "",
      showWith: "question"
    }
  });
  const [questions, setQuestions] = useState<QuestionWithTags[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithTags | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleMediaChange = (field: 'type' | 'showWith' | 'url', value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      media: {
        ...prev.media!,
        [field]: value
      }
    }));
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
    
    const question: QuestionWithTags = {
      id: Date.now(),
      question: newQuestion.question,
      options: newQuestion.options!,
      correctAnswer: newQuestion.correctAnswer!,
      qbankId: 'library',
      tags: newQuestion.tags || ['default', 'practice'],
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

    setQuestions(prev => [...prev, question]);
    setIsOpen(false);
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      tags: ['default', 'practice'],
      media: {
        type: "image",
        url: "",
        showWith: "question"
      }
    });

    toast({
      title: "Success",
      description: "Question created successfully"
    });
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => 
        row.split(',').map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'))
      );

      // Skip header row
      const newQuestions: QuestionWithTags[] = rows.slice(1).map((row, index) => {
        const options = row.slice(3, 10).filter(opt => opt.trim() !== '');
        const tags = row[11]?.split(';').filter(tag => tag.trim()) || [];
        
        return {
          id: Date.now() + index,
          question: row[1],
          options,
          correctAnswer: parseInt(row[2]) - 1,
          qbankId: 'library',
          tags,
          explanation: row[12] || undefined,
        };
      });

      setQuestions(prev => [...prev, ...newQuestions]);
      toast({
        title: "Success",
        description: "Questions imported successfully",
      });
    };
    reader.readAsText(file);
  };

  const handleEditQuestion = (question: QuestionWithTags) => {
    setEditingQuestion(question);
    setIsOpen(true);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => q.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(
    questions.flatMap(q => q.tags)
  ));

  const handleTagInput = (input: string) => {
    setTagInput(input);
    if (input.endsWith(';')) {
      const newTag = input.slice(0, -1).trim();
      if (newTag) {
        if (editingQuestion) {
          setEditingQuestion(prev => prev ? {
            ...prev,
            tags: [...prev.tags, newTag]
          } : null);
        } else {
          setNewTags(prev => [...prev, newTag]);
        }
      }
      setTagInput("");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Library</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => document.getElementById('csvInput')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <input
            id="csvInput"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Edit Question' : 'Create New Question'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter question text"
                    value={editingQuestion ? editingQuestion.question : newQuestion.question}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null);
                      } else {
                        setNewQuestion(prev => ({ ...prev, question: e.target.value }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {(editingQuestion ? editingQuestion.options : newQuestion.options).map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          if (editingQuestion) {
                            const newOptions = [...editingQuestion.options];
                            newOptions[index] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          } else {
                            handleOptionChange(index, e.target.value);
                          }
                        }}
                      />
                      <Button
                        variant={index === (editingQuestion?.correctAnswer || newQuestion.correctAnswer) ? "default" : "outline"}
                        size="icon"
                        onClick={() => {
                          if (editingQuestion) {
                            setEditingQuestion({ ...editingQuestion, correctAnswer: index });
                          } else {
                            setNewQuestion(prev => ({ ...prev, correctAnswer: index }));
                          }
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (editingQuestion) {
                            const newOptions = [...editingQuestion.options];
                            newOptions[index] = "";
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          } else {
                            handleOptionChange(index, "");
                          }
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Type tag and press semicolon to add"
                      value={tagInput}
                      onChange={(e) => handleTagInput(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(editingQuestion ? editingQuestion.tags : newTags).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                        >
                          {tag}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => {
                              if (editingQuestion) {
                                setEditingQuestion(prev => prev ? {
                                  ...prev,
                                  tags: prev.tags.filter((_, i) => i !== index)
                                } : null);
                              } else {
                                setNewTags(prev => prev.filter((_, i) => i !== index));
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Media</Label>
                  <div className="flex gap-4 items-center">
                    <MediaSelector
                      onSelect={(media) => {
                        setEditingQuestion(prev => prev ? {
                          ...prev,
                          media: {
                            ...media,
                            showWith: prev.media?.showWith || 'question'
                          }
                        } : null);
                      }}
                    />
                    {editingQuestion?.media?.url && (
                      <div className="flex-1">
                        {editingQuestion.media.type === 'image' ? (
                          <img
                            src={editingQuestion.media.url}
                            alt=""
                            className="max-h-32 object-contain"
                          />
                        ) : (
                          <div className="p-2 bg-gray-100 rounded">
                            {editingQuestion.media.type} media selected
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuestion(prev => prev ? {
                            ...prev,
                            media: undefined
                          } : null)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    placeholder="Enter explanation"
                    value={editingQuestion ? editingQuestion.explanation || "" : newQuestion.explanation}
                    onChange={(e) => {
                      if (editingQuestion) {
                        setEditingQuestion(prev => prev ? {
                          ...prev,
                          explanation: e.target.value
                        } : null);
                      } else {
                        setNewQuestion(prev => ({
                          ...prev,
                          explanation: e.target.value
                        }));
                      }
                    }}
                  />
                </div>

                <Button onClick={handleSubmit}>
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
              size="sm"
            >
              <Tag className="w-4 h-4 mr-2" />
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((question, index) => (
          <div key={question.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <h3 className="font-bold">Question {index + 1}</h3>
              <Button variant="ghost" size="icon" onClick={() => handleEditQuestion(question)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-2">{question.question}</p>
            <div className="mt-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className={`p-2 ${optIndex === question.correctAnswer ? 'text-green-600' : ''}`}>
                  {option}
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {question.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionLibrary; 