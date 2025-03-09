
import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import React, { useRef, useState } from 'react';
import { renderMarkdown } from "@/utils/markdownUtils";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import ImageModal from "./ImageModal";

interface QuestionViewProps {
  question: Question;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isPaused: boolean;
  onAnswerClick: (index: number) => void;
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
  onAnswerClick
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

  return (
    <div className="dark:text-gray-100">
      <div ref={contentRef} className="mb-4">
        {renderMarkdown(question.question, handleImageClick)}
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
