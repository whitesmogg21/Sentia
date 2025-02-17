
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
    <div className="mt-8 p-4 bg-white rounded-lg shadow">
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
            return (
              <tr 
                key={question.id}
                className={cn(
                  "border-t",
                  attempt?.isCorrect && "bg-green-50",
                  attempt?.isCorrect === false && "bg-red-50"
                )}
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{question.question}</td>
                <td className="p-2">
                  {attempt?.isCorrect ? "Correct" : attempt?.selectedAnswer !== null ? "Incorrect" : "Omitted"}
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
