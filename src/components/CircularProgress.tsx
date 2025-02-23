
import { motion } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
  size?: 'small' | 'large';
}

const CircularProgress = ({ percentage, size = 'small' }: CircularProgressProps) => {
  // Round to 2 decimal places for display
  const displayPercentage = Number(percentage.toFixed(2));
  const radius = size === 'small' ? 45 : 90;
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
    <div className={`relative ${size === 'small' ? 'w-32 h-32' : 'w-64 h-64'}`}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none stroke-[#F1F0FB]"
          strokeWidth="12"
        />
        {/* Progress circle with dynamic color */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none"
          stroke={getStrokeColor()}
          strokeWidth="12"
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
        <span className={`${size === 'small' ? 'text-2xl' : 'text-4xl'} font-bold text-[#222222]`}>
          {displayPercentage}%
        </span>
        <span className="text-sm text-gray-500">Accuracy</span>
      </div>
    </div>
  );
};

export default CircularProgress;
