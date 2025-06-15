
import { useEffect, useState, useCallback } from 'react';

interface TimerProps {
  timeLimit: number;
  isPaused: boolean;
  onTimeUp: () => void;
  resetKey: number; // New prop to trigger timer reset
}

const Timer = ({ timeLimit, isPaused, onTimeUp, resetKey }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Reset timer when resetKey changes (cleaner than timeLimit dependency)
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [resetKey, timeLimit]);

  // Optimized countdown - removed timeLeft from dependencies to prevent interval recreation
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onTimeUp]); // Removed timeLeft from dependencies

  // Handle time up when timeLeft reaches 0
  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  return (
    <div className="flex items-center gap-2 text-lg font-medium text-foreground dark:text-gray-200">
      <span className={timeLeft <= 10 ? "text-red-500" : ""}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
