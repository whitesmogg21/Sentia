// import { useEffect, useState, useCallback } from 'react';

// interface TimerProps {
//   timeLimit: number;
//   isPaused: boolean;
//   onTimeUp: () => void;
// }

// const Timer = ({ timeLimit, isPaused, onTimeUp }: TimerProps) => {
//   const [timeLeft, setTimeLeft] = useState(timeLimit);

//   // Reset timer when timeLimit changes or component mounts
//   useEffect(() => {
//     setTimeLeft(timeLimit);
//   }, [timeLimit]);

//   // Handle countdown
//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     if (!isPaused && timeLeft > 0) {
//       timer = setInterval(() => {
//         setTimeLeft((prev) => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             onTimeUp();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       if (timer) {
//         clearInterval(timer);
//       }
//     };
//   }, [isPaused, timeLeft, onTimeUp]);

//   return (
//     <div className="flex items-center gap-2 text-lg font-medium text-foreground dark:text-gray-200">
//       <span className={timeLeft <= 10 ? "text-red-500" : ""}>
//         {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
//       </span>
//     </div>
//   );
// };

// export default Timer;



import { useEffect, useState } from 'react';

interface TimerProps {
  timeLimit?: number;           // optional per-question timer
  sessionTimeLimit?: number;
  sessionTimerToggle: boolean;    // optional overall session timer
  isPaused: boolean;
  onTimeUp?: () => void;       // optional callback for question time up
  onQuit?: () => void;         // optional callback for session time up
}

const Timer = ({ 
  timeLimit, 
  sessionTimeLimit, 
  sessionTimerToggle,
  isPaused, 
  onTimeUp = () => {}, 
  onQuit = () => {} 
}: TimerProps) => {
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionTimeLimit ? sessionTimeLimit * 60 : 0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(timeLimit || 0);

  console.log(timeLimit, sessionTimeLimit)

  // Initialize/reset session timer when sessionTimeLimit changes
  useEffect(() => {
    if (sessionTimerToggle) {
      setSessionTimeLeft(sessionTimeLimit * 60);
    }
  }, [sessionTimeLimit]);

  // Initialize/reset question timer when timeLimit changes
  useEffect(() => {
    if (timeLimit) {
      setQuestionTimeLeft(timeLimit);
    }
  }, [timeLimit]);

  // Session timer countdown - only runs if sessionTimeLimit is provided
  useEffect(() => {
    if (sessionTimeLimit === undefined) return;
    if (sessionTimerToggle === false) return;
    
    let sessionTimer: NodeJS.Timeout;

    if (!isPaused && sessionTimeLeft > 0) {
      sessionTimer = setInterval(() => {
        setSessionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(sessionTimer);
            onQuit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(sessionTimer);
  }, [isPaused, sessionTimeLeft, sessionTimeLimit, onQuit]);

  // Per-question timer countdown - only runs if timeLimit is provided
  useEffect(() => {
    if (timeLimit === undefined) return;
    
    let questionTimer: NodeJS.Timeout;

    if (!isPaused && questionTimeLeft > 0) {
      questionTimer = setInterval(() => {
        setQuestionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(questionTimer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(questionTimer);
  }, [isPaused, questionTimeLeft, timeLimit, onTimeUp]);

  // Helper to format time
  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-1 text-lg font-medium text-foreground dark:text-gray-200 select-none">
      {sessionTimerToggle !== false && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Session Timer:</span>
          <span className={sessionTimeLeft <= 10 ? 'text-red-500' : ''}>
            {formatTime(sessionTimeLeft)}
          </span>
        </div>
      )}

      {timeLimit !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Question Timer:</span>
          <span className={questionTimeLeft <= 10 ? 'text-red-500' : ''}>
            {formatTime(questionTimeLeft)}
          </span>
        </div>
      )}
    </div>
  );
};

export default Timer;