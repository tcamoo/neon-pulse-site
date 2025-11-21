
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Disc, Sparkles } from 'lucide-react';
import type { HeroData } from '../types';

interface HeroProps {
  data: HeroData;
}

// Scramble Text Effect
const GlitchText = ({ text, className = "" }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*";
  
  useEffect(() => {
      let iteration = 0;
      const interval = setInterval(() => {
          setDisplayText(text.split("").map((_, index) => {
              if (index < iteration) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
          }).join(""));
          if (iteration >= text.length) clearInterval(interval);
          iteration += 1 / 3;
      }, 30);
      return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
};

const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section className="min-h-screen w-full relative overflow-hidden pt-32 pb-20 flex flex-col justify-center">
      
      {/* 1. Massive Background Typography (Outline) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center select-none pointer-events-none z-0">
         <h1 className="text-[15vw] md:text-[18vw] leading-none font-display font-black text-stroke opacity-20 blur-sm animate-pulse">
            {data.titleLine1}
         </h1>
         <h1 className="text-[15vw] md:text-[18vw] leading-none font-display font-black text-stroke-accent opacity-10 translate-x-10">
            {data.titleLine2}
         </h1>
      </div>

      {/* 2. Acid Gradient Blobs */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-lime-punch opacity-20 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-hot-pink opacity-20 rounded-full blur-[120px] animate-float" style={{animationDelay: '2s'}} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left: Content Block */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="lg:w-1/2 relative"
            >
                {/* Decorative Badge */}
                <div className="inline-flex items-center gap-2 border border-lime-punch px-3 py-1 rounded-full mb-8 bg-lime-punch/10 backdrop-blur-md">
                    <Sparkles size={14} className="text-lime-punch animate-spin-slow" />
                    <span className="text-xs font-mono font-bold text-lime-punch uppercase tracking-widest">New Frequency Detected</span>
                </div>

                {/* Main Title */}
                <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.9] mb-6 mix-blend-overlay">
                    <span className="text-white block">{data.titleLine1}</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-punch via-white to-hot-pink block">{data.titleLine2}</span>
                </h2>

                {/* Subtitle with heavy left border */}
                <div className="border-l-4 border-hot-pink pl-6 mb-10 bg-gradient-to-r from-hot-pink/10 to-transparent py-2">
                    <p className="text-slate-300 text-lg md:text-xl font-sans max-w-md leading-relaxed">
                        {data.subtitle}
                    </p>
                </div>

                {/* Brutalist Buttons */}
                <div className="flex flex-wrap gap-5">
                    <button className="group relative px-8 py-4 bg-lime-punch text-midnight font-bold text-sm uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <span className="relative flex items-center gap-2">
                            <Play size={18} fill="currentColor" /> 
                            <GlitchText text={data.buttonText} />
                        </span>
                    </button>

                    <button className="group px-8 py-4 border border-white text-white font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-midnight transition-all flex items-center gap-2">
                        <span>Discography</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {/* Right: Floating Visual (Overlap & Conflict) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="lg:w-[450px] relative group"
            >
                {/* Behind Decoration */}
                <div className="absolute -top-4 -right-4 w-full h-full border-2 border-hot-pink z-0 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2"></div>
                <div className="absolute -bottom-4 -left-4 w-full h-full bg-electric-cyan z-0 transition-transform group-hover:-translate-x-2 group-hover:translate-y-2"></div>

                {/* Main Image Container */}
                <div className="relative z-10 aspect-[3/4] bg-black overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img 
                        src={data.heroImage} 
                        alt="Hero" 
                        className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" 
                    />
                    {/* Noise Overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
                    
                    {/* Glitch Overlay Text */}
                    <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
                         <div className="flex justify-between items-end border-b border-white/30 pb-2">
                             <span className="font-mono text-xs text-lime-punch">ARTIST_ID: VES</span>
                             <Disc className="text-white animate-spin-slow" size={20} />
                         </div>
                    </div>
                </div>
            </motion.div>

        </div>
      </div>

      {/* Scrolling Marquee - Solid Band */}
      <div className="absolute bottom-10 left-0 w-full transform -rotate-1 bg-white text-midnight py-3 border-y-4 border-midnight z-20 shadow-xl">
        <div className="overflow-hidden relative flex">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-mono font-bold text-sm uppercase tracking-[0.2em]">
                {Array(8).fill(data.marqueeText).map((text, i) => (
                    <span key={i} className="flex items-center gap-8">
                        {text} <span className="text-hot-pink">+++</span>
                    </span>
                ))}
            </div>
             <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-mono font-bold text-sm uppercase tracking-[0.2em] absolute top-0 left-full">
                {Array(8).fill(data.marqueeText).map((text, i) => (
                    <span key={i} className="flex items-center gap-8">
                        {text} <span className="text-hot-pink">+++</span>
                    </span>
                ))}
            </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
