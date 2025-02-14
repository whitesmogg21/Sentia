
import { useEffect, useState } from 'react';

interface TimerProps {
  timeLimit: number;
  isPaused: boolean;
  onTimeUp: () => void;
}

const Timer = ({ timeLimit, isPaused, onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Reset timer when timeLimit changes
  useEffect(() => {
  setTimeLeft(timeLimit);
}, [timeLimit, isPaused]); // ✅ Also watch `isPaused` in case the quiz is resumed

useEffect(() => {
  if (!isPaused && timeLeft > 0) { // ✅ Ensure the countdown only starts if timeLeft is > 0
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
}, [isPaused, timeLeft, onTimeUp]); // ✅ Added `timeLeft` to ensure proper updates

  return (
    <div className="flex items-center gap-2 text-lg font-medium">
      <span className={timeLeft <= 10 ? "text-red-500" : ""}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
