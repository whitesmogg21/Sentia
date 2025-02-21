
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import CircularProgress from "@/components/CircularProgress";
import { CalendarHeatmap } from "@/components/charts/CalendarHeatmap";
import { TagPerformanceBarChart } from "@/components/charts/TagPerformanceBarChart";
import { TagPerformanceChart } from "@/components/TagPerformanceChart";
import { QuizHistory, QBank, Question } from "@/types/quiz";

interface AddWidgetModalProps {
  onAddWidget: (type: string) => void;
}

export const AddWidgetModal = ({ onAddWidget }: AddWidgetModalProps) => {
  // Sample data for previews with correct types
  const previewData = {
    accuracy: 85,
    quizHistory: [{
      id: '1',
      date: new Date().toISOString(),
      score: 80,
      totalQuestions: 10,
      qbankId: '1',
      questionAttempts: [{
        questionId: 1,
        selectedAnswer: 1,
        isCorrect: true,
        isFlagged: false,
        tags: ['Math']
      }],
    }] as QuizHistory[],
    qbanks: [{
      id: '1',
      name: 'Sample QBank',
      description: 'A sample question bank',
      questions: [
        {
          id: 1,
          question: 'Sample question',
          options: ['Option 1', 'Option 2'],
          correctAnswer: 1,
          qbankId: '1',
          tags: ['Math', 'Algebra', 'Geometry'],
        },
      ] as Question[],
    }] as QBank[],
    metrics: {},
    tagPerformance: [],
  };

  const widgets = [
    {
      id: 'accuracy',
      name: 'Accuracy Circle',
      description: 'Shows overall accuracy as a circular progress indicator',
      preview: <CircularProgress percentage={previewData.accuracy} size="small" />,
    },
    {
      id: 'heatmap',
      name: 'Activity Heatmap',
      description: 'Displays quiz activity over time in a calendar view',
      preview: <CalendarHeatmap data={previewData.quizHistory} />,
    },
    {
      id: 'barChart',
      name: 'Performance Bar Chart',
      description: 'Compares performance across different categories',
      preview: <TagPerformanceBarChart qbanks={previewData.qbanks} quizHistory={previewData.quizHistory} />,
    },
    {
      id: 'spiderChart',
      name: 'Topic Coverage',
      description: 'Visualizes performance across different topics in a radar chart',
      preview: <TagPerformanceChart qbanks={previewData.qbanks} quizHistory={previewData.quizHistory} />,
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Performance Widget</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className="p-6 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                onAddWidget(widget.id);
                const closeButton = document.querySelector('[aria-label="Close"]');
                if (closeButton instanceof HTMLButtonElement) {
                  closeButton.click();
                }
              }}
            >
              <h3 className="font-semibold mb-3">{widget.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{widget.description}</p>
              <div className="aspect-[4/3] flex items-center justify-center bg-background rounded-lg p-4">
                {widget.preview}
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
