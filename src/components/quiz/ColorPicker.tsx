
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";

const HIGHLIGHT_COLORS = [
  { name: 'yellow', class: 'bg-yellow-200' },
  { name: 'green', class: 'bg-green-200' },
  { name: 'blue', class: 'bg-blue-200' },
  { name: 'pink', class: 'bg-pink-200' },
  { name: 'purple', class: 'bg-purple-200' },
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "border-2",
            selectedColor ? `border-${selectedColor}-400` : "border-gray-200"
          )}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="grid grid-cols-5 gap-2">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.name}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                color.class,
                selectedColor === color.name
                  ? `border-${color.name}-400 scale-110`
                  : "border-transparent hover:scale-105"
              )}
              onClick={() => onColorSelect(color.name)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
