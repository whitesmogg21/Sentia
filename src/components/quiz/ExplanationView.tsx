
import { useState, useEffect } from "react";
import { Question } from "@/types/quiz";
import { renderMarkdown } from "@/utils/markdownUtils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image, ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import 'katex/dist/katex.min.css';

interface ExplanationViewProps {
  question: Question;
  selectedAnswer: number | null;
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

const ExplanationView = ({ question, selectedAnswer }: ExplanationViewProps) => {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const correctOptionText = question.options[question.correctAnswer];
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
    // Split by image references first
    const parts = text.split('/');
    if (text.includes('/') && parts.length > 1) {
      return parts.map((part, index) => {
        if (index === 0 && !text.startsWith('/')) {
          // This is text before the first image
          return (
            <span key={index} className="mr-2">
              {renderMarkdown(part)}
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
              {renderMarkdown(part)}
            </span>
          );
        }
        
        return null;
      });
    } else {
      // No image references, just render markdown
      return renderMarkdown(text);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-background">
      <div className="mb-4">
        <div className={`text-lg font-medium ${isCorrect ? 'text-success' : 'text-error'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect!'}
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedAnswer !== null
            ? `You selected: ${question.options[selectedAnswer]}`
            : 'You did not select an answer'}
        </div>
        <div className="text-sm text-success">
          Correct answer: {correctOptionText}
        </div>
      </div>

      {question.explanation && (
        <div className="mt-4">
          <div className="font-medium mb-1">Explanation:</div>
          <div className="text-sm text-muted-foreground">
            {renderContent(question.explanation)}
          </div>
        </div>
      )}

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

export default ExplanationView;
