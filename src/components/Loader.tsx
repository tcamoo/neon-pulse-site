
import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <motion.div
      key="loader"
      className="fixed inset-0 z-[9999] bg-midnight flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle,black,transparent_80%)]"></div>

      <div className="relative z-10 flex flex-col items-center">
          
          {/* Animated Spinner */}
          <div className="relative w-32 h-32 mb-10">
              <motion.div 
                  className="absolute inset-0 border-[6px] border-transparent border-t-hot-pink border-l-hot-pink rounded-full blur-[1px]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                  className="absolute inset-2 border-[6px] border-transparent border-r-electric-cyan border-b-electric-cyan rounded-full blur-[1px]"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                   className="absolute inset-0 flex items-center justify-center"
              >
                  <motion.div 
                    className="w-16 h-16 bg-lime-punch/20 rounded-full backdrop-blur-sm flex items-center justify-center border border-lime-punch/50"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                      <div className="w-2 h-2 bg-lime-punch rounded-full shadow-[0_0_10px_#D9F99D]"></div>
                  </motion.div>
              </motion.div>
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
              <motion.h1 
                className="text-6xl font-display font-black text-white tracking-tighter mix-blend-overlay select-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                VES
              </motion.h1>
              
              <div className="flex items-center gap-2 justify-center font-mono text-xs text-electric-cyan tracking-[0.3em] uppercase">
                  <span className="w-2 h-2 bg-electric-cyan rounded-full animate-pulse"></span>
                  <span>System Initializing</span>
                  <span className="w-2 h-2 bg-electric-cyan rounded-full animate-pulse"></span>
              </div>
          </div>
      </div>
      
      {/* Progress Bar */}
      <motion.div 
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-hot-pink via-lime-punch to-electric-cyan"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />

    </motion.div>
  );
};

export default Loader;
