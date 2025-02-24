
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string | null;
  onSelect: (color: string | null) => void;
}

const colors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
];

export function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-4 w-4" style={selectedColor ? { color: selectedColor } : undefined} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-5 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              className="h-6 w-6 rounded-md border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onSelect(color === selectedColor ? null : color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
