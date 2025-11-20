
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Disc } from 'lucide-react';
import type { HeroData } from '../types';

interface HeroProps {
  data: HeroData;
}

// Enhanced Magnetic Glitch Text
// Fixed: Text styling is now applied to inner span to prevent visibility issues with bg-clip-text on wrappers
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

  // React to prop changes (when editing in Admin)
  useEffect(() => {
      setDisplayText(text);
  }, [text]);

  const startScramble = () => {
    setIsHovering(true);
    let iteration = 0;
    
    clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setDisplayText(() => 
        text
          .split("")
          .map((_letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / 2; // Decode speed
    }, 30);
  };

  const stopScramble = () => {
    setIsHovering(false);
    clearInterval(intervalRef.current);
    setDisplayText(text);
  };

  return (
    <div 
        className={`relative inline-block ${className}`}
        onMouseEnter={startScramble}
        onMouseLeave={stopScramble}
    >
        {/* RGB Split Layers for Glitch Effect - Absolute positioned, so they need explicit size/position */}
        <span className={`absolute top-0 left-0 -z-10 opacity-0 ${isHovering ? 'animate-pulse opacity-70 translate-x-[3px]' : ''} text-hot-pink mix-blend-screen font-display font-extrabold select-none pointer-events-none whitespace-nowrap`}>
            {displayText}
        </span>
        <span className={`absolute top-0 left-0 -z-10 opacity-0 ${isHovering ? 'animate-pulse opacity-70 -translate-x-[3px]' : ''} text-electric-cyan mix-blend-screen font-display font-extrabold select-none pointer-events-none whitespace-nowrap`}>
            {displayText}
        </span>
        
        {/* Main Text - Ensure visibility even when idle */}
        <span className={`relative z-10 font-display font-extrabold ${textClassName}`}>
            {displayText}
        </span>
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section className="min-h-screen w-full flex items-center justify-center relative overflow-hidden pt-24 pb-20">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-20 right-[-10%] w-[40vw] h-[40vw] bg-gradient-to-br from-hot-pink/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-electric-cyan/10 to-lime-punch/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
             <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-lime-punch text-midnight font-bold text-xs tracking-widest uppercase rounded-full animate-pulse">New Signal</span>
                <span className="h-[1px] w-20 bg-gradient-to-r from-white/50 to-transparent"></span>
             </div>
             
             <div className="text-5xl md:text-7xl lg:text-9xl leading-[0.9] mb-8 cursor-default select-none flex flex-col items-start">
                {/* Line 1: White text, changes to stroke on hover */}
                <GlitchDecodeText 
                    text={data.titleLine1} 
                    className="block mb-2" 
                    textClassName="text-white hover:text-stroke transition-all duration-300" 
                />
                
                {/* Line 2: Gradient text. Fixed visibility issue by applying gradient class to textClassName */}
                <GlitchDecodeText 
                    text={data.titleLine2} 
                    className="block" 
                    textClassName="text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-purple-500 to-electric-cyan pb-2" 
                />
             </div>
             
             <p className="font-sans text-lg text-slate-300 max-w-md leading-relaxed mb-10 border-l-2 border-hot-pink pl-6">
               {data.subtitle}
             </p>

             <div className="flex flex-wrap gap-4 md:gap-6">
                <button className="group relative px-8 py-4 bg-white text-midnight font-bold rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <div className="absolute inset-0 bg-hot-pink transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                    <span className="relative group-hover:text-white flex items-center gap-2">
                        <PlayCircle size={20} /> {data.buttonText}
                    </span>
                </button>
                <button className="px-8 py-4 border border-white/20 rounded-full hover:bg-white/10 transition-colors font-sans flex items-center gap-2 group text-white">
                    <Disc size={20} className="group-hover:rotate-180 transition-transform duration-700" /> 查看巡演
                </button>
             </div>
          </motion.div>
        </div>

        {/* Right Visual - Arch Mask */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end hidden md:flex">
            <motion.div
               initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
               animate={{ opacity: 1, scale: 1, rotate: 0 }}
               transition={{ duration: 1, delay: 0.2 }}
               className="relative w-[80vw] h-[50vh] lg:w-[400px] lg:h-[550px]"
            >
                {/* Decorative Frame */}
                <div className="absolute inset-0 border-2 border-lime-punch rounded-t-full translate-x-4 translate-y-4 opacity-50"></div>
                <div className="absolute inset-0 border border-white/20 rounded-t-full -translate-x-4 -translate-y-4 opacity-30"></div>
                
                {/* Image Container */}
                <div className="absolute inset-0 rounded-t-full overflow-hidden bg-surface shadow-2xl shadow-hot-pink/20 group">
                    <img 
                        src={data.heroImage} 
                        alt="Artist" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter contrast-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-60"></div>
                    
                    {/* Glitch Overlay on Hover */}
                    <div className="absolute inset-0 bg-hot-pink mix-blend-color-dodge opacity-0 group-hover:opacity-20 transition-opacity duration-100 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                {/* Floating Element */}
                <div className="absolute -bottom-8 -left-8 bg-midnight/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-4 max-w-[200px] z-20">
                    <div className="w-10 h-10 bg-electric-cyan rounded-full flex items-center justify-center text-midnight font-bold shadow-[0_0_10px_#06B6D4]">
                        01
                    </div>
                    <div className="text-sm">
                        <div className="text-slate-400 text-xs uppercase tracking-wider">Current Vibe</div>
                        <div className="font-bold text-white">Future Retro</div>
                    </div>
                </div>
            </motion.div>
        </div>

      </div>
      
      {/* Marquee Text Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden py-4 bg-hot-pink text-midnight transform rotate-1 origin-bottom-left border-t-2 border-white">
         <motion.div 
            className="whitespace-nowrap font-display font-black text-3xl md:text-4xl uppercase flex gap-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
         >
            <span>{data.marqueeText} • </span>
            <span>{data.marqueeText} • </span>
            <span>{data.marqueeText} • </span>
         </motion.div>
      </div>
    </section>
  );
};

export default Hero;
