
import { motion } from "framer-motion";
import { Question } from "@/types/quiz";

interface ExplanationViewProps {
  question: Question;
}

const ExplanationView = ({ question }: ExplanationViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-bold mb-4 text-primary">Explanation</h3>
      <div className="prose dark:prose-invert prose-sm max-w-none">
        <p className="text-lg mb-6">
          {question.explanation || "The correct answer was: " + question.options[question.correctAnswer]}
        </p>
      </div>
    </motion.div>
  );
};

export default ExplanationView;
