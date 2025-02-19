
import { motion } from "framer-motion";
import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

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
      if (selection && !selection.isCollapsed && contentRef.current) {
        const range = selection.getRangeAt(0);
        const { startContainer, endContainer } = range;
        
        // Check if selection is within our content area
        if (contentRef.current.contains(startContainer) && contentRef.current.contains(endContainer)) {
          setSelection(selection);
          const rect = range.getBoundingClientRect();
          setPopoverPosition({
            x: rect.x + rect.width / 2,
            y: rect.y - 10
          });
          setShowColorPicker(true);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleHighlight = () => {
    if (selection && !selection.isCollapsed) {
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
      setShowColorPicker(false);
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:text-gray-100"
    >
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

      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
        <PopoverTrigger asChild>
          <div 
            style={{ 
              position: 'fixed', 
              left: `${popoverPosition.x}px`, 
              top: `${popoverPosition.y}px`,
              visibility: showColorPicker ? 'visible' : 'hidden',
              transform: 'translateX(-50%)'
            }} 
          />
        </PopoverTrigger>
        <PopoverContent className="w-fit p-2">
          <div className="flex gap-2">
            {highlightColors.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  setSelectedColor(color);
                  handleHighlight();
                }}
                className={cn(
                  'w-6 h-6 rounded-full border border-gray-200',
                  color.class
                )}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
};

export default QuestionView;
