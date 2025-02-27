
import { motion } from "framer-motion";
import { Question, QuizHistory } from "@/types/quiz";
import QuizResultsTable from "./QuizResultsTable";

interface ScoreCardProps {
  score: number;
  total: number;
  questions: Question[];
  attempts: {
    questionId: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
    isFlagged: boolean;
  }[];
  onEnd: () => void;
}

const ScoreCard = ({ score, total, questions, attempts, onEnd }: ScoreCardProps) => {
  const percentage = Number(((score / total) * 100).toFixed(2));
  const attempted = attempts.filter(a => a.selectedAnswer !== null).length;
  const correct = attempts.filter(a => a.isCorrect).length;
  const flagged = attempts.filter(a => a.isFlagged).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto p-6"
    >
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center dark:text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
        <div className="text-6xl font-bold text-primary mb-4">{percentage}%</div>
        <div className="space-y-2 mb-6">
          <p className="text-lg">
            You scored {score} out of {total} questions correctly
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Attempted: {attempted} | Correct: {correct} | Flagged: {flagged}
          </p>
        </div>
        <button
          onClick={onEnd}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
      <QuizResultsTable questions={questions} attempts={attempts} />
    </motion.div>
  );
};

export default ScoreCard;
