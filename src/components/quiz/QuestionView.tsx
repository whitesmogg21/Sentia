
import { Question } from "@/types/quiz";
import QuizOption from "../QuizOption";
import React, { useRef } from 'react';

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
  const contentRef = useRef<HTMLDivElement>(null);

  const renderContent = (text: string) => {
    const parts = text.split('/');
    return parts.map((part, index) => {
      if (index === 0 && !text.startsWith('/')) {
        return <p key={index} className="mb-4">{part}</p>;
      }
      
      if (part.match(/\.(png|jpg|jpeg|gif)$/i)) {
        // This is an image filename
        const mediaItem = question.qbank?.media?.find(m => m.name === part);
        if (mediaItem) {
          return (
            <img
              key={index}
              src={mediaItem.url}
              alt={part}
              className="max-w-full h-auto mb-4 rounded-lg"
            />
          );
        }
        return null;
      }
      
      if (part) {
        return <p key={index} className="mb-4">{part}</p>;
      }
      
      return null;
    });
  };

  return (
    <div className="dark:text-gray-100">
      <div ref={contentRef}>
        {renderContent(question.question)}
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
    </div>
  );
};

export default QuestionView;
