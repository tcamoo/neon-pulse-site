
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Disc, Info, Plus, AudioWaveform, ListMusic } from 'lucide-react';
import type { Track, FeaturedAlbum } from '../types';

interface MusicSectionProps {
  tracks: Track[];
  featuredAlbum: FeaturedAlbum;
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onViewDetails: (track: Track) => void;
}

// Audio Viz Bar Component
const MiniViz = ({ active }: { active: boolean }) => (
    <div className="flex items-end gap-[2px] h-4 w-4">
        {[...Array(4)].map((_, i) => (
            <motion.div 
                key={i}
                className="w-1 bg-lime-punch"
                animate={active ? { height: ['20%', '100%', '50%', '80%'] } : { height: '20%' }}
                transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.1 }}
            />
        ))}
    </div>
);

const MusicSection: React.FC<MusicSectionProps> = ({ tracks, featuredAlbum, currentTrackId, isPlaying, onPlayTrack, onViewDetails }) => {
  const [filter, setFilter] = useState<'all' | 'singles' | 'albums'>('all');

  return (
    <section id="music" className="py-32 px-6 relative z-10">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
             <h2 className="font-display font-black text-5xl md:text-7xl text-white leading-none mb-2">
                SONIC <span className="text-stroke-accent text-transparent">ARCHIVE</span>
             </h2>
             <div className="h-1 w-24 bg-hot-pink mt-4"></div>
          </div>
          
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-md backdrop-blur-sm">
              {['all', 'singles', 'albums'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-6 py-2 text-xs font-mono font-bold uppercase transition-all rounded-sm ${filter === f ? 'bg-lime-punch text-midnight shadow-[0_0_10px_rgba(204,255,0,0.5)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                  >
                      {f}
                  </button>
              ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Featured Album - CD Case Style */}
            <div className="lg:col-span-4">
                <div className="sticky top-32">
                    <h3 className="text-xs font-mono font-bold text-hot-pink uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Disc className="animate-spin-slow" size={14} /> Latest Release
                    </h3>
                    
                    <div className="group relative bg-surface border border-white/10 p-4 rounded-sm hover:border-hot-pink/50 transition-colors duration-300">
                        {/* CD Jewel Case Effect */}
                        <div className="aspect-square relative overflow-hidden bg-black mb-6 border border-white/5 shadow-2xl">
                            <img src={featuredAlbum.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" alt="Album"/>
                            {/* Glitch Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-hot-pink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay"></div>
                            
                            {/* Sticker */}
                            <div className="absolute top-4 right-4 w-16 h-16 bg-lime-punch rounded-full flex items-center justify-center text-midnight text-[10px] font-black text-center rotate-12 shadow-lg">
                                NEW<br/>DROP
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-3xl font-display font-black text-white leading-none">{featuredAlbum.title}</h4>
                            <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-t border-white/10 pt-3 mt-3">
                                <span>{featuredAlbum.type}</span>
                                <span className="text-electric-cyan">AVAILABLE NOW</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed pt-2">{featuredAlbum.description}</p>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button className="py-3 bg-white text-midnight font-bold text-xs uppercase hover:bg-electric-cyan transition-colors">Stream</button>
                            <button className="py-3 border border-white/20 text-white font-bold text-xs uppercase hover:bg-white/10 transition-colors">Buy Vinyl</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track List - Cyber Terminal Style */}
            <div className="lg:col-span-8">
                <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-sm overflow-hidden">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        <div className="col-span-6">Title / Artist</div>
                        <div className="col-span-3">Album</div>
                        <div className="col-span-2 text-right">Time</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {tracks.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 font-mono text-sm flex flex-col items-center gap-3">
                                <ListMusic size={32} />
                                <span>EMPTY_DATABASE</span>
                            </div>
                        ) : (
                            tracks.map((track, index) => {
                                const isActive = currentTrackId === track.id;
                                const isPlayingNow = isActive && isPlaying;
                                
                                return (
                                    <motion.div 
                                        key={track.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        viewport={{ once: true }}
                                        className={`group relative grid grid-cols-12 gap-4 p-4 items-center transition-all duration-200 cursor-pointer
                                            ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                        onClick={() => onPlayTrack(track)}
                                    >
                                        {/* Active Indicator Bar */}
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-punch shadow-[0_0_10px_#CCFF00]"></div>}

                                        {/* Title Column */}
                                        <div className="col-span-10 md:col-span-6 flex items-center gap-4">
                                            <div className="relative w-12 h-12 shrink-0 bg-black border border-white/10 group-hover:border-white/30 overflow-hidden">
                                                <img src={track.coverUrl} className={`w-full h-full object-cover ${isPlayingNow ? 'opacity-50' : ''}`} alt={track.title} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {isPlayingNow ? <MiniViz active={true} /> : <Play size={16} className="text-white opacity-0 group-hover:opacity-100" fill="currentColor" />}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`font-bold text-base truncate ${isActive ? 'text-lime-punch' : 'text-white group-hover:text-hot-pink'} transition-colors`}>
                                                    {track.title}
                                                </div>
                                                <div className="text-xs text-slate-500 font-mono truncate">{track.artist}</div>
                                            </div>
                                        </div>

                                        {/* Album Column */}
                                        <div className="hidden md:block col-span-3 text-xs text-slate-400 font-mono truncate">
                                            {track.album}
                                        </div>

                                        {/* Time Column */}
                                        <div className="hidden md:block col-span-2 text-right text-xs font-mono text-slate-500 group-hover:text-white">
                                            {track.duration}
                                        </div>

                                        {/* Actions Column */}
                                        <div className="col-span-2 md:col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); onViewDetails(track); }} className="p-2 hover:text-electric-cyan transition-colors">
                                                <Info size={16} />
                                            </button>
                                            <button className="p-2 hover:text-hot-pink transition-colors">
                                                <Heart size={16} />
                                            </button>
                                        </div>
                                        
                                        {/* Netease Player Expand */}
                                        {!!track.neteaseId && isActive && (
                                            <div className="col-span-12 mt-2">
                                                <div className="h-[1px] bg-white/10 mb-2"></div>
                                                <iframe 
                                                    frameBorder="no" 
                                                    width="100%" 
                                                    height="86" 
                                                    src={`//music.163.com/outchain/player?type=2&id=${track.neteaseId}&auto=1&height=66`}
                                                    className="rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                                                ></iframe>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
                
                {/* Footer of list */}
                <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    <span>Total Tracks: {tracks.length}</span>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">View Full Discography <Plus size={10}/></button>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default MusicSection;
