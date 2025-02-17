import { motion } from "framer-motion";
import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import { useEffect, useState } from "react";
import ColorPicker from "./ColorPicker";
import { cn } from "@/lib/utils";

interface Highlight {
  id: string;
  text: string;
  color: string;
  elementId: string;
}

interface QuestionViewProps {
  question: Question;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isPaused: boolean;
  onAnswerClick: (index: number) => void;
}

const QuestionView = ({
  question,
  selectedAnswer,
  isAnswered,
  isPaused,
  onAnswerClick
}: QuestionViewProps) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState("yellow");

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
    const savedHighlights = localStorage.getItem(`highlights-${question.id}`);
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights));
    } else {
      setHighlights([]);
    }
  }, [question.id]);

  useEffect(() => {
    localStorage.setItem(`highlights-${question.id}`, JSON.stringify(highlights));
  }, [highlights, question.id]);

  const handleHighlight = (elementId: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (selectedText) {
      const newHighlight: Highlight = {
        id: Math.random().toString(36).substr(2, 9),
        text: selectedText,
        color: selectedColor,
        elementId,
      };

      setHighlights(prev => [...prev, newHighlight]);
    }
    
    selection.removeAllRanges();
  };

  const removeHighlight = (highlightId: string) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
  };

  const renderHighlightedText = (text: string, elementId: string) => {
    let result = text;
    const elementHighlights = highlights.filter(h => h.elementId === elementId);
    
    elementHighlights.forEach(highlight => {
      const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedText})`, 'gi');
      result = result.replace(
        regex,
        `<span class="bg-${highlight.color}-200" data-highlight-id="${highlight.id}">${highlight.text}</span>`
      );
    });
    
    return result;
  };

  const handleClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const highlightId = target.getAttribute('data-highlight-id');
    if (highlightId) {
      removeHighlight(highlightId);
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-accent p-8 rounded-2xl shadow-lg"
    >
      <div className="flex justify-end mb-4">
        <ColorPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
      </div>

      {question.media?.showWith === 'question' && renderMedia(question.media)}
      
      <div 
        className="text-2xl font-bold mb-6"
        onMouseUp={() => handleHighlight('question')}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ 
          __html: renderHighlightedText(question.question, 'question')
        }}
      />
      
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <div
            key={index}
            className="flex items-start"
          >
            <QuizOption
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
            <div
              className="flex-1 ml-[-275px] pl-[275px]"
              onMouseUp={() => handleHighlight(`option-${index}`)}
              onClick={handleClick}
              dangerouslySetInnerHTML={{
                __html: renderHighlightedText(option, `option-${index}`)
              }}
            />
          </div>
        ))}
      </div>

      {isAnswered && question.media?.showWith === 'answer' && renderMedia(question.media)}
    </motion.div>
  );
};

export default QuestionView;
