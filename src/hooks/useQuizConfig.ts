
import { useState } from 'react';
import { useQBankStore } from '@/store/qbank/qbankStore';
import { useQuizStore } from '@/store/quiz/quizStore';
import { toast } from '@/components/ui/use-toast';

export const useQuizConfig = () => {
  const [tutorMode, setTutorMode] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  
  const { 
    selectedQBank, 
    questionCount,
    setQuestionCount,
    filteredQuestions 
  } = useQBankStore();
  
  const { startQuiz } = useQuizStore();
  
  const handleStartQuiz = () => {
    if (!selectedQBank) {
      toast({
        title: "No question bank selected",
        description: "Please select a question bank before starting a quiz",
        variant: "destructive"
      });
      return;
    }
    
    if (questionCount <= 0) {
      toast({
        title: "Invalid question count",
        description: "Please select at least one question",
        variant: "destructive"
      });
      return;
    }
    
    if (filteredQuestions.length === 0) {
      // No filtered questions, use all questions
      if (questionCount > selectedQBank.questions.length) {
        toast({
          title: "Invalid question count",
          description: "The selected number of questions exceeds the available questions",
          variant: "destructive"
        });
        return;
      }
      
      // Randomly select questions
      const randomQuestions = [...selectedQBank.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
      
      startQuiz(randomQuestions, tutorMode, timerEnabled, timeLimit);
    } else {
      // Use filtered questions
      if (questionCount > filteredQuestions.length) {
        toast({
          title: "Invalid question count",
          description: "The selected number of questions exceeds the available questions in the filtered set",
          variant: "destructive"
        });
        return;
      }
      
      // Randomly select questions from filtered set
      const randomQuestions = [...filteredQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
      
      startQuiz(randomQuestions, tutorMode, timerEnabled, timeLimit);
    }
  };
  
  return {
    tutorMode,
    setTutorMode,
    timerEnabled,
    setTimerEnabled,
    timeLimit,
    setTimeLimit,
    questionCount,
    setQuestionCount,
    handleStartQuiz
  };
};
