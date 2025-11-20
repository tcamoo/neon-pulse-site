
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Maximize2, X } from 'lucide-react';
import { Track } from '../types';
import ProgressBar from './ProgressBar';

interface GlobalPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
  onClose: () => void;
  onOpenDetail: () => void;
}

const GlobalPlayer: React.FC<GlobalPlayerProps> = ({ 
  track, isPlaying, currentTime, duration, onPlayToggle, onSeek, onClose, onOpenDetail 
}) => {
  if (!track) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-midnight/90 backdrop-blur-xl border-t border-white/10 z-40 px-4 py-3 md:py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4 md:gap-8">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 min-w-0 w-1/3 md:w-1/4 cursor-pointer group" onClick={onOpenDetail}>
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded overflow-hidden shrink-0 border border-white/10 group-hover:border-hot-pink/50 transition-colors">
             <img src={track.coverUrl} alt={track.title} className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse' : ''}`} />
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={16} className="text-white" />
             </div>
          </div>
          <div className="min-w-0 hidden sm:block">
             <div className="font-display font-bold text-white truncate leading-tight group-hover:text-hot-pink transition-colors">{track.title}</div>
             <div className="text-xs text-slate-400 truncate">{track.artist}</div>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex-1 flex flex-col items-center max-w-xl">
           <div className="flex items-center gap-6 mb-1 md:mb-2">
              <button className="text-slate-400 hover:text-white transition-colors"><SkipBack size={20} /></button>
              <button 
                onClick={(e) => { e.stopPropagation(); onPlayToggle(); }}
                className="w-10 h-10 rounded-full bg-white text-midnight flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                 {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button className="text-slate-400 hover:text-white transition-colors"><SkipForward size={20} /></button>
           </div>
           <div className="w-full hidden md:block">
              <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
           </div>
        </div>

        {/* Mobile Progress (Simple) */}
        <div className="md:hidden absolute bottom-0 left-0 w-full h-1 bg-white/10">
            <div 
                className="h-full bg-hot-pink transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
            />
        </div>

        {/* Close / Volume (Placeholder) */}
        <div className="w-1/3 md:w-1/4 flex justify-end">
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors md:hidden">
                <X size={20} />
            </button>
            {/* Desktop Volume placeholder could go here */}
        </div>

      </div>
    </motion.div>
  );
};

export default GlobalPlayer;
