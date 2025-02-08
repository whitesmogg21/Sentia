
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuizHistory } from "../types/quiz";

interface HistoryProps {
  quizHistory: QuizHistory[];
}

const History = ({ quizHistory }: HistoryProps) => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Previous Quizzes</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Question Bank</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizHistory.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell>{quiz.date}</TableCell>
                <TableCell>{quiz.qbankId}</TableCell>
                <TableCell>{quiz.score}/{quiz.totalQuestions}</TableCell>
                <TableCell>{((quiz.score / quiz.totalQuestions) * 100).toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default History;
