
import { Question } from "@/types/quiz";
import { renderMarkdown } from "@/utils/markdownUtils";
import { useState } from "react";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import ImageModal from "./ImageModal";

interface ExplanationViewProps {
  question: Question;
  selectedAnswer: number | null;
}

const ExplanationView = ({ question, selectedAnswer }: ExplanationViewProps) => {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const correctOptionText = question.options[question.correctAnswer];
  const { mediaLibrary, getMediaItem } = useMediaLibrary();
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  const handleImageClick = (imageName: string) => {
    const mediaItem = getMediaItem(imageName);
    if (mediaItem) {
      setSelectedImage({ url: mediaItem.data, name: mediaItem.name });
    }
  };

  const renderExplanationContent = () => {
    if (!question.explanation) return null;
    
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
