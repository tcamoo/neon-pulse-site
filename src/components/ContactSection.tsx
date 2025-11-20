
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Send, MapPin, Smartphone, User, MessageSquare, CheckCircle } from 'lucide-react';
import { ContactConfig } from '../types';

interface ContactSectionProps {
    contactData: ContactConfig;
}

const ContactSection: React.FC<ContactSectionProps> = ({ contactData }) => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <section id="contact" className="py-32 px-6 relative overflow-hidden bg-[#0B1121]">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* Left: Info */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-electric-cyan/30 text-electric-cyan text-[10px] font-mono font-bold uppercase tracking-widest mb-6 bg-electric-cyan/5">
                    <div className="w-2 h-2 bg-electric-cyan rounded-full animate-pulse"></div>
                    Transmission Open
                </div>
                <h2 className="font-display font-black text-6xl md:text-7xl text-white mb-8">
                    GET IN <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-hot-pink">TOUCH</span>
                </h2>
                <p className="text-slate-400 text-lg mb-12 max-w-md leading-relaxed">
                    Ready to collaborate or book a show? Send a signal through the encrypted channel below.
                </p>

                <div className="space-y-8">
                    <div className="flex items-start gap-6 group">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-electric-cyan group-hover:bg-electric-cyan group-hover:text-midnight transition-all">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-1 font-display">Management & Booking</h4>
                            <a href={`mailto:${contactData.email}`} className="text-slate-400 font-mono text-sm hover:text-hot-pink transition-colors">
                                {contactData.email}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-6 group">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-hot-pink group-hover:bg-hot-pink group-hover:text-white transition-all">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-1 font-display">Press Inquiries</h4>
                            <a href={`tel:${contactData.phone.replace(/\D/g, '')}`} className="text-slate-400 font-mono text-sm hover:text-hot-pink transition-colors">
                                {contactData.phone}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-6 group">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lime-punch group-hover:bg-lime-punch group-hover:text-midnight transition-all">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-1 font-display">Studio Location</h4>
                            <p className="text-slate-400 font-mono text-sm">
                                {contactData.addressLine1}, <br/> {contactData.addressLine2}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden"
            >
                {/* Decorative Form Header */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <div className="font-mono text-xs text-slate-500 uppercase tracking-widest">Secure Message Protocol</div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                </div>

                {formState === 'success' ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center py-12"
                    >
                        <div className="w-20 h-20 bg-lime-punch/20 rounded-full flex items-center justify-center text-lime-punch mb-6 border border-lime-punch/50 shadow-[0_0_20px_rgba(217,249,157,0.3)]">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-3xl font-display font-black text-white mb-2">MESSAGE SENT</h3>
                        <p className="text-slate-400 font-mono text-sm">We will respond within 24 hours.</p>
                        <button onClick={() => setFormState('idle')} className="mt-8 text-electric-cyan hover:text-white font-bold uppercase text-xs tracking-widest">
                            Send another message
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-electric-cyan transition-colors flex items-center gap-2">
                                    <User size={12} /> Name
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-electric-cyan focus:outline-none transition-colors placeholder:text-white/10" 
                                    placeholder="ENTER_NAME"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-electric-cyan transition-colors flex items-center gap-2">
                                    <Mail size={12} /> Email
                                </label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-electric-cyan focus:outline-none transition-colors placeholder:text-white/10" 
                                    placeholder="ENTER_EMAIL"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-electric-cyan transition-colors flex items-center gap-2">
                                <MessageSquare size={12} /> Message
                            </label>
                            <textarea 
                                required 
                                rows={4}
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-electric-cyan focus:outline-none transition-colors placeholder:text-white/10 resize-none" 
                                placeholder="TYPE_YOUR_MESSAGE_HERE..."
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={formState === 'submitting'}
                                className="w-full bg-gradient-to-r from-hot-pink to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 relative overflow-hidden group shadow-lg"
                            >
                                {formState === 'submitting' ? (
                                    <span className="animate-pulse">SENDING DATA...</span>
                                ) : (
                                    <>
                                        <span className="relative z-10">TRANSMIT MESSAGE</span>
                                        <Send size={18} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;