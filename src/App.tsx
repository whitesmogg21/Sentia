
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import SelectQBank from './pages/SelectQBank';
import Dashboard from './components/Dashboard';
import History from './pages/History';
import QBanks from './pages/QBanks';
import { QBank, QuizHistory } from './types/quiz';
import { qbanks } from './data/questions';
import Performance from './pages/Performance';
import NotFound from './pages/NotFound';

function App() {
  const [selectedQBankId, setSelectedQBankId] = useState<string | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('quizHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setQuizHistory(parsedHistory);
        }
      } catch (error) {
        console.error('Error parsing quiz history:', error);
      }
    }
  }, []);

  const handleQuizComplete = (newQuizHistory: QuizHistory) => {
    const updatedHistory = [...quizHistory, newQuizHistory];
    setQuizHistory(updatedHistory);
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
  };

  const handleStartQuiz = (qbankId: string) => {
    setSelectedQBankId(qbankId);
  };

  const mockQuestionAttempt = {
    questionId: 1,
    selectedAnswer: 0,
    isCorrect: true,
    date: new Date().toISOString(),
    isFlagged: false,
    tags: ['mock']
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <SelectQBank
                qbanks={qbanks}
                onStartQuiz={handleStartQuiz}
                quizHistory={quizHistory}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                qbanks={qbanks}
                quizHistory={quizHistory}
                onStartQuiz={handleStartQuiz}
              />
            }
          />
          <Route
            path="/history"
            element={<History quizHistory={quizHistory} qbanks={qbanks} />}
          />
          <Route
            path="/qbanks"
            element={<QBanks qbanks={qbanks} />}
          />
          <Route
            path="/performance"
            element={<Performance quizHistory={quizHistory} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
