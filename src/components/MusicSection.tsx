
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Disc, Info, BarChart3, Music2, Plus, Share2 } from 'lucide-react';
import type { Track, FeaturedAlbum } from '../types';

interface MusicSectionProps {
  tracks: Track[];
  featuredAlbum: FeaturedAlbum;
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onViewDetails: (track: Track) => void;
}

const CompactTrackItem = ({ track, isActive, isPlaying, onPlay, onDetails }: { track: Track, isActive: boolean, isPlaying: boolean, onPlay: () => void, onDetails: () => void }) => {
    const isNetease = !!track.neteaseId;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-300 border border-transparent ${isActive ? 'bg-white/10 border-l-4 border-l-hot-pink' : 'hover:bg-white/5 hover:border-white/10'}`}
            onClick={onPlay}
        >
            {/* Cover & Play Btn */}
            <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden">
                <img src={track.coverUrl} className={`w-full h-full object-cover ${isActive && isPlaying ? 'animate-pulse' : ''}`} alt={track.title} />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {isActive && isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
                </div>
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0 flex flex-col justify-center">
                <div className={`font-bold text-sm truncate ${isActive ? 'text-hot-pink' : 'text-white group-hover:text-electric-cyan'}`}>
                    {track.title}
                </div>
                <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                    {track.artist}
                    {isNetease && <span className="px-1 py-0.5 bg-red-500/20 text-red-400 text-[8px] rounded border border-red-500/30 leading-none">NETEASE</span>}
                </div>
            </div>

            {/* Meta (Hidden on mobile to save space) */}
            <div className="hidden md:block text-xs text-slate-600 font-mono w-24 text-right">{track.album}</div>
            <div className="text-xs text-slate-600 font-mono w-12 text-right">{track.duration}</div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onDetails(); }} className="p-1.5 hover:bg-white/20 rounded text-slate-400 hover:text-white"><Info size={14}/></button>
                <button className="p-1.5 hover:bg-white/20 rounded text-slate-400 hover:text-hot-pink"><Heart size={14}/></button>
            </div>
        </motion.div>
    );
}

const MusicSection: React.FC<MusicSectionProps> = ({ tracks, featuredAlbum, currentTrackId, isPlaying, onPlayTrack, onViewDetails }) => {
  const [filter, setFilter] = useState<'all' | 'singles' | 'albums'>('all');

  return (
    <section id="music" className="py-20 px-6 relative z-10 bg-midnight">
      <div className="container mx-auto max-w-6xl">
        
        {/* Compact Header */}
        <div className="flex flex-wrap justify-between items-end mb-10 border-b border-white/10 pb-4 gap-4">
          <div>
             <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tighter">
                SONIC <span className="text-electric-cyan">ARCHIVE</span>
             </h2>
          </div>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
              {['all', 'singles', 'albums'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-white text-midnight' : 'text-slate-500 hover:text-white'}`}
                  >
                      {f}
                  </button>
              ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Featured Album - Compact Horizontal Card */}
            <div className="lg:col-span-5">
                <h3 className="text-xs font-bold text-lime-punch uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Disc size={14} className="animate-spin-slow"/> Featured Release
                </h3>
                <div className="bg-surface border border-white/10 rounded-xl p-4 hover:border-hot-pink/50 transition-colors group relative overflow-hidden">
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-hot-pink/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex gap-5 items-start">
                        <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden shadow-lg">
                            <img src={featuredAlbum.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Album"/>
                        </div>
                        <div className="flex flex-col justify-between h-28">
                            <div>
                                <h4 className="text-2xl font-display font-bold text-white leading-none mb-1">{featuredAlbum.title}</h4>
                                <p className="text-xs text-slate-400 font-mono mb-2">{featuredAlbum.type}</p>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{featuredAlbum.description}</p>
                            </div>
                            <div className="flex gap-2 mt-auto">
                                <button className="px-3 py-1.5 bg-hot-pink text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-white hover:text-midnight transition-colors">
                                    <Play size={12} fill="currentColor"/> Play
                                </button>
                                <button className="px-3 py-1.5 border border-white/20 text-slate-300 text-xs font-bold rounded hover:bg-white/10">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Mini Box */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between h-24">
                        <BarChart3 size={16} className="text-electric-cyan mb-auto"/>
                        <div>
                            <div className="text-xl font-bold text-white">1.2M</div>
                            <div className="text-[10px] text-slate-500 uppercase">Monthly Streams</div>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between h-24">
                        <Music2 size={16} className="text-purple-400 mb-auto"/>
                        <div>
                            <div className="text-xl font-bold text-white">{tracks.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase">Total Tracks</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track List - Compact Table Style */}
            <div className="lg:col-span-7">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tracklist</h3>
                    <button className="text-[10px] text-electric-cyan hover:text-white transition-colors font-mono flex items-center gap-1">
                        VIEW ALL <Plus size={10}/>
                    </button>
                </div>
                
                <div className="flex flex-col gap-1">
                    {tracks.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-white/10 rounded-lg text-slate-600 text-sm">
                            No tracks available.
                        </div>
                    ) : (
                        tracks.map(track => (
                            <React.Fragment key={track.id}>
                                {/* If netease and active, expand */}
                                {!!track.neteaseId && currentTrackId === track.id && isPlaying && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-2 rounded-lg overflow-hidden border border-red-500/30"
                                    >
                                         <iframe 
                                            frameBorder="no" 
                                            width="100%" 
                                            height="86" 
                                            src={`//music.163.com/outchain/player?type=2&id=${track.neteaseId}&auto=1&height=66`}
                                            className="block"
                                        ></iframe>
                                    </motion.div>
                                )}
                                <CompactTrackItem 
                                    track={track} 
                                    isActive={currentTrackId === track.id} 
                                    isPlaying={isPlaying && currentTrackId === track.id}
                                    onPlay={() => onPlayTrack(track)}
                                    onDetails={() => onViewDetails(track)}
                                />
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default MusicSection;
