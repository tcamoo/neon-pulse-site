
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Share2, Music4, Disc, Info, ArrowUpRight, BarChart3 } from 'lucide-react';
import { Track, FeaturedAlbum } from '../types';

interface MusicSectionProps {
  tracks: Track[];
  featuredAlbum: FeaturedAlbum;
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onViewDetails: (track: Track) => void;
}

const Equalizer = ({ active }: { active: boolean }) => {
  if (!active) return <div className="h-4 w-4 bg-white/20 rounded-full"></div>;
  
  return (
    <div className="flex items-end gap-[3px] h-4">
      <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }} className="w-1 bg-hot-pink rounded-full" />
      <motion.div animate={{ height: [12, 6, 12] }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} className="w-1 bg-lime-punch rounded-full" />
      <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }} className="w-1 bg-electric-cyan rounded-full" />
      <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }} className="w-1 bg-white rounded-full" />
    </div>
  );
};

const MusicSection: React.FC<MusicSectionProps> = ({ tracks, featuredAlbum, currentTrackId, isPlaying, onPlayTrack, onViewDetails }) => {
  const [filter, setFilter] = useState<'all' | 'singles' | 'albums'>('all');

  return (
    <section id="music" className="py-32 px-6 relative overflow-hidden min-h-screen">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-indigo-900/20 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-0 top-1/4 w-px h-1/2 bg-gradient-to-b from-transparent via-electric-cyan/30 to-transparent"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
          <div>
             <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full border border-lime-punch/30 text-lime-punch text-[10px] font-mono font-bold uppercase tracking-widest bg-lime-punch/5">
                    Official Discography
                </span>
             </div>
             <h2 className="font-display font-black text-6xl md:text-8xl text-white leading-[0.85]">
                SONIC <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-purple-500 to-electric-cyan">ARCHIVE</span>
             </h2>
          </div>
          
          {/* Filters */}
          <div className="mt-8 md:mt-0 flex gap-2">
              {['all', 'singles', 'albums'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${filter === f ? 'bg-white text-midnight border-white' : 'bg-transparent text-slate-500 border-white/10 hover:border-white/30 hover:text-white'}`}
                  >
                      {f}
                  </button>
              ))}
          </div>
        </div>

        {/* Featured Album Spotlight - Dynamic */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24 relative"
        >
            <div className="absolute -top-10 -left-10 text-white/5 font-display font-black text-9xl z-0 select-none">FEATURED</div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
                {/* Cover Art */}
                <div className="lg:col-span-5 relative group">
                    <div className="aspect-square rounded-xl overflow-hidden shadow-2xl shadow-black/50 relative">
                        <img src={featuredAlbum.coverUrl} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        
                        {/* Vinyl overlay effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)] opacity-40 mix-blend-multiply"></div>
                        
                        <div className="absolute bottom-6 left-6">
                             <div className="inline-block px-3 py-1 bg-hot-pink text-white text-xs font-bold uppercase tracking-widest mb-2">Recommended</div>
                             <h3 className="text-4xl font-display font-black text-white">{featuredAlbum.title}</h3>
                        </div>
                    </div>
                    {/* Decorative Disc sliding out */}
                    <div className="absolute top-4 bottom-4 right-4 w-full rounded-full bg-black -z-10 translate-x-2 group-hover:translate-x-16 transition-transform duration-500 flex items-center justify-center border-[10px] border-gray-900 shadow-xl">
                        <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-tr from-hot-pink to-purple-600 animate-spin-slow"></div>
                    </div>
                </div>

                {/* Info */}
                <div className="lg:col-span-7 flex flex-col justify-center pl-0 lg:pl-10">
                    <div className="flex items-center gap-4 mb-6 text-slate-400 font-mono text-sm">
                        <span>{featuredAlbum.type}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span className="flex items-center gap-1"><BarChart3 size={14} /> Trending Now</span>
                    </div>
                    <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-sans mb-10">
                        "{featuredAlbum.description}" <br/> 
                        <span className="text-slate-500 text-base mt-2 block">Available on all major streaming platforms.</span>
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="px-8 py-4 bg-white text-midnight font-bold rounded-full hover:bg-electric-cyan transition-colors flex items-center gap-2">
                            <Play size={18} fill="currentColor" /> Listen Full Album
                        </button>
                        <button className="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center gap-2">
                            <Heart size={18} /> Save
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Track List */}
        <div className="grid grid-cols-1 gap-4">
          {tracks.length === 0 ? (
             <div className="text-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                <Disc size={48} className="text-slate-600 opacity-50" />
                <p className="text-slate-400 font-sans text-lg">暂无发布作品，请在后台添加。</p>
             </div>
          ) : (
             tracks.map((track, index) => {
                const isActive = currentTrackId === track.id;
                const isCurrentlyPlaying = isActive && isPlaying;

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative rounded-2xl p-4 transition-all duration-500 border ${isActive ? 'bg-white/10 border-hot-pink/50 shadow-[0_0_30px_rgba(255,0,128,0.15)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                  >
                     <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        
                        {/* Mini Cover */}
                        <div className="relative shrink-0 cursor-pointer w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden group/cover" onClick={() => onPlayTrack(track)}>
                           <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover opacity-80 group-hover/cover:scale-110 transition-transform duration-500" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                               {isCurrentlyPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                           </div>
                        </div>

                        {/* Track Info */}
                        <div 
                          className="flex-grow text-center md:text-left w-full cursor-pointer group/info" 
                          onClick={() => onViewDetails(track)}
                        >
                           <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                              <Equalizer active={isCurrentlyPlaying} />
                              <h3 className={`font-display font-bold text-xl md:text-2xl transition-colors flex items-center gap-3 ${isActive ? 'text-hot-pink' : 'text-white group-hover/info:text-electric-cyan'}`}>
                                 {track.title}
                              </h3>
                           </div>
                           
                           <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-sans tracking-wider">
                              <span className="text-slate-400">{track.artist}</span>
                              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                              <span className="text-slate-500">{track.album}</span>
                           </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end px-4 md:px-0">
                           <div className="font-mono text-sm text-slate-500">{track.duration}</div>
                           
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 rounded-full hover:bg-white/20 text-white transition-colors" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {e.stopPropagation(); onViewDetails(track)}}>
                                    <Info size={18} />
                                </button>
                                <button className="p-2 rounded-full hover:text-hot-pink text-slate-400 transition-colors">
                                    <Heart size={18} />
                                </button>
                           </div>
                        </div>

                     </div>
                  </motion.div>
                );
             })
          )}
        </div>

        <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-2 text-electric-cyan font-mono text-sm font-bold uppercase hover:text-white transition-colors group">
                View All Releases <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>

      </div>
    </section>
  );
};

export default MusicSection;
