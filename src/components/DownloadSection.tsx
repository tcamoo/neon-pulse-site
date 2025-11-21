
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Copy, HardDrive, FileAudio, FileVideo, Box, FolderArchive, Check } from 'lucide-react';
import { Resource } from '../types';

interface DownloadSectionProps {
  resources: Resource[];
}

const ProviderBadge = ({ provider }: { provider: string }) => {
    const config = {
        aliyun: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: '阿里云盘' },
        baidu: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: '百度网盘' },
        quark: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', label: '夸克网盘' },
        google: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Google Drive' },
        other: { color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10', label: 'External Link' }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const style = (config as any)[provider] || config.other;

    return (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.color} ${style.border} flex items-center gap-1`}>
            <HardDrive size={10} /> {style.label}
        </span>
    );
};

const ResourceIcon = ({ type }: { type: string }) => {
    switch(type) {
        case 'audio': return <FileAudio size={24} className="text-hot-pink" />;
        case 'video': return <FileVideo size={24} className="text-electric-cyan" />;
        case 'project': return <FolderArchive size={24} className="text-lime-punch" />;
        default: return <Box size={24} className="text-purple-400" />;
    }
};

const ResourceCard = ({ resource, index }: { resource: Resource, index: number }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        if (resource.accessCode) {
            navigator.clipboard.writeText(resource.accessCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-midnight border border-white/10 rounded-xl overflow-hidden hover:border-electric-cyan/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
        >
            {/* Tech Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 animate-shine pointer-events-none"></div>
            
            <div className="p-6 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                        <ResourceIcon type={resource.type} />
                    </div>
                    <ProviderBadge provider={resource.provider} />
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                    {resource.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-1">
                    {resource.description}
                </p>

                <div className="mt-auto space-y-4">
                     <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase">
                         <span>Size: {resource.size || 'Unknown'}</span>
                         <span>{resource.date}</span>
                     </div>

                     <div className="grid grid-cols-1 gap-2">
                         {resource.accessCode && (
                             <button 
                                onClick={handleCopy}
                                className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-white/20 transition-all group/code"
                             >
                                 <span className="text-xs text-slate-400">提取码: <span className="text-lime-punch font-mono font-bold">{resource.accessCode}</span></span>
                                 {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-500 group-hover/code:text-white" />}
                             </button>
                         )}
                         
                         <a 
                            href={resource.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/30 rounded font-bold text-xs uppercase hover:bg-electric-cyan hover:text-midnight transition-all"
                         >
                             <Download size={16} /> ACCESS DATA
                             <ExternalLink size={12} className="ml-1 opacity-50" />
                         </a>
                     </div>
                </div>
            </div>
        </motion.div>
    );
};

const DownloadSection: React.FC<DownloadSectionProps> = ({ resources }) => {
  return (
    <section id="downloads" className="py-32 px-6 relative overflow-hidden bg-[#0a0f1d]">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,128,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 border-b border-white/10 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <HardDrive size={14} className="text-hot-pink" />
                        <span className="font-mono font-bold text-xs text-hot-pink uppercase tracking-widest">Resource Center</span>
                    </div>
                    <h2 className="font-display font-black text-5xl md:text-7xl text-white leading-none">
                        DATA <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-hot-pink to-purple-500">VAULT</span>
                    </h2>
                </div>
                <div className="hidden md:block">
                     <p className="text-slate-400 text-sm font-mono max-w-xs text-right">
                        Access high-fidelity audio stems, exclusive visuals, and project files.
                     </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {resources.length === 0 ? (
                    <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center gap-4">
                        <Box size={48} className="text-slate-600 opacity-50" />
                        <h3 className="font-display text-2xl text-slate-500">VAULT EMPTY</h3>
                        <p className="text-slate-600 text-sm font-mono">No resources currently available.</p>
                    </div>
                ) : (
                    resources.map((resource, index) => (
                        <ResourceCard key={resource.id} resource={resource} index={index} />
                    ))
                )}
            </div>
        </div>
    </section>
  );
};

export default DownloadSection;
