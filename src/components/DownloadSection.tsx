
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Copy, HardDrive, FileAudio, FileVideo, Box, FolderArchive, Check } from 'lucide-react';
import type { Resource } from '../types';

interface DownloadSectionProps {
  resources: Resource[];
}

const ProviderBadge = ({ provider }: { provider: string }) => {
    const config = {
        aliyun: { color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Aliyun' },
        baidu: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Baidu' },
        quark: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Quark' },
        google: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'GDrive' },
        other: { color: 'text-slate-400', bg: 'bg-white/5', label: 'Link' }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const style = (config as any)[provider] || config.other;
    return (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-transparent ${style.bg} ${style.color}`}>
            {style.label}
        </span>
    );
};

const ResourceIcon = ({ type }: { type: string }) => {
    switch(type) {
        case 'audio': return <FileAudio size={18} className="text-hot-pink" />;
        case 'video': return <FileVideo size={18} className="text-electric-cyan" />;
        case 'project': return <FolderArchive size={18} className="text-lime-punch" />;
        default: return <Box size={18} className="text-purple-400" />;
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
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group bg-[#0f1522] border border-white/10 rounded-lg p-4 hover:border-electric-cyan/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center border border-white/10">
                        <ResourceIcon type={resource.type} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-tight group-hover:text-electric-cyan transition-colors line-clamp-1" title={resource.title}>
                            {resource.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <ProviderBadge provider={resource.provider} />
                            <span className="text-[10px] text-slate-500 font-mono">{resource.size}</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
                {resource.description}
            </p>

            <div className="flex items-center gap-2 mt-auto">
                {resource.accessCode && (
                    <button 
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-white/20 transition-all text-[10px] text-slate-400"
                    >
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        Code: <span className="text-white font-mono">{resource.accessCode}</span>
                    </button>
                )}
                <a 
                href={resource.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-1 px-3 py-1.5 bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20 rounded font-bold text-[10px] uppercase hover:bg-electric-cyan hover:text-midnight transition-all ${!resource.accessCode ? 'flex-1' : ''}`}
                >
                    <Download size={12} /> Get
                </a>
            </div>
        </motion.div>
    );
};

const DownloadSection: React.FC<DownloadSectionProps> = ({ resources }) => {
  return (
    <section id="downloads" className="py-20 px-6 bg-[#0a0f1d] border-t border-white/5">
        <div className="container mx-auto max-w-6xl relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                        <HardDrive size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-2xl text-white leading-none">RESOURCES</h2>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Downloads & Stems</p>
                    </div>
                </div>
                <div className="h-px bg-white/10 flex-1 ml-8 hidden md:block"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {resources.length === 0 ? (
                    <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5 flex flex-col items-center gap-2">
                        <Box size={32} className="text-slate-600 opacity-50" />
                        <p className="text-slate-600 text-xs font-mono">Vault Empty</p>
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
