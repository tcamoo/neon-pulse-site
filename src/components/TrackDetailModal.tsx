
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-midnight/80 backdrop-blur-xl" 
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl h-[90vh] bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={handleContainerClick}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-white/20 hover:rotate-90 transition-all"
        >
          <X size={24} />
        </button>

        {/* Left Side: Visuals */}
        <div className="w-full md:w-[45%] h-[40vh] md:h-full relative overflow-hidden flex flex-col justify-end p-8 group">
            {/* Background Image Blurry */}
            <div className="absolute inset-0 z-0">
                <img src={track.coverUrl} alt="" className="w-full h-full object-cover opacity-40 blur-3xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center md:items-start w-full">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-64 h-64 md:w-80 md:h-80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden mb-8 border border-white/10 relative"
                >
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    {/* Play Overlay */}
                    <button 
                        onClick={onPlayToggle}
                        className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center group/btn"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                            {isPlaying ? <Pause size={40} fill="white" className="text-white" /> : <Play size={40} fill="white" className="text-white ml-2" />}
                        </div>
                    </button>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center md:text-left w-full"
                >
                    <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-none mb-2 break-words">
                        {track.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-hot-pink font-sans font-bold mb-6">
                        {track.artist}
                    </p>

                    {/* Progress Bar within Modal */}
                    {onSeek && (
                        <div className="mb-6 w-full px-2">
                            <ProgressBar 
                                currentTime={currentTime} 
                                duration={duration} 
                                onSeek={onSeek} 
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-mono text-slate-400 uppercase tracking-widest mb-8">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Disc size={14} /> {track.album}
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Clock size={14} /> {track.duration}
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Music size={14} /> {track.plays.toLocaleString()} Plays
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-start gap-4">
                        <button 
                            onClick={onPlayToggle}
                            className="flex items-center gap-3 px-8 py-3 bg-lime-punch text-midnight rounded-full font-bold hover:bg-white transition-colors shadow-[0_0_20px_rgba(217,249,157,0.3)]"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                            {isPlaying ? 'PAUSE' : 'PLAY NOW'}
                        </button>
                        <button className="p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                            <Heart size={20} />
                        </button>
                        <button className="p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Right Side: Lyrics & Info */}
        <div className="w-full md:w-[55%] h-[60vh] md:h-full bg-[#0a0f1d] overflow-y-auto relative custom-scrollbar border-t md:border-t-0 md:border-l border-white/10">
            <div className="p-8 md:p-16">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-white/20"></div>
                    <h3 className="font-mono text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">Lyrics</h3>
                    <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-white/20"></div>
                </div>

                {track.lyrics ? (
                    <div className="space-y-6 text-center md:text-left">
                        {track.lyrics.split('\n\n').map((block, i) => (
                            <div key={i} className="space-y-2">
                                {block.split('\n').map((line, j) => (
                                    <p key={j} className={`text-lg md:text-xl transition-colors font-sans leading-relaxed ${isPlaying ? 'text-white shadow-white drop-shadow-md' : 'text-slate-300'}`}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-4 opacity-50">
                        <Music size={48} />
                        <p className="font-mono text-sm uppercase tracking-widest">Instrumental / No Lyrics Available</p>
                    </div>
                )}

                <div className="mt-20 pt-10 border-t border-white/5">
                    <h3 className="font-mono text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Credits</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                        <div>
                            <span className="block text-slate-600 text-xs mb-1">Performed by</span>
                            {track.artist}
                        </div>
                        <div>
                            <span className="block text-slate-600 text-xs mb-1">Album</span>
                            {track.album}
                        </div>
                        <div>
                            <span className="block text-slate-600 text-xs mb-1">Written by</span>
                            ECHO, Neon-X
                        </div>
                        <div>
                            <span className="block text-slate-600 text-xs mb-1">Produced by</span>
                            Future Sounds Lab
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
