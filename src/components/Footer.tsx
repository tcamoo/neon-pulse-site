
import React from 'react';
import { Instagram, Twitter, Youtube, ArrowUpRight, Radio, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ContactConfig } from '../types';

interface FooterProps {
    contactData: ContactConfig;
}

const Footer: React.FC<FooterProps> = ({ contactData }) => {
  return (
    <footer className="bg-midnight relative overflow-hidden pt-20 pb-10">
      
      {/* Tech Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
        
        {/* Scanning Line */}
        <motion.div 
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-hot-pink to-transparent opacity-50 shadow-[0_0_20px_rgba(255,0,128,0.5)]"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* Top Section with Big Glitch Text */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-20">
            <div className="mb-10 md:mb-0 relative group">
                <h2 className="font-display font-black text-8xl md:text-9xl text-white/10 group-hover:text-white/20 transition-colors duration-500 leading-none select-none">
                    VES
                </h2>
                <div className="absolute top-0 left-0 font-display font-black text-8xl md:text-9xl text-hot-pink opacity-0 group-hover:opacity-20 translate-x-1 translate-y-1 transition-all duration-100 mix-blend-screen">
                    VES
                </div>
                <div className="absolute top-0 left-0 font-display font-black text-8xl md:text-9xl text-electric-cyan opacity-0 group-hover:opacity-20 -translate-x-1 -translate-y-1 transition-all duration-100 mix-blend-screen">
                    VES
                </div>
            </div>

            {/* Tech Stats Box */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm max-w-xs w-full hover:border-electric-cyan/30 transition-colors">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                    <span className="text-electric-cyan font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                        <Radio size={14} className="animate-pulse"/> System Status
                    </span>
                    <span className="text-lime-punch font-bold text-xs">ONLINE</span>
                </div>
                <div className="space-y-2 font-mono text-xs text-slate-400">
                     <div className="flex justify-between">
                        <span>SERVER</span>
                        <span className="text-white">HK-01</span>
                     </div>
                     <div className="flex justify-between">
                        <span>LATENCY</span>
                        <span className="text-white">12ms</span>
                     </div>
                     <div className="flex justify-between">
                        <span>VERSION</span>
                        <span className="text-white">v2.5.0</span>
                     </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 border-t border-white/10 pt-10">
            <div>
                <h3 className="font-display text-3xl text-white mb-2">Join the Frequency</h3>
                <p className="text-slate-400 mb-6 font-mono text-sm">Subscribe for drop alerts and exclusive content.</p>
                
                <div className="relative max-w-md group">
                    <div className="absolute inset-0 bg-gradient-to-r from-hot-pink to-electric-cyan rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative flex bg-midnight rounded-lg border border-white/20 overflow-hidden group-focus-within:border-hot-pink transition-colors">
                        <input 
                            type="email" 
                            placeholder="ENTER_EMAIL_ADDRESS" 
                            className="w-full bg-transparent py-4 px-6 text-white outline-none placeholder:text-slate-600 font-mono text-sm"
                        />
                        <button className="bg-white/5 hover:bg-hot-pink hover:text-white text-slate-400 px-6 transition-colors border-l border-white/10">
                            <ArrowUpRight size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:items-end justify-center gap-6">
                 <div className="flex gap-4">
                    {[<Instagram size={20}/>, <Twitter size={20}/>, <Youtube size={20}/>].map((icon, i) => (
                        <a key={i} href="#" className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-lime-punch hover:text-midnight hover:border-lime-punch hover:shadow-[0_0_15px_rgba(217,249,157,0.4)] transition-all duration-300 group">
                            <div className="group-hover:scale-110 transition-transform">
                                {icon}
                            </div>
                        </a>
                    ))}
                 </div>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-mono uppercase border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
                <Zap size={12} className="text-lime-punch" />
                <p>&copy; {new Date().getFullYear()} {contactData.footerText}</p>
            </div>
            
            <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-electric-cyan transition-colors">Privacy_Protocol</a>
                <a href="#" className="hover:text-electric-cyan transition-colors">Terms_of_Service</a>
                <a href="#contact" className="hover:text-electric-cyan transition-colors">Contact_Node</a>
            </div>
        </div>
      </div>
      
      {/* Scrolling Ticker at very bottom */}
      <div className="absolute bottom-0 w-full bg-white/5 py-1 overflow-hidden border-t border-white/5">
          <motion.div 
            className="flex whitespace-nowrap gap-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
              {Array(10).fill(contactData.footerText + " ").map((text, i) => (
                  <span key={i}>{text}</span>
              ))}
          </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
