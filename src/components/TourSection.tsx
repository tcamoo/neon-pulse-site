
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Hash, Play, Pause, Radio, Zap } from 'lucide-react';
import type { Article } from '../types';

interface ArticleSectionProps {
  articles: Article[];
  onPlayLinkedTrack: (trackId: string) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({ articles, onPlayLinkedTrack, currentTrackId, isPlaying }) => {
  return (
    <section id="live" className="py-24 bg-[#080808] relative overflow-hidden">
      {/* Diagonal Stripe Background */}
      <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,#ffffff_0,#ffffff_1px,transparent_0,transparent_50%)] bg-[size:10px_10px]"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header with Tech Aesthetics */}
        <div className="flex items-end justify-between mb-12 border-b-2 border-white pb-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 animate-pulse rounded-sm"></div>
                    <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Live Feed</span>
                </div>
                <h2 className="font-display font-black text-5xl md:text-6xl text-white leading-none">
                    TRANSMISSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-hot-pink to-purple-600">LOGS</span>
                </h2>
            </div>
            <div className="hidden md:flex gap-4 font-mono text-xs text-slate-400">
                <div>SYS.STATUS: NORMAL</div>
                <div>UPTIME: 99.9%</div>
            </div>
        </div>

        {/* Horizontal Scroll / Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length === 0 ? (
              <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed border-white/10 bg-white/5 font-mono text-slate-500">
                 <Radio size={24} className="mr-4 animate-pulse" /> NO SIGNAL DETECTED
              </div>
            ) : (
              articles.map((article, index) => {
                const isLinkedTrackPlaying = article.linkedTrackId === currentTrackId && isPlaying;

                return (
                    <motion.div 
                        key={article.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative flex flex-col bg-[#121212] border border-white/10 hover:border-electric-cyan transition-colors duration-300"
                    >
                        {/* Tech Corners */}
                        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t border-l border-white/50 group-hover:border-electric-cyan transition-colors"></div>
                        <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b border-r border-white/50 group-hover:border-electric-cyan transition-colors"></div>

                        {/* Image Area */}
                        <div className="relative aspect-video overflow-hidden bg-black">
                            <img 
                                src={article.coverUrl} 
                                alt={article.title} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-60"></div>
                            
                            {/* Tag Overlay */}
                            <div className="absolute top-3 left-3">
                                <span className="px-2 py-1 bg-electric-cyan text-midnight text-[10px] font-black font-mono uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    {article.category.replace('#', '')}
                                </span>
                            </div>

                            {/* Play Button Overlay */}
                            {article.linkedTrackId && (
                                <button 
                                    onClick={(e) => { e.preventDefault(); onPlayLinkedTrack(article.linkedTrackId!); }}
                                    className={`absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center border transition-all ${isLinkedTrackPlaying ? 'bg-hot-pink border-hot-pink text-white animate-pulse' : 'bg-black/50 border-white text-white hover:bg-white hover:text-black'}`}
                                >
                                    {isLinkedTrackPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono mb-3 border-b border-white/10 pb-2">
                                <Calendar size={12} />
                                <span>{article.date}</span>
                            </div>
                            
                            <h3 className="text-xl font-display font-bold text-white mb-3 leading-tight group-hover:text-electric-cyan transition-colors">
                                {article.title}
                            </h3>
                            
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 font-sans">
                                {article.excerpt}
                            </p>

                            <div className="mt-auto pt-4 flex justify-between items-center">
                                <button className="text-xs font-bold uppercase tracking-widest text-white hover:text-hot-pink transition-colors flex items-center gap-2 group/btn">
                                    Read Log <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <Zap size={14} className="text-slate-600 group-hover:text-yellow-400 transition-colors" />
                            </div>
                        </div>
                    </motion.div>
                );
            }))}
        </div>
        
        {/* Decorative footer line */}
        <div className="mt-16 border-t border-white/10 pt-4 flex justify-center">
             <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.5em]">End of Transmission ///</p>
        </div>

      </div>
    </section>
  );
};

export default ArticleSection;
