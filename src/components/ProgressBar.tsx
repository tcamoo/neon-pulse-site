
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek, className = "" }) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    onSeek(newTime);
  };

  return (
    <div className={`w-full flex items-center gap-3 group ${className}`}>
      <span className="font-mono text-xs text-slate-400 w-10 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>
      
      <div className="relative flex-1 h-6 flex items-center">
        {/* Background Track */}
        <div className="absolute inset-0 h-1 bg-white/10 rounded-full top-1/2 -translate-y-1/2 overflow-hidden">
           {/* Filled Track */}
           <motion.div 
             className="h-full bg-gradient-to-r from-hot-pink to-electric-cyan relative"
             style={{ width: `${progress}%` }}
           >
              {/* Glow effect */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]"></div>
           </motion.div>
        </div>

        {/* Range Input (Invisible but interactive) */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>

      <span className="font-mono text-xs text-slate-400 w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;
