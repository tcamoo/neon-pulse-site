
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Disc, ArrowDown } from 'lucide-react';
import type { HeroData } from '../types';

interface HeroProps {
  data: HeroData;
}

const GlitchDecodeText = ({ 
    text, 
    className = "", 
    textClassName = "" 
}: { 
    text: string, 
    className?: string,
    textClassName?: string 
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*";
  const intervalRef = useRef<any>(null);

  useEffect(() => {
      setDisplayText(text);
  }, [text]);

  const startScramble = () => {
    setIsHovering(true);
    let iteration = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayText(() => 
        text.split("").map((_letter, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("")
      );
      if (iteration >= text.length) clearInterval(intervalRef.current);
      iteration += 1 / 2;
    }, 30);
  };

  const stopScramble = () => {
    setIsHovering(false);
    clearInterval(intervalRef.current);
    setDisplayText(text);
  };

  return (
    <div className={`relative inline-block ${className}`} onMouseEnter={startScramble} onMouseLeave={stopScramble}>
        <span className={`absolute top-0 left-0 -z-10 opacity-0 ${isHovering ? 'animate-pulse opacity-100 translate-x-[2px] text-lime-punch' : ''} font-display font-black select-none whitespace-nowrap`}>{displayText}</span>
        <span className={`absolute top-0 left-0 -z-10 opacity-0 ${isHovering ? 'animate-pulse opacity-100 -translate-x-[2px] text-hot-pink' : ''} font-display font-black select-none whitespace-nowrap`}>{displayText}</span>
        <span className={`relative z-10 font-display font-black ${textClassName}`}>{displayText}</span>
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section className="min-h-[85vh] w-full flex items-center justify-center relative overflow-hidden pt-20 pb-10">
      {/* Compact Background Elements */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-gradient-to-b from-purple-900/30 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-gradient-to-t from-electric-cyan/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        
        {/* Left Content - Tighter */}
        <div className="lg:w-1/2 flex flex-col items-start z-20">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
             <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-0.5 bg-lime-punch text-midnight font-bold text-[10px] tracking-widest uppercase rounded-sm">New Signal</span>
                <span className="text-xs font-mono text-slate-400">/// SYSTEM_READY</span>
             </div>
             
             <div className="text-6xl md:text-8xl lg:text-9xl leading-[0.85] mb-6 tracking-tighter">
                <GlitchDecodeText text={data.titleLine1} className="block" textClassName="text-white" />
                <GlitchDecodeText text={data.titleLine2} className="block" textClassName="text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-purple-500 to-electric-cyan" />
             </div>
             
             <p className="font-sans text-base md:text-lg text-slate-300 max-w-md leading-tight mb-8 border-l border-hot-pink pl-4 opacity-80">
               {data.subtitle}
             </p>

             <div className="flex gap-4">
                <button className="group relative px-6 py-3 bg-white text-midnight font-bold rounded-lg overflow-hidden hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <div className="absolute inset-0 bg-hot-pink transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></div>
                    <span className="relative group-hover:text-white flex items-center gap-2 text-sm">
                        <PlayCircle size={18} /> {data.buttonText}
                    </span>
                </button>
                <button className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-sm font-bold text-white flex items-center gap-2 group">
                    <Disc size={18} className="group-hover:animate-spin" /> Discography
                </button>
             </div>
          </motion.div>
        </div>

        {/* Right Visual - Compact & Geometric */}
        <div className="lg:w-1/2 relative flex justify-center lg:justify-end">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               className="relative w-full max-w-md aspect-[4/5]"
            >
                <div className="absolute inset-0 border border-white/10 translate-x-4 translate-y-4 bg-white/5 backdrop-blur-sm z-0"></div>
                <div className="absolute inset-0 bg-midnight z-10 overflow-hidden border border-white/10 group">
                    <img src={data.heroImage} alt="Artist" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-80"></div>
                    
                    {/* Overlay Info */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                         <div className="text-white">
                             <div className="text-[10px] text-lime-punch font-mono uppercase">Now Playing</div>
                             <div className="text-xl font-bold font-display leading-none">FUTURE RETRO</div>
                         </div>
                         <div className="w-8 h-8 bg-electric-cyan text-midnight flex items-center justify-center font-bold text-xs">01</div>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
      
      {/* Compact Marquee */}
      <div className="absolute bottom-0 left-0 w-full bg-hot-pink py-1 z-20">
         <motion.div 
            className="whitespace-nowrap font-mono font-bold text-xs text-midnight uppercase tracking-widest flex gap-12"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
         >
            {Array(10).fill(data.marqueeText).map((t, i) => <span key={i}>{t} • </span>)}
         </motion.div>
      </div>
    </section>
  );
};

export default Hero;
