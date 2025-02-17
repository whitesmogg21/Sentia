import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QBank, Question } from "../types/quiz";
import { Upload } from "lucide-react";
import MediaUploader from "@/components/MediaUploader";
import { QuestionLibrary } from "@/components/qbank/QuestionLibrary";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface QBanksProps {
  qbanks: QBank[];
}

const QBanks = ({ qbanks }: QBanksProps) => {
  const navigate = useNavigate();
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [showFullLibrary, setShowFullLibrary] = useState(false);

  useEffect(() => {
    const questions = new Set<Question>();
    qbanks.forEach(qbank => {
      qbank.questions.forEach(question => {
        questions.add(question);
      });
    });
    setAllQuestions(Array.from(questions));
  }, [qbanks]);

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setAllQuestions(prev =>
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );

    // Update question in QBanks
    qbanks.forEach(qbank => {
      const questionIndex = qbank.questions.findIndex(q => q.id === updatedQuestion.id);
      if (questionIndex !== -1) {
        qbank.questions[questionIndex] = updatedQuestion;
      }
    });

    // Create new QBanks based on tags if they don't exist
    updatedQuestion.tags.forEach(tag => {
      if (!qbanks.some(qbank => qbank.id === tag)) {
        const newQBank: QBank = {
          id: tag,
          name: tag.charAt(0).toUpperCase() + tag.slice(1),
          description: `Questions related to ${tag}`,
          tags: [tag],
          questions: [updatedQuestion]
        };
        qbanks.push(newQBank);
      }
    });
  };

  const handleAddQuestion = (newQuestion: Question) => {
    setAllQuestions(prev => [...prev, newQuestion]);
    
    // Create new QBanks for each tag
    newQuestion.tags.forEach(tag => {
      if (!qbanks.some(qbank => qbank.id === tag)) {
        const newQBank: QBank = {
          id: tag,
          name: tag.charAt(0).toUpperCase() + tag.slice(1),
          description: `Questions related to ${tag}`,
          tags: [tag],
          questions: [newQuestion]
        };
        qbanks.push(newQBank);
      } else {
        const existingQBank = qbanks.find(qbank => qbank.id === tag);
        if (existingQBank) {
          existingQBank.questions.push(newQuestion);
        }
      }
    });

    toast({
      title: "Question Added",
      description: "Question has been added to the library.",
    });
  };

  const handleMediaUpload = (files: File[]) => {
    setMediaFiles(files);
    toast({
      title: "Media Files Ready",
      description: `${files.length} files will be used for the next CSV import`,
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

      // Extract tags from CSV header
      const tags = rows[0].slice(10).map(tag => tag.trim().toLowerCase())
        .filter(tag => tag && tag !== 'Question Image' && tag !== 'Answer Image' && tag !== 'Explanation');

      const questions: Question[] = rows.slice(1).map((row, index) => {
        const options = row.slice(3, 7).filter(opt => opt.trim() !== '');
        const imageFilename = row[7]?.trim();
        const questionTags = tags.filter((_, i) => row[i + 10]?.trim().toLowerCase() === 'yes');
        
        const mediaFile = mediaFiles.find(file => file.name === imageFilename);
        const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : undefined;

        const question: Question = {
          id: Date.now() + index,
          question: row[1],
          options,
          correctAnswer: parseInt(row[2]) - 1,
          tags: questionTags,
          explanation: row[8] || undefined,
          media: imageFilename && mediaUrl ? {
            type: 'image',
            url: mediaUrl,
            showWith: 'question'
          } : undefined
        };

        // Create or update QBanks based on tags
        questionTags.forEach(tag => {
          if (!qbanks.some(qbank => qbank.id === tag)) {
            const newQBank: QBank = {
              id: tag,
              name: tag.charAt(0).toUpperCase() + tag.slice(1),
              description: `Questions related to ${tag}`,
              tags: [tag],
              questions: [question]
            };
            qbanks.push(newQBank);
          } else {
            const existingQBank = qbanks.find(qbank => qbank.id === tag);
            if (existingQBank) {
              existingQBank.questions.push(question);
            }
          }
        });

        return question;
      });

      setAllQuestions(prev => [...prev, ...questions]);
      setMediaFiles([]);
      toast({
        title: "Success",
        description: `Imported ${questions.length} questions with ${tags.length} tags`,
      });
    };
    reader.readAsText(file);
  };

  const QuestionTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Question</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Options</TableHead>
          <TableHead>Correct Answer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allQuestions.map((question) => (
          <TableRow key={question.id}>
            <TableCell>{question.question}</TableCell>
            <TableCell>{question.tags.join(", ")}</TableCell>
            <TableCell>{question.options.join(", ")}</TableCell>
            <TableCell>{question.options[question.correctAnswer]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Banks</h1>
        <div className="flex gap-2">
          <MediaUploader onUploadComplete={handleMediaUpload} />
          <Button asChild>
            <label>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Sheet>
          <SheetTrigger asChild>
            <div className="border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-4">Question Library</h2>
              <QuestionLibrary
                questions={allQuestions}
                qbanks={qbanks}
                onUpdateQuestion={handleUpdateQuestion}
                onAddQuestion={handleAddQuestion}
              />
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90%] sm:w-[80%]">
            <SheetHeader>
              <SheetTitle>Question Library</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
              <QuestionTable />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available Question Banks</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {qbanks.map((qbank) => (
              <div
                key={qbank.id}
                className="p-4 border rounded-lg space-y-2 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold">{qbank.name}</h3>
                <p className="text-sm text-muted-foreground">{qbank.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {qbank.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {qbank.questions.length} questions
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QBanks;
