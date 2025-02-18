import { Question } from "@/types/quiz";
import { cn } from "@/lib/utils";
interface QuizResultsTableProps {
  questions: Question[];
  attempts: {
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
    isFlagged?: boolean;
  }[];
}

const QuizResultsTable = ({ questions, attempts }: QuizResultsTableProps) => {
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
            return (
              <tr 
                key={question.id}
                className={cn(
                  "border-t dark:border-gray-700",
                  attempt?.selectedAnswer !== null && attempt.isCorrect && "bg-green-50 dark:bg-green-900/20",
                  attempt?.selectedAnswer !== null && !attempt.isCorrect && "bg-red-50 dark:bg-red-900/20"
                )}
              >
                <td className="p-2 dark:text-gray-200">{index + 1}</td>
                <td className="p-2 dark:text-gray-200">{question.question}</td>
                <td className={cn(
                  "p-2",
                  attempt?.selectedAnswer !== null && attempt.isCorrect && "text-green-600 dark:text-green-400",
                  attempt?.selectedAnswer !== null && !attempt.isCorrect && "text-red-600 dark:text-red-400",
                  attempt?.isFlagged && "text-yellow-600 dark:text-yellow-400",
                  attempt?.selectedAnswer === null && "text-gray-500 dark:text-gray-400"
                )}>
                  {attempt?.selectedAnswer !== null 
                    ? (attempt.isCorrect ? "Correct" : "Incorrect")
                    : (attempt?.isFlagged ? "Flagged" : "Omitted")}
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
