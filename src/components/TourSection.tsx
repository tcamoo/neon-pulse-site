
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Hash, Play, Pause, Activity } from 'lucide-react';
import type { Article } from '../types';

interface ArticleSectionProps {
  articles: Article[];
  onPlayLinkedTrack: (trackId: string) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({ articles, onPlayLinkedTrack, currentTrackId, isPlaying }) => {
  return (
    <section id="live" className="py-32 bg-surface text-slate-200 overflow-hidden relative">
      {/* Background Noise/Texture */}
      <div className="absolute inset-0 bg-[#0B1121] opacity-90"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 border-b border-white/10 pb-8">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-electric-cyan rounded-full animate-pulse"></span>
                    <span className="font-mono font-bold text-xs text-electric-cyan uppercase tracking-widest">News & Updates</span>
                </div>
                <h2 className="font-display font-black text-5xl md:text-7xl text-white leading-none">
                    TRANSMISSION <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-punch to-electric-cyan">LOGS</span>
                </h2>
            </div>
            <div className="hidden md:flex items-center gap-4">
                <button className="px-6 py-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} /> All Posts
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length === 0 ? (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                 <h3 className="font-display text-3xl text-white/30">NO SIGNAL DETECTED</h3>
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
                        className="group relative bg-midnight/50 border border-white/5 rounded-2xl overflow-hidden hover:border-electric-cyan/50 transition-colors duration-500 flex flex-col h-full"
                    >
                        {/* Image Container */}
                        <div className="relative h-64 overflow-hidden">
                            <img 
                                src={article.coverUrl} 
                                alt={article.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-80"></div>
                            
                            {/* Category Tag */}
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-bold font-mono text-lime-punch uppercase tracking-wider flex items-center gap-1">
                                    <Hash size={10} /> {article.category.replace('#', '')}
                                </span>
                            </div>

                            {/* Floating Music Player if attached */}
                            {article.linkedTrackId && (
                                <button 
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault();
                                        onPlayLinkedTrack(article.linkedTrackId!);
                                    }}
                                    className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-xl ${isLinkedTrackPlaying ? 'bg-hot-pink text-white scale-110' : 'bg-white/20 text-white hover:bg-white hover:text-midnight'}`}
                                >
                                    {isLinkedTrackPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono mb-3">
                                <Calendar size={12} />
                                <span>{article.date}</span>
                            </div>
                            
                            <h3 className="text-2xl font-display font-bold text-white mb-4 leading-tight group-hover:text-electric-cyan transition-colors">
                                {article.title}
                            </h3>
                            
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                {article.excerpt}
                            </p>

                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <button className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors flex items-center gap-2">
                                    Read Full Log <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            }))}
        </div>
        
        <div className="mt-16 flex justify-center">
            <p className="font-mono text-xs text-slate-600 uppercase tracking-widest animate-pulse">
                End of Transmission
            </p>
        </div>

      </div>
    </section>
  );
};

export default ArticleSection;
