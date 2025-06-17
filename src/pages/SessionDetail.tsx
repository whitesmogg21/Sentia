// import React, { useMemo, useEffect, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import QuizContent from "@/components/quiz/QuizContent";
// import { useQuiz } from "@/hooks/quiz";
// type Props = {};

// function SessionDetail({}: Props) {
//   const hasInitializedReview = useRef(false);
//   const { 
//     handleReviewHistory,
//     currentQuestionIndex,
//     score,
//     showScore,
//     selectedAnswer,
//     isAnswered,
//     inQuiz,
//     currentQuestions,
//     showExplanation,
//     isPaused,
//     timerEnabled,
//     timePerQuestion,
//     isFlagged,
//     handleStartQuiz,
//     handleAnswerTimeout,
//     handleAnswerClick,
//     handleQuit,
//     handlePause,
//     handleRestart,
//     handleQuizNavigation,
//     handleToggleFlag,
//     jumpToQuestion
//    } = useQuiz({});
//   const location = useLocation();
//   const navigation = useNavigate();
//   const quiz = location.state?.quiz;

//   const questionLibrary = JSON.parse(localStorage.getItem("questionLibrary"));

//   const questionIdInQuiz = quiz?.questionAttempts?.map(
//     (question) => question.questionId
//   );


//   const questionsWithAttempts = useMemo(() => {
//     if (!questionLibrary || !quiz?.questionAttempts) return [];
  
//     const attemptMap = new Map(
//       quiz.questionAttempts.map((attempt) => [attempt.questionId, attempt])
//     );
  
//     return questionLibrary
//       .flatMap((tag) => tag.questions)
//       .filter((question) => questionIdInQuiz.includes(question.id))
//       .map((question) => ({
//         question,
//         attempt: attemptMap.get(question.id),
//       }));
//   }, [questionLibrary, quiz]);

//   useEffect(() => {
//     if (questionsWithAttempts.length > 0 && !hasInitializedReview.current) {
//       handleReviewHistory(questionsWithAttempts);
//       hasInitializedReview.current = true;
//     }
//   }, [questionsWithAttempts]);

//   return (
//     <>
// {
//   inQuiz && (
    // <QuizContent
    //   currentQuestion={currentQuestions[currentQuestionIndex]}
    //   currentQuestionIndex={currentQuestionIndex}
    //   totalQuestions={currentQuestions.length}
    //   selectedAnswer={selectedAnswer}
    //   isAnswered={isAnswered}
    //   isPaused={isPaused}
    //   showExplanation={showExplanation}
    //   timerEnabled={timerEnabled}
    //   sessionTimeLimit={0}
    //   timePerQuestion={timePerQuestion}
    //   isFlagged={isFlagged}
    //   onAnswerClick={handleAnswerClick}
    //   onNavigate={handleQuizNavigation}
    //   onPause={()=>{}}
    //   onQuit={()=>{navigation('/')}}
    //   onTimeUp={handleAnswerTimeout}
    //   onToggleFlag={()=>{}}
    //   onJumpToQuestion={jumpToQuestion}
    // />
//   )
// }

//     </>
//   );
// }

// export default SessionDetail;


import React, { useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizContent from "@/components/quiz/QuizContent";
// import { useQuiz } from "@/hooks/quiz";
import { useReviewHistoryQuiz } from "@/hooks/quiz/useQuizHistory";
interface SessionDetailProps {
  onQuizStart: () => void;
  onQuizEnd: () => void;
}
function SessionDetail({onQuizStart, onQuizEnd}:SessionDetailProps) {
  // const {handleStartQuiz, inQuiz} = useQuiz({});
  const reviewHook = useReviewHistoryQuiz();
  // const {
  //   handleStartQuiz,
  //   handleReviewHistory,
  //   currentQuestionIndex,
  //   selectedAnswer,
  //   isAnswered,
  //   inQuiz,
  //   currentQuestions,
  //   showExplanation,
  //   isPaused,
  //   timerEnabled,
  //   timePerQuestion,
  //   isFlagged,
  //   handleAnswerClick,
  //   handleQuizNavigation,
  //   handlePause,
  //   handleQuit,
  //   handleAnswerTimeout,
  //   handleToggleFlag,
  //   jumpToQuestion
  // } = hookOutput;

  // console.log(hookOutput)

  const location = useLocation();
  const navigation = useNavigate();
  const quiz = location.state?.quiz;


  const hasInitializedReview = useRef(false);

  const questionLibrary = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("questionLibrary")) || [];
    } catch (e) {
      console.error("Failed to parse questionLibrary from localStorage:", e);
      return [];
    }
  }, []);

  const questionIdInQuiz = useMemo(() => {
    return quiz?.questionAttempts?.map((q) => q.questionId) || [];
  }, [quiz]);


  const questionsWithAttempts = useMemo(() => {
    if (!questionLibrary.length || !quiz?.questionAttempts) return [];

    const attemptMap = new Map(
      quiz.questionAttempts.map((attempt) => [attempt.questionId, attempt])
    );
  console.log(attemptMap)

    // return questionLibrary
    //   .flatMap((tag) => tag.questions)
    //   // add a duplicate checking filter as well so that 
    //   .filter((question) => questionIdInQuiz.includes(question.id))
    //   .map((question) => ({
    //     question,
    //     attempt: attemptMap.get(question.id),
    //   }));

    return questionLibrary
  .flatMap((tag) => tag.questions)
  .filter((question, index, self) => {
    // Keep only the first occurrence of each question.id
    return index === self.findIndex(q => q.id === question.id);
  })
  .filter((question) => questionIdInQuiz.includes(question.id))
  .map((question) => ({
    question,
    attempt: attemptMap.get(question.id),
  }));

  }, [questionLibrary, quiz, questionIdInQuiz]);


  // useEffect(() => {
  //   if (questionsWithAttempts.length > 0 && !hasInitializedReview.current) {
  //     handleReviewHistory(questionsWithAttempts);
  //     hasInitializedReview.current = true;
  //   }
  // }, [questionsWithAttempts]);

  // useEffect(()=>{
  // },[])
  useEffect(() => {
    if (questionsWithAttempts.length > 0) {
      // handleStartQuiz(
      //   "REVIEW_SESSION",
      //   questionsWithAttempts,
      //   true,  // tutor mode ON
      //   false, // timer OFF
      //   0      // time limit irrelevant in review
      // );
      // handleReviewHistory(questionsWithAttempts); // this modifies global state
      reviewHook.startReview(questionsWithAttempts);
    onQuizStart()

      // console.log(inQuiz)
    }
  }, [questionsWithAttempts]);

  // useEffect(() => {
  //   if (
  //     !hasStarted.current &&
  //     questionsWithAttempts.length > 0 &&
  //     quiz
  //   ) {
  //     // Use the full quiz start function for history mode
  //     handleStartQuiz(
  //       "REVIEW_SESSION",
  //       questionsWithAttempts,
  //       true,  // tutor mode ON
  //       false, // timer OFF
  //       0      // time limit irrelevant in review
  //     );
  //     hasStarted.current = true;
  //   }
  // }, [questionsWithAttempts, quiz]);
  

  if (!questionsWithAttempts) {
    return <div className="p-6 text-red-600">No quiz data found.</div>;
  }

  return (
    <>
      {reviewHook.inReview ? (
    // <QuizContent
    //   currentQuestion={currentQuestions[currentQuestionIndex]}
    //   currentQuestionIndex={currentQuestionIndex}
    //   totalQuestions={currentQuestions.length}
    //   selectedAnswer={selectedAnswer}
    //   isAnswered={isAnswered}
    //   isPaused={isPaused}
    //   showExplanation={showExplanation}
    //   timerEnabled={timerEnabled}
    //   sessionTimeLimit={0}
    //   timePerQuestion={timePerQuestion}
    //   isFlagged={isFlagged}
    //   onAnswerClick={handleAnswerClick}
    //   onNavigate={handleQuizNavigation}
    //   onPause={()=>{}}
    //   onQuit={()=>{navigation('/')}}
    //   onTimeUp={handleAnswerTimeout}
    //   onToggleFlag={()=>{}}
    //   onJumpToQuestion={jumpToQuestion}
    // />

    <QuizContent
    currentQuestion={reviewHook.currentQuestion}
    currentQuestionIndex={reviewHook.currentIndex}
    totalQuestions={reviewHook.totalQuestions}
    selectedAnswer={reviewHook.currentAttempt?.selectedAnswer ?? null}
    isAnswered={true}
    isPaused={false}
    showExplanation={reviewHook.showExplanation}
    timerEnabled={false}
    sessionTimeLimit={0}
    timePerQuestion={0}
    isFlagged={false}
    onAnswerClick={() => {}} // Disable answer change in review
    onNavigate={(dir) => {
      if (dir === "next") reviewHook.goToNext();
      else reviewHook.goToPrev();
    }}
    onPause={() => {}}
    onQuit={() => {navigation("/history"); onQuizEnd()}}
    onTimeUp={() => {}}
    onToggleFlag={() => {}}
    onJumpToQuestion={reviewHook.jumpTo}
    questionsWithAttempts = {questionsWithAttempts}
    tutorMode={true}
  />
      ) : (
        <div className="p-6 text-red-600">No quiz data found.</div>
      )}
    </>
  );
}

export default SessionDetail;
