
import { Question } from "@/types/quiz";
import { renderMarkdown, extractImageReferences, createImageButtons } from "@/utils/markdownUtils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleImageClick = (imageName: string) => {
    const mediaItem = mediaLibrary.find(m => m.name === imageName);
    if (mediaItem) {
      setSelectedImage({ url: mediaItem.data, name: mediaItem.name });
    }
  };

  const renderExplanationContent = () => {
    if (!question.explanation) return null;
    
    // Render the markdown with image click handler
    return (
      <div className="prose prose-sm dark:prose-invert">
        {renderMarkdown(question.explanation, handleImageClick)}
      </div>
    );
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
            {renderExplanationContent()}
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
