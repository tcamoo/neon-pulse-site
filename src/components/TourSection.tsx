
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Hash, Play, Pause, Newspaper } from 'lucide-react';
import type { Article } from '../types';

interface ArticleSectionProps {
  articles: Article[];
  onPlayLinkedTrack: (trackId: string) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({ articles, onPlayLinkedTrack, currentTrackId, isPlaying }) => {
  return (
    <section id="live" className="py-20 bg-[#0B1121] text-slate-200 overflow-hidden relative">
      {/* Tight Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="flex items-center justify-between mb-10 border-l-4 border-lime-punch pl-4">
            <div>
                <h2 className="font-display font-black text-3xl md:text-5xl text-white leading-none mb-1">
                    LOGS <span className="text-slate-600">&</span> UPDATES
                </h2>
                <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">Transmission Feed from the Void</p>
            </div>
            <Newspaper className="text-lime-punch opacity-50" size={32} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.length === 0 ? (
              <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                 <h3 className="font-display text-xl text-white/30">NO SIGNAL DETECTED</h3>
              </div>
            ) : (
              articles.map((article, index) => {
                const isLinkedTrackPlaying = article.linkedTrackId === currentTrackId && isPlaying;

                return (
                    <motion.div 
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative h-80 rounded-2xl overflow-hidden border border-white/10 hover:border-lime-punch/50 transition-all duration-500"
                    >
                        {/* Background Image with Zoom */}
                        <img 
                            src={article.coverUrl} 
                            alt={article.title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        
                        {/* Gradient Overlay - Stronger at bottom for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent opacity-90"></div>
                        
                        {/* Content Overlay */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            <div className="absolute top-4 left-4">
                                <span className="px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold font-mono text-lime-punch uppercase tracking-wider flex items-center gap-1">
                                    <Hash size={10} /> {article.category.replace('#', '')}
                                </span>
                            </div>

                            {article.linkedTrackId && (
                                <button 
                                    onClick={(e) => { e.preventDefault(); onPlayLinkedTrack(article.linkedTrackId!); }}
                                    className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isLinkedTrackPlaying ? 'bg-hot-pink text-white' : 'bg-white/20 text-white hover:bg-white hover:text-midnight'}`}
                                >
                                    {isLinkedTrackPlaying ? <Pause size={14} /> : <Play size={14} />}
                                </button>
                            )}

                            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono mb-2 opacity-80">
                                    <Calendar size={10} /> {article.date}
                                </div>
                                
                                <h3 className="text-lg font-display font-bold text-white mb-2 leading-tight group-hover:text-lime-punch transition-colors">
                                    {article.title}
                                </h3>
                                
                                <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
                                    {article.excerpt}
                                </p>

                                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase text-electric-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    Read Full <ArrowRight size={10} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            }))}
        </div>
      </div>
    </section>
  );
};

export default ArticleSection;
