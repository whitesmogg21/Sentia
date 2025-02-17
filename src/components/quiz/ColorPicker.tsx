
import React from 'react';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const colors = [
  { name: 'yellow', class: 'bg-yellow-200 hover:bg-yellow-300' },
  { name: 'green', class: 'bg-green-200 hover:bg-green-300' },
  { name: 'blue', class: 'bg-blue-200 hover:bg-blue-300' },
  { name: 'pink', class: 'bg-pink-200 hover:bg-pink-300' },
];

const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <Button
          key={color.name}
          variant="ghost"
          size="icon"
          onClick={() => onColorSelect(color.name)}
          className={cn(
            "h-6 w-6 rounded-full p-0",
            color.class,
            selectedColor === color.name && "ring-2 ring-primary ring-offset-2"
          )}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
