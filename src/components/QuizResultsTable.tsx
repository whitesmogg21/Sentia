import { Question } from "@/types/quiz";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/utils/markdownUtils";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import ImageModal from "./quiz/ImageModal";
import React, { useState } from "react";
import Pagination from "@/components/Pagintion";

interface QuizResultsTableProps {
  questions: Question[];
  attempts: {
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
    isFlagged: boolean;
  }[];
}

const QuizResultsTable = ({ questions, attempts }: QuizResultsTableProps) => {
  const { getMediaItem } = useMediaLibrary();
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 20;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const paginatedQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  const handleImageClick = (imageName: string) => {
    const mediaItem = getMediaItem(imageName);
    if (mediaItem) {
      setSelectedImage({ url: mediaItem.data, name: mediaItem.name });
    }
  };

  const getQuestionStatus = (attempt: typeof attempts[0] | undefined) => {
    if (!attempt) return { status: 'Omitted', color: 'text-gray-500 dark:text-gray-400' };
    if (attempt.selectedAnswer === null && attempt.isFlagged) {
      return { status: 'Flagged', color: 'text-yellow-600 dark:text-yellow-400' };
    }
    if (attempt.selectedAnswer === null) {
      return { status: 'Omitted', color: 'text-gray-500 dark:text-gray-400' };
    }
    if (attempt.isCorrect) {
      return { status: 'Correct', color: 'text-green-600 dark:text-green-400' };
    }
    return { status: 'Incorrect', color: 'text-red-600 dark:text-red-400' };
  };

  const getRowBackground = (attempt: typeof attempts[0] | undefined) => {
    if (!attempt || attempt.selectedAnswer === null) return '';
    return attempt.isCorrect
      ? 'bg-green-50 dark:bg-green-900/20'
      : 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow dark:text-gray-100">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-2 dark:text-gray-200">Question #</th>
            <th className="text-left p-2 dark:text-gray-200">Question</th>
            <th className="text-left p-2 dark:text-gray-200">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedQuestions.map((question, index) => {
            const attempt = attempts.find(a => a.questionId === question.id);
            const status = getQuestionStatus(attempt);

            return (
              <tr
                key={question.id}
                className={cn(
                  "border-t dark:border-gray-700",
                  getRowBackground(attempt)
                )}
              >
                <td className="p-2 dark:text-gray-200">{(currentPage - 1) * QUESTIONS_PER_PAGE + index + 1}</td>
                <td className="p-2 dark:text-gray-200">
                  <div className="prose prose-sm dark:prose-invert">
                    {renderMarkdown(question.question, handleImageClick)}
                  </div>
                </td>
                <td className={cn("p-2", status.color)}>
                  {status.status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedImage && (
        <ImageModal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          altText={selectedImage.name}
        />
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default QuizResultsTable;
