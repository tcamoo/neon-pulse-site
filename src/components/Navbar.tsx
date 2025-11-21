
import React, { useState } from 'react';
import { Menu, X, Settings, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavItem } from '../types';

interface NavbarProps {
  isAdmin: boolean;
  toggleAdmin: () => void;
  navItems: NavItem[];
}

// Sonic Brand Icon
const SonicLogo = () => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center bg-midnight border border-white/20 rounded-lg overflow-hidden group cursor-pointer hover:border-lime-punch transition-colors">
       <div className="flex items-center gap-[2px] h-4">
           {[1,2,3,4,5].map(i => (
               <motion.div 
                  key={i} 
                  className="w-1 bg-white group-hover:bg-lime-punch"
                  animate={{ height: ['20%', '80%', '40%'] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
               />
           ))}
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
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        {/* Floating Capsule Container */}
        <div className="pointer-events-auto bg-midnight/80 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 shadow-2xl shadow-black/50 flex items-center gap-4 md:gap-8">
          
          {/* Brand */}
          <div className="pl-2">
             <SonicLogo />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
            {navItems.map((link) => (
              <a 
                key={link.id} 
                href={`#${link.targetId}`} 
                className="px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-midnight hover:bg-white transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pr-2">
              {/* Admin Toggle */}
              <button 
                onClick={toggleAdmin}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border
                  ${isAdmin ? 'bg-hot-pink text-white border-hot-pink animate-pulse' : 'bg-transparent text-slate-400 border-transparent hover:bg-white/10 hover:text-white'}`}
                title="System Access"
              >
                <Settings size={18} />
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden w-10 h-10 bg-white text-midnight rounded-lg flex items-center justify-center hover:bg-lime-punch transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
          </div>

        </div>
      </motion.nav>

      {/* Full Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/98 z-40 flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            
            <div className="flex flex-col gap-6 text-center relative z-10">
              <div className="text-xs font-mono text-slate-500 mb-4 uppercase tracking-widest">Navigation System</div>
              {navItems.map((link, index) => (
                <motion.a 
                  key={link.id}
                  href={`#${link.targetId}`}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="font-display text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 hover:to-lime-punch transition-all"
                >
                  {link.label}
                </motion.a>
              ))}
              
              <div className="w-12 h-1 bg-hot-pink mx-auto mt-8"></div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
                  <Radio size={14} className="animate-pulse text-lime-punch" />
                  SECURE CONNECTION ESTABLISHED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
