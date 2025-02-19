
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

  return (
    <div className="dark:text-gray-100">
      {question.media?.showWith === 'question' && renderMedia(question.media)}
      
      <div ref={contentRef}>
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
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

      {isAnswered && question.media?.showWith === 'answer' && renderMedia(question.media)}
    </div>
  );
};

export default QuestionView;
