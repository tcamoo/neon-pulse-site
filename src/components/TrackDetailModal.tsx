
import React from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, Disc, Clock, Music, Share2, Heart } from 'lucide-react';
import type { Track } from '../types';
import ProgressBar from './ProgressBar';

interface TrackDetailModalProps {
  track: Track;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  onClose: () => void;
  onPlayToggle: () => void;
  onSeek?: (time: number) => void;
}

const TrackDetailModal: React.FC<TrackDetailModalProps> = ({ 
    track, isPlaying, currentTime = 0, duration = 0, onClose, onPlayToggle, onSeek 
}) => {
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
    >
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl" 
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl h-[90vh] md:h-[85vh] bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={handleContainerClick}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-white/20 transition-all"
        >
          <X size={24} />
        </button>

        {/* Left Side: Visuals & Player Controls */}
        {/* Mobile: Flex column, centered. Desktop: Flex column, aligned left/bottom */}
        <div className="w-full md:w-[45%] h-auto md:h-full relative flex flex-col justify-center md:justify-end p-6 md:p-10 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-surface/50 to-midnight">
            
            {/* Background Image Blurry (Desktop Only mostly) */}
            <div className="absolute inset-0 z-0 hidden md:block">
                <img src={track.coverUrl} alt="" className="w-full h-full object-cover opacity-30 blur-3xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center md:items-start w-full max-h-full overflow-y-auto md:overflow-visible no-scrollbar">
                {/* Cover Image - Responsive Scaling */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative mb-6 md:mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden border border-white/10
                               w-[70vw] max-w-[300px] aspect-square md:w-80 md:h-80"
                >
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    {/* Play Overlay */}
                    <button 
                        onClick={onPlayToggle}
                        className="absolute inset-0 bg-black/30 flex items-center justify-center group/btn transition-colors"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                            {isPlaying ? <Pause size={32} fill="white" className="text-white" /> : <Play size={32} fill="white" className="text-white ml-1" />}
                        </div>
                    </button>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center md:text-left w-full"
                >
                    <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-none mb-2 break-words px-2">
                        {track.title}
                    </h2>
                    <p className="text-lg md:text-2xl text-hot-pink font-sans font-bold mb-6">
                        {track.artist}
                    </p>

                    {/* Progress Bar within Modal */}
                    {onSeek && (
                        <div className="mb-6 w-full px-1">
                            <ProgressBar 
                                currentTime={currentTime} 
                                duration={duration} 
                                onSeek={onSeek} 
                            />
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 text-[10px] md:text-sm font-mono text-slate-400 uppercase tracking-widest mb-6 md:mb-8">
                        <div className="flex items-center gap-1 md:gap-2 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/5">
                            <Disc size={12} /> <span className="truncate max-w-[100px] md:max-w-none">{track.album}</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/5">
                            <Clock size={12} /> {track.duration}
                        </div>
                        <div className="hidden md:flex items-center gap-1 md:gap-2 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/5">
                            <Music size={12} /> {track.plays.toLocaleString()}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center md:justify-start gap-3 md:gap-4 pb-4 md:pb-0">
                        <button 
                            onClick={onPlayToggle}
                            className="flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-3 bg-lime-punch text-midnight rounded-full font-bold hover:bg-white transition-colors shadow-[0_0_20px_rgba(217,249,157,0.3)] text-xs md:text-base"
                        >
                            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            {isPlaying ? 'PAUSE' : 'PLAY'}
                        </button>
                        <button className="p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                            <Heart size={18} />
                        </button>
                        <button className="p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                            <Share2 size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Right Side: Lyrics & Info */}
        {/* Mobile: Remaining height. Desktop: Full height. */}
        <div className="flex-1 h-full bg-[#0a0f1d] overflow-y-auto relative custom-scrollbar">
            <div className="p-6 md:p-16 pb-24 md:pb-16">
                <div className="flex items-center gap-4 mb-6 md:mb-10">
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-white/20"></div>
                    <h3 className="font-mono text-xs md:text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">Lyrics</h3>
                    <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-white/20"></div>
                </div>

                {track.lyrics ? (
                    <div className="space-y-6 text-center md:text-left pb-10">
                        {track.lyrics.split('\n\n').map((block, i) => (
                            <div key={i} className="space-y-2">
                                {block.split('\n').map((line, j) => (
                                    <p key={j} className={`text-base md:text-xl transition-colors font-sans leading-relaxed ${isPlaying ? 'text-white shadow-white drop-shadow-md' : 'text-slate-500'}`}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 md:h-64 text-slate-500 space-y-4 opacity-50">
                        <Music size={32} />
                        <p className="font-mono text-xs md:text-sm uppercase tracking-widest">Instrumental / No Lyrics</p>
                    </div>
                )}

                <div className="mt-10 md:mt-20 pt-8 border-t border-white/5">
                    <h3 className="font-mono text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Credits</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs md:text-sm text-slate-400">
                        <div>
                            <span className="block text-slate-600 text-[10px] mb-1">Artist</span>
                            {track.artist}
                        </div>
                        <div>
                            <span className="block text-slate-600 text-[10px] mb-1">Album</span>
                            {track.album}
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default TrackDetailModal;
