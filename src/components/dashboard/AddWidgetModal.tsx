
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

interface AddWidgetModalProps {
  onAddWidget: (type: string) => void;
}

export const AddWidgetModal = ({ onAddWidget }: AddWidgetModalProps) => {
  const widgets = [
    {
      id: 'accuracy',
      name: 'Accuracy Circle',
      description: 'Shows overall accuracy as a circular progress indicator'
    },
    {
      id: 'heatmap',
      name: 'Activity Heatmap',
      description: 'Displays quiz activity over time in a calendar view'
    },
    {
      id: 'barChart',
      name: 'Performance Bar Chart',
      description: 'Compares performance across different categories'
    },
    {
      id: 'spiderChart',
      name: 'Topic Coverage',
      description: 'Visualizes performance across different topics in a radar chart'
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Performance Widget</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                onAddWidget(widget.id);
                const closeButton = document.querySelector('[aria-label="Close"]');
                if (closeButton instanceof HTMLButtonElement) {
                  closeButton.click();
                }
              }}
            >
              <h3 className="font-semibold mb-2">{widget.name}</h3>
              <p className="text-sm text-muted-foreground">{widget.description}</p>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
