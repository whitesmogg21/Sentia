import { useState } from "react";
import { qbanks } from "../data/questions";
import { Question, QuizHistory } from "../types/quiz";
import Dashboard from "../components/Dashboard";
import ProgressBar from "../components/ProgressBar";
import ScoreCard from "../components/ScoreCard";
import QuestionView from "@/components/quiz/QuestionView";
import ExplanationView from "@/components/quiz/ExplanationView";
import QuizController from "@/components/quiz/QuizController";

interface IndexProps {
  quizHistory?: QuizHistory[];
  onQuizComplete?: (history: QuizHistory) => void;
  onQuizStart?: () => void;
  onQuizEnd?: () => void;
}

const Index = ({ quizHistory = [], onQuizComplete, onQuizStart, onQuizEnd }: IndexProps) => {
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
    onQuizStart?.();
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
    setIsPaused(false);
    onQuizEnd?.();
  };

  const handleQuizNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else if (direction === 'next' && currentQuestionIndex < currentQuestions.length - 1) {
      proceedToNextQuestion(selectedAnswer || -1);
    }
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
    <div className="fixed inset-0 bg-background">
      <div className="container mx-auto p-6 h-full flex flex-col">
        <div className="mb-4">
          <ProgressBar current={currentQuestionIndex + 1} total={currentQuestions.length} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6">
            <QuestionView
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              isAnswered={isAnswered}
              isPaused={isPaused}
              onAnswerClick={handleAnswerClick}
            />

            {isAnswered && showExplanation && (
              <ExplanationView question={currentQuestion} />
            )}
          </div>
        </div>

        <QuizController
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={currentQuestions.length}
          isAnswered={isAnswered}
          isPaused={isPaused}
          onNavigate={handleQuizNavigation}
          onPause={handlePause}
          onQuit={handleQuit}
          timerEnabled={timerEnabled}
          timeLimit={timePerQuestion}
          onTimeUp={handleAnswerTimeout}
        />
      </div>
    </div>
  );
};

export default Index;
