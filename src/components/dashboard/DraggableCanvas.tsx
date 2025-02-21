
import { useState } from "react";
import { Button } from "../ui/button";
import { DraggableWidget } from "./DraggableWidget";
import { WidgetSelector } from "./WidgetSelector";
import { Edit2, Check } from "lucide-react";

interface Widget {
  id: string;
  type: string;
}

interface DraggableCanvasProps {
  data: any;
}

export const DraggableCanvas = ({ data }: DraggableCanvasProps) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddWidget = (type: string) => {
    setWidgets([...widgets, {
      id: `${type}-${Date.now()}`,
      type
    }]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <WidgetSelector onAddWidget={handleAddWidget} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-full"
        >
          {isEditing ? (
            <Check className="h-4 w-4" />
          ) : (
            <Edit2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px] p-4 border-2 border-dashed rounded-lg">
        {widgets.map((widget) => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            type={widget.type}
            onRemove={handleRemoveWidget}
            isEditing={isEditing}
            data={data}
          />
        ))}
      </div>
    </div>
  );
};
