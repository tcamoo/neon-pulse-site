
import React, { useState } from 'react';
import { Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavItem } from '../types';

interface NavbarProps {
  isAdmin: boolean;
  toggleAdmin: () => void;
  navItems: NavItem[];
}

// Improved Animated Tape Reel Icon
const TapeReel = () => {
  return (
    <div className="relative w-14 h-14 flex items-center justify-center group">
       {/* Main chassis */}
       <div className="absolute inset-0 bg-midnight/80 rounded-full border border-white/10 backdrop-blur-sm scale-90"></div>
       
       {/* Left Reel */}
       <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-slate-600 rounded-full flex items-center justify-center animate-spin-slow" style={{ animationDuration: '3s' }}>
           <div className="w-1 h-1 bg-white rounded-full"></div>
           <div className="absolute w-full h-[1px] bg-slate-700"></div>
           <div className="absolute w-[1px] h-full bg-slate-700"></div>
       </div>

       {/* Right Reel */}
       <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-slate-600 rounded-full flex items-center justify-center animate-spin-slow" style={{ animationDuration: '3s' }}>
           <div className="w-1 h-1 bg-white rounded-full"></div>
           <div className="absolute w-full h-[1px] bg-slate-700"></div>
           <div className="absolute w-[1px] h-full bg-slate-700"></div>
       </div>

       {/* Tape connecting them */}
       <div className="absolute top-1/2 -translate-y-1/2 left-5 right-5 h-[2px] bg-hot-pink/80"></div>

       {/* Center Hub / Head */}
       <div className="absolute inset-0 m-auto w-4 h-4 bg-surface border border-white/20 rounded flex items-center justify-center z-10 shadow-lg">
           <div className="w-1.5 h-1.5 bg-electric-cyan rounded-full animate-pulse"></div>
       </div>
    </div>
  );
};

const Navbar: React.FC<NavbarProps> = ({ isAdmin, toggleAdmin, navItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
        <div className="glass-panel rounded-full px-2 py-2 flex items-center gap-2 pointer-events-auto shadow-lg shadow-hot-pink/10">
          
          {/* Logo / Animated Tape Reel */}
          <TapeReel />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 px-4">
            {navItems.map((link) => (
              <a 
                key={link.id} 
                href={`#${link.targetId}`} 
                className="px-6 py-2 rounded-full text-sm font-bold uppercase text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Admin Toggle */}
          <button 
            onClick={toggleAdmin}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
              ${isAdmin ? 'bg-lime-punch text-midnight rotate-90 shadow-[0_0_15px_rgba(217,249,157,0.5)]' : 'bg-surface text-white hover:bg-white/20'}`}
            title="后台管理"
          >
            <Settings size={18} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden w-12 h-12 bg-hot-pink text-white rounded-full flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-midnight/95 backdrop-blur-xl z-40 flex items-center justify-center"
          >
            <div className="flex flex-col gap-8 text-center">
              {navItems.map((link) => (
                <a 
                  key={link.id}
                  href={`#${link.targetId}`}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-hot-pink to-electric-cyan"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
