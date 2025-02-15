
import { QuizHistory } from "../types/quiz";
import { qbanks } from "../data/questions";
import Dashboard from "../components/Dashboard";
import ScoreCard from "../components/ScoreCard";
<<<<<<< HEAD
import QuestionView from "@/components/quiz/QuestionView";
import ExplanationView from "@/components/quiz/ExplanationView";
import QuizController from "@/components/quiz/QuizController";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
=======
import QuizContent from "@/components/quiz/QuizContent";
import { useQuiz } from "@/hooks/quiz";
>>>>>>> 88f6c84dfb1cc2616ab66233fe3e38776a203f3e

interface IndexProps {
  quizHistory?: QuizHistory[];
  onQuizComplete?: (history: QuizHistory) => void;
  onQuizStart?: () => void;
  onQuizEnd?: () => void;
}

const Index = ({ quizHistory = [], onQuizComplete, onQuizStart, onQuizEnd }: IndexProps) => {
<<<<<<< HEAD
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
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<Array<'correct' | 'incorrect' | null>>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<boolean[]>([]);

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
    setQuestionAnswers(new Array(questionCount).fill(null));
    setBookmarkedQuestions(new Array(questionCount).fill(false));

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
    handleQuit();
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered || isPaused || questionAnswers[currentQuestionIndex] !== null) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestions[currentQuestionIndex].correctAnswer;
    const newAnswers = [...questionAnswers];
    newAnswers[currentQuestionIndex] = isCorrect ? 'correct' : 'incorrect';
    setQuestionAnswers(newAnswers);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (tutorMode) {
      setShowExplanation(true);
    } else {
      proceedToNextQuestion(optionIndex);
    }
  };

  const proceedToNextQuestion = (optionIndex: number) => {
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
    const allQuestionsAnswered = !questionAnswers.includes(null);

    if (isLastQuestion && allQuestionsAnswered) {
      const newQuizHistory: QuizHistory = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        score,
        totalQuestions: currentQuestions.length,
        qbankId: currentQuestions[0].qbankId,
      };
      onQuizComplete?.(newQuizHistory);
      setShowScore(true);
      return;
    }

    if (!isLastQuestion) {
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
    onQuizEnd?.();
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
      setIsAnswered(questionAnswers[currentQuestionIndex - 1] !== null);
      if (timerEnabled) {
        startQuestionTimer();
      }
    } else if (direction === 'next') {
      const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
      const allQuestionsAnswered = !questionAnswers.includes(null);

      if (isLastQuestion && allQuestionsAnswered) {
        const newQuizHistory: QuizHistory = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          score,
          totalQuestions: currentQuestions.length,
          qbankId: currentQuestions[0].qbankId,
        };
        onQuizComplete?.(newQuizHistory);
        setShowScore(true);
        return;
      }

      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(questionAnswers[currentQuestionIndex + 1] !== null);
        if (timerEnabled) {
          startQuestionTimer();
        }
      }
    }
  };
=======
  const {
    currentQuestionIndex,
    score,
    showScore,
    selectedAnswer,
    isAnswered,
    inQuiz,
    currentQuestions,
    showExplanation,
    isPaused,
    timerEnabled,
    timePerQuestion,
    isMarked,
    handleStartQuiz,
    handleAnswerTimeout,
    handleAnswerClick,
    handleQuit,
    handlePause,
    handleRestart,
    handleQuizNavigation,
    handleToggleMark
  } = useQuiz({ onQuizComplete, onQuizStart, onQuizEnd });
>>>>>>> 88f6c84dfb1cc2616ab66233fe3e38776a203f3e

  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitConfirm = () => {
    setShowQuitDialog(false);
    handleQuit();
  };

  const handleQuitCancel = () => {
    setShowQuitDialog(false);
  };

  const handleBookmarkToggle = () => {
    const newBookmarks = [...bookmarkedQuestions];
    newBookmarks[currentQuestionIndex] = !newBookmarks[currentQuestionIndex];
    setBookmarkedQuestions(newBookmarks);
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
    return (
      <ScoreCard 
        score={score} 
        total={currentQuestions.length} 
        questions={currentQuestions}
        attempts={currentQuestions.map((q, index) => ({
          questionId: q.id,
          selectedAnswer: index === currentQuestionIndex ? selectedAnswer : null,
          isCorrect: index === currentQuestionIndex ? selectedAnswer === q.correctAnswer : false,
        }))}
        onEnd={handleRestart}
      />
    );
  }

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 bg-background">
      <div className="container mx-auto p-6 h-full flex">
        <div className="w-20 mr-4 overflow-y-auto flex-shrink-0 bg-gray-100 rounded-lg">
          <div className="p-2 space-y-2">
            {questionAnswers.map((status, index) => (
              <div
                key={index}
                className={`
                  relative w-full aspect-square rounded-lg flex items-center justify-center font-medium
                  ${status === 'correct' ? 'bg-green-500 text-white' : ''}
                  ${status === 'incorrect' ? 'bg-red-500 text-white' : ''}
                  ${status === null ? 'bg-white border border-gray-200' : ''}
                `}
              >
                {bookmarkedQuestions[index] && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
                )}
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <ProgressBar current={currentQuestionIndex + 1} total={currentQuestions.length} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={handleBookmarkToggle}
                        className={`p-2 ${bookmarkedQuestions[currentQuestionIndex] ? 'text-yellow-500' : 'text-gray-400'}`}
                      >
                        <Bookmark className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{bookmarkedQuestions[currentQuestionIndex] ? 'Remove bookmark' : 'Bookmark this question'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

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
            onQuit={handleQuitClick}
            timerEnabled={timerEnabled}
            timeLimit={timePerQuestion}
            onTimeUp={handleAnswerTimeout}
          />
        </div>

        {showQuitDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="mb-4">Do you really want to end the quiz? This action is permanent.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleQuitCancel}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  No
                </button>
                <button
                  onClick={handleQuitConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
=======
    <QuizContent
      currentQuestion={currentQuestions[currentQuestionIndex]}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={currentQuestions.length}
      selectedAnswer={selectedAnswer}
      isAnswered={isAnswered}
      isPaused={isPaused}
      showExplanation={showExplanation}
      timerEnabled={timerEnabled}
      timePerQuestion={timePerQuestion}
      isMarked={isMarked}
      onAnswerClick={handleAnswerClick}
      onNavigate={handleQuizNavigation}
      onPause={handlePause}
      onQuit={handleQuit}
      onTimeUp={handleAnswerTimeout}
      onToggleMark={handleToggleMark}
    />
>>>>>>> 88f6c84dfb1cc2616ab66233fe3e38776a203f3e
  );
};

export default Index;
