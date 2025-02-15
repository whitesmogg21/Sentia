
import { motion } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
}

const CircularProgress = ({ percentage }: CircularProgressProps) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const correctOffset = circumference - (percentage / 100) * circumference;
  const incorrectOffset = circumference - ((100 - percentage) / 100) * circumference;

  return (
    <div className="relative w-64 h-64">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none stroke-[#F1F0FB]"
          strokeWidth="12"
        />
        {/* Incorrect segment (red) */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none stroke-[#ea384c]"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: incorrectOffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        {/* Correct segment (green) */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none stroke-[#0EA5E9]"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: correctOffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-[#222222]">
          {Math.round(percentage)}%
        </span>
        <span className="text-sm text-gray-500">Correct</span>
      </div>
    </div>
  );
};

export default CircularProgress;
