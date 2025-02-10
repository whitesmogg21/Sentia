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
import { Image, Timer, Play, Pause, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
  const [isPaused, setIsPaused] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(60); // seconds
  const [questionTimer, setQuestionTimer] = useState<NodeJS.Timeout | null>(null);

  const handleStartQuiz = (qbankId: string, questionCount: number, isTutorMode: boolean, withTimer: boolean, timeLimit: number) => {
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
    setTimerEnabled(withTimer);
    setTimePerQuestion(timeLimit);
    setInQuiz(true);
    setIsPaused(false);

    if (withTimer) {
      startQuestionTimer();
    }
  };

  const startQuestionTimer = () => {
    if (questionTimer) {
      clearTimeout(questionTimer);
    }
    
    const timer = setTimeout(() => {
      if (!isAnswered && !isPaused) {
        handleAnswerTimeout();
      }
    }, timePerQuestion * 1000);
    
    setQuestionTimer(timer);
  };

  const handleAnswerTimeout = () => {
    setIsAnswered(true);
    if (tutorMode) {
      setShowExplanation(true);
    } else {
      proceedToNextQuestion(-1); // -1 indicates timeout/no answer
    }
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered || isPaused) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (optionIndex === currentQuestions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (tutorMode) {
      setShowExplanation(true);
    } else {
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
      if (timerEnabled) {
        startQuestionTimer();
      }
    }
  };

  const handleQuit = () => {
    const newQuizHistory: QuizHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      score,
      totalQuestions: currentQuestions.length,
      qbankId: currentQuestions[0].qbankId,
    };
    onQuizComplete?.(newQuizHistory);
    handleRestart();
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
    if (questionTimer) {
      clearTimeout(questionTimer);
    }
  };

  const handleContinue = () => {
    setShowExplanation(false);
    proceedToNextQuestion(selectedAnswer || 0);
  };

  const handleRestart = () => {
    if (questionTimer) {
      clearTimeout(questionTimer);
    }
    setInQuiz(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTutorMode(false);
    setIsPaused(false);
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

  const handleQuizNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      if (timerEnabled) {
        startQuestionTimer();
      }
    } else if (direction === 'next' && currentQuestionIndex < currentQuestions.length - 1) {
      proceedToNextQuestion(selectedAnswer || -1);
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
    <div className="min-h-screen bg-background p-6">
      <div className="mb-4">
        <ProgressBar current={currentQuestionIndex + 1} total={currentQuestions.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                disabled={isAnswered || isPaused}
              />
            ))}
          </div>

          {isAnswered && currentQuestion.media?.showWith === 'answer' && renderMedia(currentQuestion.media)}
        </motion.div>

        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4">Explanation</h3>
            <p className="text-lg mb-6">
              {currentQuestion.explanation || "The correct answer was: " + currentQuestion.options[currentQuestion.correctAnswer]}
            </p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuizNavigation('prev')}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuizNavigation('next')}
              disabled={currentQuestionIndex === currentQuestions.length - 1 || !isAnswered}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePause}
              className="flex items-center gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleQuit}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              End Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
