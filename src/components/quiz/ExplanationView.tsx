
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
      className="bg-white p-8 rounded-2xl shadow-lg"
    >
      <h3 className="text-xl font-bold mb-4">Explanation</h3>
      <p className="text-lg mb-6">
        {question.explanation || "The correct answer was: " + question.options[question.correctAnswer]}
      </p>
    </motion.div>
  );
};

export default ExplanationView;
