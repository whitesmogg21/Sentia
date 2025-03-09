import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderMarkdown, extractImageReferences, createImageButtons } from "@/utils/markdownUtils";

interface QuestionViewProps {
  question: Question;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isPaused: boolean;
  onAnswerClick: (index: number) => void;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

interface StrikethroughState {
  [questionId: string]: {
    [optionIndex: number]: boolean;
  };
}

const ImageModal = ({ isOpen, onClose, imageUrl, altText }: ImageModalProps) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col">
        <div className="absolute right-4 top-4 flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={altText}
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-in-out',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QuestionView = ({
  question,
  selectedAnswer,
  isAnswered,
  isPaused,
  onAnswerClick
}: QuestionViewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [strikethroughs, setStrikethroughs] = useState<StrikethroughState>({});

  useEffect(() => {
    const savedMedia = localStorage.getItem('mediaLibrary');
    if (savedMedia) {
      setMediaLibrary(JSON.parse(savedMedia));
    }
  }, []);

  const handleImageClick = (imageName: string) => {
    const mediaItem = mediaLibrary.find(m => m.name === imageName);
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

  const renderContent = (text: string) => {
    const imageNames = extractImageReferences(text);
    const imageButtons = createImageButtons(imageNames, mediaLibrary, handleImageClick);
    
    if (imageButtons.length > 0) {
      return (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {imageButtons}
          </div>
          <div className="prose prose-sm dark:prose-invert">
            {renderMarkdown(text)}
          </div>
        </div>
      );
    }
    
    return <div className="prose prose-sm dark:prose-invert">{renderMarkdown(text)}</div>;
  };

  const renderOptionContent = (text: string): React.ReactNode => {
    const imageNames = extractImageReferences(text);
    const imageButtons = createImageButtons(imageNames, mediaLibrary, handleImageClick);
    
    if (imageButtons.length > 0) {
      return (
        <div className="flex items-center gap-2">
          {imageButtons}
          <div className="prose prose-sm dark:prose-invert">
            {renderMarkdown(text)}
          </div>
        </div>
      );
    }
    
    return <div className="prose prose-sm dark:prose-invert">{renderMarkdown(text)}</div>;
  };

  return (
    <div className="dark:text-gray-100">
      <div ref={contentRef} className="mb-4">
        {renderContent(question.question)}
      </div>
      
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <QuizOption
            key={index}
            option={renderOptionContent(option)}
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
