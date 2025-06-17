import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Tag, Check, X, ArrowUpDown, Upload, Edit, Trash2, Filter, Sun, Moon, Download, Maximize, Minimize } from "lucide-react";
import { Question, QBank } from "@/types/quiz";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveQBanksToStorage } from "@/data/questions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MediaSelector from "./MediaSelector";
import { updateQuestionMetrics, initializeMetrics, removeQuestionMetrics } from "@/utils/metricsUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFullscreen } from "@/hooks/use-fullscreen";
import Pagination from "@/components/Pagintion";
import { renderMarkdown } from "@/utils/markdownUtils";
import { CSSTransition } from 'react-transition-group';

interface QuestionLibraryProps {
  qbanks: QBank[];
}

type SortConfig = {
  key: 'question' | 'correctAnswerText' | 'tags' | null;
  direction: 'asc' | 'desc';
};

// Helper for surroundable markdown
function insertMarkdown(textareaId: string, syntax: string, surround: boolean) {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  let value = textarea.value;
  let newValue, cursorPos;
  if (surround) {
    if (start !== end) {
      // Wrap selected text
      newValue = value.slice(0, start) + syntax + value.slice(start, end) + syntax + value.slice(end);
      cursorPos = end + syntax.length * 2;
    } else {
      // Insert syntax and place cursor in the middle
      newValue = value.slice(0, start) + syntax + syntax + value.slice(end);
      cursorPos = start + syntax.length;
    }
  } else {
    newValue = value.slice(0, start) + syntax + value.slice(end);
    cursorPos = start + syntax.length;
  }
  textarea.value = newValue;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = cursorPos;
  return newValue;
}

const MarkdownToolbar = ({ textareaId, onChange }: { textareaId: string, onChange: (value: string) => void }) => (
  <div className="flex gap-2 mb-2">
    <Button type="button" size="sm" variant="outline" onClick={() => onChange(insertMarkdown(textareaId, '**', true) || '')} title="Bold"><b>B</b></Button>
    <Button type="button" size="sm" variant="outline" onClick={() => onChange(insertMarkdown(textareaId, '*', true) || '')} title="Italic"><i>I</i></Button>
    <Button type="button" size="sm" variant="outline" onClick={() => onChange(insertMarkdown(textareaId, '~~', true) || '')} title="Strikethrough"><s>S</s></Button>
    <Button type="button" size="sm" variant="outline" onClick={() => onChange(insertMarkdown(textareaId, '`', true) || '')} title="Code">&lt;/&gt;</Button>
    <Button type="button" size="sm" variant="outline" onClick={() => onChange(insertMarkdown(textareaId, '[text](url)', false) || '')} title="Link">🔗</Button>
    <Button type="button" size="sm" variant="outline" onClick={() => onChange(insertMarkdown(textareaId, '- list item', false) || '')} title="List">• List</Button>
    <Button type="button" size="sm" variant="outline" onClick={() => onChange(insertMarkdown(textareaId, '# Heading', false) || '')} title="Heading">H</Button>
  </div>
);

const QuestionLibrary = ({ qbanks }: QuestionLibraryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const { theme, setTheme } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
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
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showTagFilterModal, setShowTagFilterModal] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Use local state for qbanks


  const filteredQuestions = useMemo(() => qbanks.flatMap(qbank =>
    qbank.questions.filter(q => {
      if (selectedFilterTags.length > 0 && !q.tags.some(tag => selectedFilterTags.includes(tag))) {
        return false;
      }

      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(searchTerm) ||
          q.options.some(option => option.toLowerCase().includes(searchTerm)) ||
          (q.explanation && q.explanation.toLowerCase().includes(searchTerm)) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    })
  ), [qbanks, selectedFilterTags, searchQuery, forceUpdate]);

  const sortedQuestions = useMemo(() => [...filteredQuestions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'tags') {
      const aTags = a.tags.join(', ');
      const bTags = b.tags.join(', ');
      return sortConfig.direction === 'asc'
        ? aTags.localeCompare(bTags)
        : bTags.localeCompare(aTags);
    }

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
  }), [filteredQuestions, sortConfig, forceUpdate]);

  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 10;
  const totalPages = Math.ceil(sortedQuestions.length / QUESTIONS_PER_PAGE);
  const paginatedQuestions = useMemo(() => sortedQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  ), [sortedQuestions, currentPage, forceUpdate]);

  useEffect(() => {
    initializeMetrics();
  }, []);

  const existingTags = useMemo(() => Array.from(new Set(
    qbanks.flatMap(qbank => qbank.questions.flatMap(q => q.tags || []))
  )), [qbanks, forceUpdate]);

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

    saveQBanksToStorage();

    updateQuestionMetrics(question.id, 'unused', false);

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

    setForceUpdate(f => f + 1);
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

    saveQBanksToStorage();

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

    setForceUpdate(f => f + 1);
  };


  const checkForDuplicates = (questionText: string, tags: string[]): { isDuplicate: boolean, existingQBanks: string[] } => {
    const normalizedQuestion = questionText.trim().toLowerCase();
    const existingQBanks: string[] = [];
    
    // Check across all qbanks
    const isDuplicate = qbanks.some(qbank => {
      const hasDuplicate = qbank.questions.some(
        q => q.question.trim().toLowerCase() === normalizedQuestion
      );
      if (hasDuplicate) return true;
      
      // Track which tags already have qbanks
      if (tags.includes(qbank.id)) {
        existingQBanks.push(qbank.id);
      }
      return false;
    });
  
    return { isDuplicate, existingQBanks };
  };
  
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

        const questions = rows.slice(1)
          .filter(row => row && row.length >= 2)
          .map((row: any) => {
            const [question, correctAnswer, otherChoices, category, explanation] = row;

            // Modified tag handling to support semicolon-separated tags
            let tags: string[] = ['general'];
            if (category?.toString().trim()) {
              // Split by semicolons, convert to lowercase, trim whitespace, and filter out empty tags
              tags = category.toString()
                .split(';')
                .map(tag => tag.toLowerCase().trim())
                .filter(Boolean);

              // If after filtering we have no valid tags, use 'general'
              if (tags.length === 0) {
                tags = ['general'];
              }
            }

            const questionText = question.toString().trim();
            const explanationText = explanation?.toString().trim() || undefined;

            const options = [
              correctAnswer.toString().trim(),
              ...(otherChoices?.toString().split(/[;,]/).map(s => s.trim()) || [])
            ].filter(Boolean);

            const mediaMatch = questionText.match(/\/([^\/\s]+\.(png|jpg|jpeg|gif))/i);
            const media = mediaMatch ? {
              type: "image" as const,
              url: mediaMatch[1],
              showWith: "question" as const
            } : undefined;

            const newQuestion: Question = {
              id: Date.now() + Math.random(),
              question: questionText,
              options,
              correctAnswer: 0,
              qbankId: tags[0],
              tags,
              explanation: explanationText,
              media,
              attempts: []
            };

            // Add the question to all relevant qbanks based on tags
            tags.forEach(tag => {
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

        saveQBanksToStorage();
        console.log('Imported questions and saved qbanks:', qbanks.length);

        toast({
          title: "Success",
          description: `${questions.length} questions imported successfully`,
        });

        setForceUpdate(f => f + 1);
      } catch (error) {
        console.error('Excel import error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to import questions",
          variant: "destructive"
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read Excel file",
        variant: "destructive"
      });
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };


  const handleSelectAllVisible = () => {
    if (selectedQuestions.length === sortedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(sortedQuestions);
    }
  };

  const handleDeleteSelected = () => {
    setShowDeleteDialog(true);
  };

  // Helper to remove qbanks (tags) with no questions
  function removeEmptyQBanks() {
    for (let i = qbanks.length - 1; i >= 0; i--) {
      if (qbanks[i].questions.length === 0) {
        qbanks.splice(i, 1);
      }
    }
  }

  const confirmDeleteSelected = () => {
    if (selectedQuestions.length === 0) return;

    const questionIds = selectedQuestions.map(q => q.id);

    qbanks.forEach(qbank => {
      qbank.questions = qbank.questions.filter(q => !questionIds.includes(q.id));
    });

    // Remove metrics for deleted questions
    questionIds.forEach(id => removeQuestionMetrics(id));

    removeEmptyQBanks(); // Remove tags/qbanks with no questions

    saveQBanksToStorage();

    initializeMetrics();

    setSelectedQuestions([]);
    setShowDeleteDialog(false);

    toast({
      title: "Success",
      description: `${questionIds.length} questions deleted successfully`,
    });

    setForceUpdate(f => f + 1);
  };

  const handleDeleteQuestion = (questionId: number) => {
    qbanks.forEach(qbank => {
      const index = qbank.questions.findIndex(q => q.id === questionId);
      if (index !== -1) {
        qbank.questions.splice(index, 1);
      }
    });

    // Remove metrics for deleted question
    removeQuestionMetrics(questionId);

    removeEmptyQBanks(); // Remove tags/qbanks with no questions

    saveQBanksToStorage();

    initializeMetrics();

    toast({
      title: "Success",
      description: "Question deleted successfully",
    });

    setForceUpdate(f => f + 1);
  };

  const handleExport = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select questions to export",
        variant: "destructive"
      });
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      const exportData = selectedQuestions.map(q => [
        q.question,
        q.options[q.correctAnswer],
        q.options.filter((_, i) => i !== q.correctAnswer).join(';'),
        q.tags.join(';'),
        q.explanation || '',
        q.media?.url ? `/${q.media.url}` : ''
      ]);

      const ws = XLSX.utils.aoa_to_sheet([
        ['Question', 'Correct Answer', 'Other Options', 'Tags', 'Explanation', 'Media'],
        ...exportData
      ]);

      XLSX.utils.book_append_sheet(wb, ws, 'Questions');

      const zip = new JSZip();
      const excelBuffer = XLSX.write(wb, { type: 'array' });
      zip.file('questions.xlsx', excelBuffer);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'questions_export.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Exported ${selectedQuestions.length} questions successfully`,
      });

      setSelectedQuestions([]);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export questions",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Library</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTagFilterModal(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter by Tags
            {selectedFilterTags.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {selectedFilterTags.length}
              </span>
            )}
          </Button>

          <label className="flex items-center gap-2">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
              id="excel-upload"
            />
            <Button variant="outline" asChild>
              <label htmlFor="excel-upload" className="cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Excel
              </label>
            </Button>
          </label>

          {selectedQuestions.length > 0 && (
            <>
              <Button onClick={handleExport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Selected ({selectedQuestions.length})
              </Button>

              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedQuestions.length})
              </Button>
            </>
          )}

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
                  <MarkdownToolbar textareaId="question-textarea" onChange={val => setNewQuestion(prev => ({ ...prev, question: val }))} />
                  <Textarea
                    id="question-textarea"
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
                  <MarkdownToolbar textareaId="explanation-textarea" onChange={val => setNewQuestion(prev => ({ ...prev, explanation: val }))} />
                  <Textarea
                    id="explanation-textarea"
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="rounded-full"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Questions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedQuestions.length} question{selectedQuestions.length > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDeleteSelected}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTagFilterModal} onOpenChange={setShowTagFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search tags..."
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
            />
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {existingTags
                .filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                .map(tag => (
                  <Button
                    key={tag}
                    variant={selectedFilterTags.includes(tag) ? "default" : "outline"}
                    className="mr-2 mb-2"
                    onClick={() => {
                      setSelectedFilterTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    {tag}
                    {selectedFilterTags.includes(tag) && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <Input
          placeholder="Search questions, answers, tags or explanations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSelectAllVisible}
                  className="h-4 w-4"
                  disabled={sortedQuestions.length === 0}
                >
                  {selectedQuestions.length === sortedQuestions.length && sortedQuestions.length > 0 ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <div className="h-4 w-4 rounded border border-gray-400" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('question')}>
                Question
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('correctAnswerText')}>
                Correct Answer
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Other Choices</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('tags')}>
                Tags
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Explanation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuestions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400 animate-fade-in transition-opacity duration-500">
                  <span className="inline-block text-lg">No questions found</span>
                </td>
              </tr>
            ) : (
              paginatedQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.some(q => q.id === question.id)}
                      onChange={() => {
                        setSelectedQuestions(prev =>
                          prev.some(q => q.id === question.id)
                            ? prev.filter(q => q.id !== question.id)
                            : [...prev, question]
                        );
                      }}
                      className="w-4 h-4"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="prose prose-sm dark:prose-invert">
                      {renderMarkdown(question.question)}
                    </div>
                  </TableCell>
                  <TableCell>{question.options[question.correctAnswer]}</TableCell>
                  <TableCell>
                    {question.options
                      .filter((_, index) => index !== question.correctAnswer)
                      .join('; ')}
                  </TableCell>
                  <TableCell>{question.tags.join('; ')}</TableCell>
                  <TableCell>{question.explanation || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {sortedQuestions.length > QUESTIONS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default QuestionLibrary;
