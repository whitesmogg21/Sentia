
import { motion } from "framer-motion";
import { Question } from "@/types/quiz";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ExplanationViewProps {
  question: Question;
}

const ExplanationView = ({ question }: ExplanationViewProps) => {
  const explanationText = question.explanation || 
    `The correct answer was: ${question.options[question.correctAnswer]}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card p-8 rounded-2xl shadow-lg"
    >
      <h3 className="text-xl font-bold mb-4 text-card-foreground">Explanation</h3>
      <div className="text-lg mb-6 prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {explanationText}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default ExplanationView;
