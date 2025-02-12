
import { useEffect, useState } from 'react';

interface TimerProps {
  timeLimit: number;
  isPaused: boolean;
  onTimeUp: () => void;
}

const Timer = ({ timeLimit, isPaused, onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, timeLeft, onTimeUp]);

  return (
    <div className="flex items-center gap-2 text-lg font-medium">
      <span className={timeLeft <= 10 ? "text-red-500" : ""}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer; 
