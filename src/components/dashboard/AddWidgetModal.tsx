
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import CircularProgress from "@/components/CircularProgress";
import { CalendarHeatmap } from "@/components/charts/CalendarHeatmap";
import { TagPerformanceBarChart } from "@/components/charts/TagPerformanceBarChart";
import { TagPerformanceChart } from "@/components/TagPerformanceChart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AddWidgetModalProps {
  onAddWidget: (type: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddWidgetModal = ({ onAddWidget, isOpen, onOpenChange }: AddWidgetModalProps) => {
  const widgets = [
    {
      id: 'accuracy',
      name: 'Overall Accuracy',
      description: 'Shows overall accuracy as a circular progress indicator',
      preview: <CircularProgress percentage={85} size="small" />,
    },
    {
      id: 'heatmap',
      name: 'Activity Heatmap',
      description: 'Displays quiz activity over time in a calendar view',
      preview: <CalendarHeatmap data={[]} />,
    },
    {
      id: 'barChart',
      name: 'Performance by Tag',
      description: 'Shows performance across different topic tags',
      preview: <TagPerformanceBarChart qbanks={[]} quizHistory={[]} />,
    },
    {
      id: 'spiderChart',
      name: 'Tag Coverage',
      description: 'Visualizes topic coverage in a radar chart',
      preview: <TagPerformanceChart qbanks={[]} quizHistory={[]} />,
    },
    {
      id: 'progressChart',
      name: 'Progress Over Time',
      description: 'Shows performance trends over time',
      preview: (
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ),
    },
    {
      id: 'scoreDistribution',
      name: 'Score Distribution',
      description: 'Shows distribution of scores across different categories',
      preview: (
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Correct', value: 70 },
                  { name: 'Incorrect', value: 20 },
                  { name: 'Skipped', value: 10 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={40}
                dataKey="value"
              >
                {['#0088FE', '#00C49F', '#FFBB28'].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      ),
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
