
import { motion } from "framer-motion";
import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";

interface QuestionViewProps {
  question: Question;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isPaused: boolean;
  onAnswerClick: (index: number) => void;
}

const highlightColors = [
  { name: 'yellow', class: 'bg-yellow-200 dark:bg-yellow-900/50' },
  { name: 'green', class: 'bg-green-200 dark:bg-green-900/50' },
  { name: 'blue', class: 'bg-blue-200 dark:bg-blue-900/50' },
  { name: 'purple', class: 'bg-purple-200 dark:bg-purple-900/50' },
];

const QuestionView = ({
  question,
  selectedAnswer,
  isAnswered,
  isPaused,
  onAnswerClick
}: QuestionViewProps) => {
  const [selectedColor, setSelectedColor] = useState(highlightColors[0]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  const renderMedia = (media?: Question['media']) => {
    if (!media) return null;

    const className = "max-w-full h-auto mb-4 rounded-lg";
    
    switch (media.type) {
      case 'image':
        return <img src={media.url} alt="Question media" className={className} />;
      case 'video':
        return <video src={media.url} controls className={className} />;
      case 'audio':
        return <audio src={media.url} controls className="w-full mb-4" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        handleHighlight(selection);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [selectedColor]);

  const handleHighlight = (selection: Selection) => {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = cn('cursor-pointer', selectedColor.class);
    
    try {
      range.surroundContents(span);
      span.addEventListener('click', () => {
        const parent = span.parentNode;
        if (parent) {
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
        }
      });
    } catch (error) {
      console.error('Error applying highlight:', error);
    }
    
    selection.removeAllRanges();
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:text-gray-100"
    >
      <div className="flex justify-end gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("bg-background border relative", selectedColor.class)}
              aria-label="Select highlight color"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex gap-2 p-2">
              {highlightColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-6 h-6 rounded-full border border-gray-200',
                    color.class,
                    selectedColor.name === color.name && 'ring-2 ring-primary'
                  )}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {question.media?.showWith === 'question' && renderMedia(question.media)}
      
      <div ref={contentRef}>
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
      </div>
      
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <QuizOption
            key={index}
            option={option}
            selected={selectedAnswer === index}
            correct={
              isAnswered
                ? index === question.correctAnswer
                : undefined
            }
            onClick={() => onAnswerClick(index)}
            disabled={isAnswered || isPaused}
          />
        ))}
      </div>

      {isAnswered && question.media?.showWith === 'answer' && renderMedia(question.media)}
    </motion.div>
  );
};

export default QuestionView;
