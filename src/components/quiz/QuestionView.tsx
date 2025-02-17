
import { motion } from "framer-motion";
import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import { useEffect, useState } from "react";

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
  const [highlights, setHighlights] = useState<string[]>([]);

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

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (selectedText) {
      // Check if text is already highlighted
      if (highlights.includes(selectedText)) {
        setHighlights(highlights.filter(h => h !== selectedText));
      } else {
        setHighlights([...highlights, selectedText]);
      }
    }
    
    selection.removeAllRanges();
  };

  const highlightText = (text: string) => {
    let result = text;
    highlights.forEach(highlight => {
      // Escape special characters in the highlight text
      const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedHighlight})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    return result;
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-accent p-8 rounded-2xl shadow-lg"
    >
      {question.media?.showWith === 'question' && renderMedia(question.media)}
      
      <div 
        className="text-2xl font-bold mb-6"
        onMouseUp={handleHighlight}
        dangerouslySetInnerHTML={{ __html: highlightText(question.question) }}
      />
      
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
