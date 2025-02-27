
import { motion } from "framer-motion";
import { Question, QuizHistory } from "@/types/quiz";
import QuizResultsTable from "./QuizResultsTable";

interface ScoreCardProps {
  score: number;
  total: number;
  questions: Question[];
  attempts: QuizHistory['questionAttempts'];
  onEnd: () => void;
}

const ScoreCard = ({ score, total, questions, attempts, onEnd }: ScoreCardProps) => {
  const percentage = (score / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto p-6"
    >
      <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
        <div className="text-6xl font-bold text-primary mb-4">{percentage}%</div>
        <p className="text-lg mb-6">
          You scored {score} out of {total} questions correctly
        </p>
        <button
          onClick={onEnd}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          End
        </button>
      </div>
      <QuizResultsTable questions={questions} attempts={attempts} />
    </motion.div>
  );
};

export default ScoreCard;
