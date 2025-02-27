import { useEffect, useState, useCallback } from 'react';

interface TimerProps {
  timeLimit: number;
  isPaused: boolean;
  onTimeUp: () => void;
}

const Timer = ({ timeLimit, isPaused, onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Reset timer when timeLimit changes or component mounts
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  // Handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isPaused, timeLeft, onTimeUp]);

  return (
    <div className="flex items-center gap-2 text-lg font-medium text-foreground dark:text-gray-200">
      <span className={timeLeft <= 10 ? "text-red-500" : ""}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
