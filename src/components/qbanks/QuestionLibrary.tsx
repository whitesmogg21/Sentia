
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ArrowUpDown, Search, Moon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { QBank } from "@/types/quiz";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc';
};

type Question = {
  id: number;
  question: string;
  tags: string[];
  qbankId: string;
};

const QuestionLibrary = ({ qbanks }: { qbanks: QBank[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const allQuestions = qbanks.flatMap(qbank =>
    qbank.questions.map(question => ({
      ...question,
      qbankId: qbank.id
    }))
  );

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredQuestions = allQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === "" || question.tags.some(tag => 
      tag.toLowerCase().includes(tagFilter.toLowerCase())
    );
    return matchesSearch && matchesTag;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key as keyof Question];
    let bValue = b[sortConfig.key as keyof Question];

    if (sortConfig.key === 'tags') {
      aValue = a.tags.join(', ');
      bValue = b.tags.join(', ');
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = (questionId: number) => {
    // Implement delete functionality
    toast({
      title: "Question deleted",
      description: `Question ${questionId} has been deleted.`,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Question Library</h1>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Question</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              {/* Add Question Form */}
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Input
          placeholder="Filter by tag..."
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="w-[200px]"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('question')}
                  className="hover:bg-transparent"
                >
                  Question Text
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('tags')}
                  className="hover:bg-transparent"
                >
                  Tags
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('qbankId')}
                  className="hover:bg-transparent"
                >
                  Question Bank
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">{question.question}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {question.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {qbanks.find(qbank => qbank.id === question.qbankId)?.name}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {/* Implement edit */}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this question? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(question.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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

