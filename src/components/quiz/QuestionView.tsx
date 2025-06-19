import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import React, { useRef, useState, useEffect } from 'react';
import { renderMarkdown } from "@/utils/markdownUtils";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import ImageModal from "./ImageModal";

interface QuestionViewProps {
  question: Question;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isPaused: boolean;
  onAnswerClick: (index: number) => void;
  isFormulaOpen: boolean;
}

interface StrikethroughState {
  [questionId: string]: {
    [optionIndex: number]: boolean;
  };
}

const QuestionView = ({
  question,
  selectedAnswer,
  isAnswered,
  isPaused,
  onAnswerClick,
  isFormulaOpen
}: QuestionViewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { getMediaItem } = useMediaLibrary();
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [strikethroughs, setStrikethroughs] = useState<StrikethroughState>({});

  const handleImageClick = (imageName: string) => {
    const mediaItem = getMediaItem(imageName);
    if (mediaItem) {
      setSelectedImage({ url: mediaItem.data, name: mediaItem.name });
    }
  };

  const handleStrikethrough = (questionId: number | string, optionIndex: number, isStriked: boolean) => {
    setStrikethroughs(prev => {
      const questionKey = questionId.toString();
      return {
        ...prev,
        [questionKey]: {
          ...(prev[questionKey] || {}),
          [optionIndex]: isStriked
        }
      };
    });
  };

  const isOptionStrikedOut = (optionIndex: number): boolean => {
    const questionKey = question.id.toString();
    return strikethroughs[questionKey]?.[optionIndex] || false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle key presses if answered or paused
      if (isAnswered || isPaused || isFormulaOpen) return;

      // Check for number keys 1-9 and 0 (for 10th option)
      if (e.key >= '1' && e.key <= '9') {
        const optionIndex = parseInt(e.key) - 1;
        // Only proceed if the option exists
        if (optionIndex < question.options.length) {
          onAnswerClick(optionIndex);
        }
      } else if (e.key === '0') {
        // Handle 0 as the 10th option (index 9)
        const optionIndex = 9;
        if (optionIndex < question.options.length) {
          onAnswerClick(optionIndex);
        }
      } else if (e.key.toLowerCase() === 'm' && selectedImage) {
        // Handle M key to open modal if there's a selected image
        setSelectedImage({ ...selectedImage }); // This will keep the modal open
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnswered, isPaused, question.options.length, onAnswerClick, selectedImage]);

  // Check if there are any images in the question or options
  const hasImages = () => {
    // Check question text for images
    if (question.question.includes('![')) return true;
    
    // Check options for images
    return question.options.some(option => option.includes('!['));
  };

  return (
    <div className="dark:text-gray-100">
      <div ref={contentRef} className="mb-4">
        {renderMarkdown(question.question, handleImageClick)}
        {hasImages() && (
          <div className="text-xs mt-2 opacity-70">
            Press M to view images
          </div>
        )}
      </div>

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <QuizOption
            key={index}
            option={
              <div className="prose prose-sm dark:prose-invert">
                {renderMarkdown(option, handleImageClick)}

              </div>
            }
            selected={selectedAnswer === index}
            correct={
              isAnswered
                ? index === question.correctAnswer
                : undefined
            }
            onClick={() => onAnswerClick(index)}
            disabled={isAnswered || isPaused}
            questionId={question.id}
            optionIndex={index}
            onStrikethrough={handleStrikethrough}
            isStrikedOut={isOptionStrikedOut(index)}
          />
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          altText={selectedImage.name}
        />
      )}
    </div>
  );
};

export default QuestionView;