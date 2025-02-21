
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

interface AddWidgetModalProps {
  onAddWidget: (type: string) => void;
}

export const AddWidgetModal = ({ onAddWidget }: AddWidgetModalProps) => {
  // Sample data for previews
  const previewData = {
    accuracy: 85,
    quizHistory: [
      {
        date: new Date().toISOString(),
        questionAttempts: [{ isCorrect: true }, { isCorrect: false }],
      },
    ],
    qbanks: [
      {
        questions: [
          {
            id: '1',
            tags: ['Math', 'Algebra', 'Geometry'],
          },
        ],
      },
    ],
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
