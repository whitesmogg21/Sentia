
import { Question } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface QuizResultsTableProps {
  questions: Question[];
  attempts: {
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
  }[];
}

const QuizResultsTable = ({ questions, attempts }: QuizResultsTableProps) => {
  return (
    <div className="mt-8 p-4 bg-white dark:bg-accent rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-2">Question #</th>
            <th className="text-left p-2">Question</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, index) => {
            const attempt = attempts.find(a => a.questionId === question.id);
            const status = attempt?.selectedAnswer === null ? "Omitted" 
              : attempt?.isCorrect ? "Correct" 
              : "Incorrect";
            
            return (
              <tr 
                key={question.id}
                className={cn(
                  "border-t",
                  status === "Correct" && "bg-green-50 dark:bg-green-900/20",
                  status === "Incorrect" && "bg-red-50 dark:bg-red-900/20",
                  status === "Omitted" && "bg-gray-50 dark:bg-gray-900/20"
                )}
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{question.question}</td>
                <td className="p-2">{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuizResultsTable;
