
import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress = ({ value, size = 100, strokeWidth = 10 }: CircularProgressProps) => {
  // Ensure value is between 0 and 100
  const percentage = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (percentage / 100) * circumference;
  
  // Determine stroke color based on performance
  const getStrokeColor = () => {
    if (percentage >= 80) return '#22c55e'; // Green for excellent performance
    if (percentage >= 60) return '#0EA5E9'; // Blue for good performance
    if (percentage >= 40) return '#eab308'; // Yellow for moderate performance
    return '#ef4444'; // Red for needs improvement
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none stroke-[#F1F0FB] dark:stroke-gray-800"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle with dynamic color */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ 
            duration: 1,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;
