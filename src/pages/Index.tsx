import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { qbanks } from "../data/questions";
import QuizOption from "../components/QuizOption";
import ProgressBar from "../components/ProgressBar";
import ScoreCard from "../components/ScoreCard";
import Dashboard from "../components/Dashboard";
import { Question, QuizHistory } from "../types/quiz";

interface IndexProps {
  quizHistory?: QuizHistory[];
  onQuizComplete?: (history: QuizHistory) => void;
}

const Index = ({ quizHistory = [], onQuizComplete }: IndexProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [inQuiz, setInQuiz] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);

  const handleStartQuiz = (qbankId: string, questionCount: number) => {
    const selectedQBank = qbanks.find((qb) => qb.id === qbankId);
    if (!selectedQBank) return;

    const shuffledQuestions = [...selectedQBank.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    setCurrentQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setInQuiz(true);
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (optionIndex === currentQuestions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex === currentQuestions.length - 1) {
        const newQuizHistory: QuizHistory = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          score: score + (optionIndex === currentQuestions[currentQuestionIndex].correctAnswer ? 1 : 0),
          totalQuestions: currentQuestions.length,
          qbankId: currentQuestions[0].qbankId,
        };
        onQuizComplete?.(newQuizHistory);
        setShowScore(true);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setInQuiz(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  if (!inQuiz) {
    return (
      <Dashboard
        qbanks={qbanks}
        quizHistory={quizHistory}
        onStartQuiz={handleStartQuiz}
      />
    );
  }

  if (showScore) {
    return <ScoreCard score={score} total={currentQuestions.length} onRestart={handleRestart} />;
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <ProgressBar current={currentQuestionIndex + 1} total={currentQuestions.length} />
        
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
          
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <QuizOption
                key={index}
                option={option}
                selected={selectedAnswer === index}
                correct={
                  isAnswered
                    ? index === currentQuestion.correctAnswer
                    : undefined
                }
                onClick={() => handleAnswerClick(index)}
                disabled={isAnswered}
              />
            ))}
          </div>
        </motion.div>
        
        <div className="text-center text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {currentQuestions.length}
        </div>
      </div>
    </div>
  );
};

export default Index;
