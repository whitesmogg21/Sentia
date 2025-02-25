
import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image, ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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

  useEffect(() => {
    const savedMedia = localStorage.getItem('mediaLibrary');
    if (savedMedia) {
      setMediaLibrary(JSON.parse(savedMedia));
    }
  }, []);

  const handleImageClick = (imageData: string, imageName: string) => {
    setSelectedImage({ url: imageData, name: imageName });
  };

  const renderContent = (text: string) => {
    // Check if the text contains any image references
    if (text.includes('/')) {
      const parts = text.split('/');
      return parts.map((part, index) => {
        if (index === 0 && !text.startsWith('/')) {
          return (
            <span key={index} className="mr-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {part}
              </ReactMarkdown>
            </span>
          );
        }
        
        if (part.match(/\.(png|jpg|jpeg|gif)$/i)) {
          // This is an image filename
          const mediaItem = mediaLibrary.find(m => m.name === part);
          if (mediaItem) {
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="mx-1 inline-flex items-center"
                onClick={() => handleImageClick(mediaItem.data, mediaItem.name)}
              >
                <Image className="h-4 w-4" />
              </Button>
            );
          }
          return null;
        }
        
        if (part) {
          return (
            <span key={index} className="mr-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {part}
              </ReactMarkdown>
            </span>
          );
        }
        
        return null;
      });
    } else {
      // No image references, render the entire text as markdown
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {text}
        </ReactMarkdown>
      );
    }
  };

  const processOptionContent = (text: string): React.ReactNode => {
    // If text contains image references
    if (text.includes('/')) {
      const parts = text.split('/');
      return (
        <div className="flex items-center">
          {parts.map((part, index) => {
            if (part.match(/\.(png|jpg|jpeg|gif)$/i)) {
              // This is an image filename
              const mediaItem = mediaLibrary.find(m => m.name === part);
              if (mediaItem) {
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="mx-1 inline-flex items-center"
                    onClick={() => handleImageClick(mediaItem.data, mediaItem.name)}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                );
              }
              return null;
            }
            
            if (part) {
              return <span key={index} className="mr-2">{part}</span>;
            }
            
            return null;
          }).filter(Boolean)}
        </div>
      );
    }
    
    // If it's just text, return it as is
    return text;
  };

  return (
    <div className="dark:text-gray-100">
      <div ref={contentRef} className="mb-4 prose dark:prose-invert max-w-none">
        {renderContent(question.question)}
      </div>
      
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <QuizOption
            key={index}
            option={processOptionContent(option)}
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
