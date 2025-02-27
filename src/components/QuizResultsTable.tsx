import { Question } from "@/types/quiz";
import { cn } from "@/lib/utils";
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
          {questions.map((question, index) => {
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
                <td className="p-2 dark:text-gray-200">{index + 1}</td>
                <td className="p-2 dark:text-gray-200">{question.question}</td>
                <td className={cn("p-2", status.color)}>
                  {status.status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuizResultsTable;
