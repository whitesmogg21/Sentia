
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "../data/questions";
import QuizOption from "../components/QuizOption";
import ProgressBar from "../components/ProgressBar";
import ScoreCard from "../components/ScoreCard";
import { Question } from "../types/quiz";

const Index = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion: Question = questions[currentQuestionIndex];

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (optionIndex === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex === questions.length - 1) {
        setShowScore(true);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  if (showScore) {
    return <ScoreCard score={score} total={questions.length} onRestart={handleRestart} />;
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
        
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
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
    </div>
  );
};

export default Index;
