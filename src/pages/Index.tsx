
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { qbanks } from "../data/questions";
import QuizOption from "../components/QuizOption";
import ProgressBar from "../components/ProgressBar";
import ScoreCard from "../components/ScoreCard";
import Dashboard from "../components/Dashboard";
import { Question, QuizHistory } from "../types/quiz";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, Video, Audio, AlertCircle } from "lucide-react";

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
  const [tutorMode, setTutorMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleStartQuiz = (qbankId: string, questionCount: number, isTutorMode: boolean) => {
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
    setTutorMode(isTutorMode);
    setInQuiz(true);
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (optionIndex === currentQuestions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    } else if (tutorMode) {
      setShowExplanation(true);
    }

    if (!tutorMode) {
      proceedToNextQuestion(optionIndex);
    }
  };

  const proceedToNextQuestion = (optionIndex: number) => {
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
  };

  const handleContinue = () => {
    setShowExplanation(false);
    proceedToNextQuestion(selectedAnswer || 0);
  };

  const handleRestart = () => {
    setInQuiz(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTutorMode(false);
  };

  const renderMedia = (media?: Question['media']) => {
    if (!media) return null;

    const className = "max-w-full h-auto mb-4 rounded-lg";
    
    switch (media.type) {
      case 'image':
        return <img src={media.url} alt="Question media" className={className} />;
      case 'video':
        return <video src={media.url} controls className={className} />;
      case 'audio':
        return <audio src={media.url} controls className="w-full mb-4" />;
      default:
        return null;
    }
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
          {currentQuestion.media?.showWith === 'question' && renderMedia(currentQuestion.media)}
          
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

          {isAnswered && currentQuestion.media?.showWith === 'answer' && renderMedia(currentQuestion.media)}
        </motion.div>
        
        <div className="text-center text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {currentQuestions.length}
        </div>
      </div>

      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Explanation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-lg mb-4">
              {currentQuestion.explanation || "The correct answer was: " + currentQuestion.options[currentQuestion.correctAnswer]}
            </p>
            <Button onClick={handleContinue} className="w-full">
              Continue to Next Question
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

