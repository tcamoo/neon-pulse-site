
import React, { useState, useEffect } from 'react';
import type { Track, SiteData, Article, Artist, Resource, CloudConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, HardDrive, Mail, Database, Save, Link2, Cloud, FileAudio, Image, Check, Search, Folder } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'resources' | 'storage' | 'contact';

// --- Components ---

const TabButton = ({ id, activeTab, setActiveTab, icon: Icon, label, colorClass }: any) => (
  <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 p-4 rounded-xl transition-all font-bold text-sm relative overflow-hidden group w-full text-left shrink-0
      ${activeTab === id ? 'bg-white/5 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 ${activeTab === id ? colorClass : 'bg-transparent'}`}></div>
      <Icon size={18} className={activeTab === id ? 'text-white' : 'opacity-70'} /> 
      <span className="whitespace-nowrap">{label}</span>
  </button>
);

const FilePickerModal = ({ isOpen, onClose, onSelect, config }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void, config: CloudConfig }) => {
    const [search, setSearch] = useState('');
    // Mock files since we can't actually list R2 bucket from frontend without a worker API
    const [files] = useState([
        { name: 'midnight_city_master.mp3', type: 'audio', size: '8.4 MB' },
        { name: 'neon_dreams_cover.jpg', type: 'image', size: '2.1 MB' },
        { name: 'demo_track_v2.wav', type: 'audio', size: '42.1 MB' },
        { name: 'ambient_bg_loop.mp3', type: 'audio', size: '5.2 MB' },
        { name: 'artist_profile_pic.png', type: 'image', size: '1.8 MB' },
    ]);

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl"
            >
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Database size={18} className="text-yellow-500" />
                        <h3 className="font-bold text-white">Select File from Storage</h3>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white" /></button>
                </div>

                {/* Search & Config Check */}
                <div className="p-4 bg-white/5 space-y-2">
                    {!config.enabled || !config.publicDomain ? (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 flex items-center gap-2">
                            <X size={14} /> Storage not configured correctly. Please setup Public Domain in Storage tab.
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-xs text-green-400 flex items-center gap-2">
                            <Check size={14} /> Connected to: {config.publicDomain}
                        </div>
                    )}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 text-white text-sm outline-none focus:border-yellow-500"
                            placeholder="Search files..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredFiles.map((file, i) => (
                        <div 
                            key={i} 
                            onClick={() => {
                                if (config.publicDomain) {
                                    const cleanDomain = config.publicDomain.replace(/\/$/, '');
                                    onSelect(`${cleanDomain}/${file.name}`);
                                    onClose();
                                } else {
                                    alert("Please configure Public Domain first");
                                }
                            }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-yellow-500/50 cursor-pointer group transition-all"
                        >
                            <div className="flex items-center gap-3">
                                {file.type === 'audio' ? <FileAudio size={20} className="text-slate-400 group-hover:text-yellow-500" /> : <Image size={20} className="text-slate-400 group-hover:text-yellow-500" />}
                                <span className="text-sm text-slate-300 group-hover:text-white font-mono">{file.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">{file.size}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ data, updateData, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerCallback, setPickerCallback] = useState<(url: string) => void>(() => {});

  // Open picker helper
  const openPicker = (callback: (url: string) => void) => {
      setPickerCallback(() => callback);
      setShowPicker(true);
  };

  // --- Music State ---
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [trackMode, setTrackMode] = useState<'native' | 'netease'>('native');
  const [newTrack, setNewTrack] = useState<Partial<Track>>({ title: '', artist: 'VES', album: 'Single', duration: '', coverUrl: '', audioUrl: '', neteaseId: '' });

  // --- Resource State ---
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({ title: '', provider: 'aliyun', type: 'project', link: '', accessCode: '' });

  // --- Handlers ---
  const addTrack = () => {
      if (!newTrack.title) return;
      const track: Track = {
          id: Date.now().toString(),
          title: newTrack.title || 'Untitled',
          artist: newTrack.artist || 'VES',
          album: newTrack.album || 'Single',
          duration: newTrack.duration || '0:00',
          plays: 0,
          coverUrl: newTrack.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
          audioUrl: trackMode === 'native' ? newTrack.audioUrl : undefined,
          neteaseId: trackMode === 'netease' ? newTrack.neteaseId : undefined,
      };
      updateData(prev => ({ ...prev, tracks: [track, ...prev.tracks] }));
      setIsAddingTrack(false);
      setNewTrack({ title: '', artist: 'VES', album: 'Single', duration: '', coverUrl: '', audioUrl: '', neteaseId: '' });
  };

  const addResource = () => {
      if (!newResource.title) return;
      const resource: Resource = {
          id: Date.now().toString(),
          title: newResource.title || 'Untitled',
          description: newResource.description || '',
          type: newResource.type || 'other',
          provider: newResource.provider || 'aliyun',
          link: newResource.link || '#',
          accessCode: newResource.accessCode,
          size: newResource.size || 'Unknown',
          date: new Date().toLocaleDateString()
      };
      updateData(prev => ({ ...prev, resources: [...(prev.resources || []), resource] }));
      setIsAddingResource(false);
      setNewResource({ title: '', provider: 'aliyun', type: 'project', link: '', accessCode: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col font-sans"
    >
      <FilePickerModal 
         isOpen={showPicker} 
         onClose={() => setShowPicker(false)} 
         onSelect={pickerCallback} 
         config={data.storage}
      />

      {/* Header */}
      <div className="bg-surface/50 backdrop-blur-md p-4 md:p-6 flex justify-between items-center border-b border-white/5 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-hot-pink to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-hot-pink/20 animate-pulse">
                <Activity size={20} />
            </div>
            <div>
                <h2 className="font-display font-bold text-xl text-white tracking-wider">VES ADMIN SYSTEM</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">System Online</p>
                </div>
            </div>
         </div>
         <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
         </button>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-2 md:p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-hidden custom-scrollbar no-scrollbar">
            <div className="hidden md:block px-4 py-2 text-xs font-mono text-slate-600 uppercase tracking-widest">MENU</div>
            <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="Overview" colorClass="bg-hot-pink" />
            <TabButton id="storage" activeTab={activeTab} setActiveTab={setActiveTab} icon={Database} label="Storage / R2" colorClass="bg-yellow-500" />
            <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="Music Library" colorClass="bg-electric-cyan" />
            <TabButton id="resources" activeTab={activeTab} setActiveTab={setActiveTab} icon={HardDrive} label="Netdisk Resources" colorClass="bg-blue-400" />
            <TabButton id="articles" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText} label="News / Logs" colorClass="bg-lime-punch" />
            <TabButton id="artists" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mic2} label="Artists" colorClass="bg-purple-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="Contact" colorClass="bg-rose-500" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            
            {/* --- STORAGE TAB (NEW) --- */}
            {activeTab === 'storage' && (
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                         <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                            <Database size={18} className="text-yellow-500" />
                            <h3 className="text-yellow-500 font-mono text-sm uppercase tracking-widest">Cloud Storage Configuration (R2 / S3)</h3>
                         </div>
                         
                         <div className="space-y-4">
                             <div className="flex items-center justify-between bg-yellow-500/5 p-4 rounded-lg border border-yellow-500/20 mb-6">
                                 <div>
                                     <h4 className="text-white font-bold text-sm">Direct Link Generation</h4>
                                     <p className="text-xs text-slate-400 mt-1">Use Cloudflare R2 to host high-quality audio files.</p>
                                 </div>
                                 <button 
                                    onClick={() => updateData(prev => ({...prev, storage: {...prev.storage, enabled: !prev.storage.enabled}}))}
                                    className={`px-4 py-2 rounded text-xs font-bold ${data.storage.enabled ? 'bg-green-500 text-midnight' : 'bg-white/10 text-slate-400'}`}
                                 >
                                     {data.storage.enabled ? 'ENABLED' : 'DISABLED'}
                                 </button>
                             </div>

                             <div className="grid gap-4">
                                 <div>
                                     <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Provider</label>
                                     <select 
                                        value={data.storage.provider} 
                                        onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, provider: e.target.value as any}}))}
                                        className="w-full bg-black/30 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500"
                                     >
                                         <option value="r2">Cloudflare R2</option>
                                         <option value="s3">Amazon S3 / Compatible</option>
                                     </select>
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Public Domain (Required for Playback)</label>
                                     <div className="flex items-center gap-2">
                                        <Link2 size={16} className="text-slate-500"/>
                                        <input 
                                            value={data.storage.publicDomain} 
                                            onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, publicDomain: e.target.value}}))}
                                            className="flex-1 bg-black/30 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500 font-mono text-sm"
                                            placeholder="https://pub-xxxxxxxx.r2.dev"
                                        />
                                     </div>
                                     <p className="text-[10px] text-slate-500 mt-1">Example: https://music.ves.com or your R2.dev subdomain</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Access Key ID</label>
                                        <input 
                                            value={data.storage.accessKeyId} 
                                            onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, accessKeyId: e.target.value}}))}
                                            className="w-full bg-black/30 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500 font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Secret Access Key</label>
                                        <input 
                                            type="password"
                                            value={data.storage.secretAccessKey} 
                                            onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, secretAccessKey: e.target.value}}))}
                                            className="w-full bg-black/30 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500 font-mono text-sm"
                                        />
                                    </div>
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Bucket Name</label>
                                     <input 
                                        value={data.storage.bucketName} 
                                        onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, bucketName: e.target.value}}))}
                                        className="w-full bg-black/30 border border-white/10 rounded p-3 text-white outline-none focus:border-yellow-500"
                                     />
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {/* --- MUSIC TAB --- */}
            {activeTab === 'music' && (
                <div className="max-w-4xl mx-auto pb-20">
                     <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">Track Management</h3>
                        <button onClick={() => setIsAddingTrack(!isAddingTrack)} className="bg-electric-cyan text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white flex items-center gap-2"><Plus size={16}/> Add Track</button>
                     </div>

                     {isAddingTrack && (
                        <div className="bg-white/5 p-6 rounded-xl mb-6 grid gap-4 border border-white/10 animate-in fade-in slide-in-from-top-4">
                            {/* Toggle Mode */}
                            <div className="flex gap-2 mb-2 bg-black/20 p-1 rounded-lg w-fit">
                                <button onClick={() => setTrackMode('native')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${trackMode === 'native' ? 'bg-electric-cyan text-midnight' : 'text-slate-400 hover:text-white'}`}>Direct Link / R2</button>
                                <button onClick={() => setTrackMode('netease')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${trackMode === 'netease' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}>Netease ID</button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Title" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} />
                                <input placeholder="Artist" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} />
                            </div>
                            
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input placeholder="Cover Image URL" className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-electric-cyan outline-none pl-10" value={newTrack.coverUrl} onChange={e => setNewTrack({...newTrack, coverUrl: e.target.value})} />
                                    <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                                <button 
                                    onClick={() => openPicker((url) => setNewTrack(prev => ({ ...prev, coverUrl: url })))}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded px-3 text-slate-400 hover:text-white"
                                >
                                    <Cloud size={18} />
                                </button>
                            </div>

                            {trackMode === 'native' ? (
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input placeholder="Audio URL (MP3/WAV)" className="w-full bg-black/50 p-3 rounded border border-white/10 text-white font-mono text-xs focus:border-electric-cyan outline-none pl-10" value={newTrack.audioUrl} onChange={e => setNewTrack({...newTrack, audioUrl: e.target.value})} />
                                        <FileAudio size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    </div>
                                    <button 
                                        onClick={() => openPicker((url) => setNewTrack(prev => ({ ...prev, audioUrl: url })))}
                                        className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 rounded px-4 text-xs font-bold flex items-center gap-2"
                                    >
                                        <Database size={16} /> Select from Storage
                                    </button>
                                </div>
                            ) : (
                                <input placeholder="Netease Song ID (e.g. 186016)" className="bg-black/50 p-3 rounded border border-red-500/30 text-white font-mono text-xs focus:border-red-500 outline-none" value={newTrack.neteaseId} onChange={e => setNewTrack({...newTrack, neteaseId: e.target.value})} />
                            )}
                            
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsAddingTrack(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">Cancel</button>
                                <button onClick={addTrack} className="bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/50 px-6 py-2 rounded font-bold hover:bg-electric-cyan hover:text-midnight transition-colors">Save Track</button>
                            </div>
                        </div>
                     )}

                     <div className="space-y-2">
                        {data.tracks.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors group border border-transparent hover:border-white/10">
                                <div className="flex items-center gap-4">
                                    <img src={t.coverUrl} className="w-12 h-12 rounded-lg object-cover shadow-md" />
                                    <div>
                                        <div className="text-white font-bold flex items-center gap-2">
                                            {t.title}
                                            {t.neteaseId && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">Netease</span>}
                                            {t.audioUrl?.includes(data.storage.publicDomain) && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">Cloud Storage</span>}
                                        </div>
                                        <div className="text-xs text-slate-500">{t.artist} • {t.album}</div>
                                    </div>
                                </div>
                                <button onClick={() => updateData(prev => ({ ...prev, tracks: prev.tracks.filter(track => track.id !== t.id) }))} className="p-2 text-slate-600 hover:text-red-500 hover:bg-white/10 rounded-full transition-all"><Trash2 size={18}/></button>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* --- RESOURCES TAB (NETDISK) --- */}
            {activeTab === 'resources' && (
                <div className="max-w-4xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest">Netdisk Mounts (Downloads)</h3>
                        <button onClick={() => setIsAddingResource(!isAddingResource)} className="bg-blue-400 text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white flex items-center gap-2"><Plus size={16} /> Add Resource</button>
                    </div>

                    {isAddingResource && (
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="Resource Title" />
                                <select className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.provider} onChange={e => setNewResource({...newResource, provider: e.target.value as any})}>
                                    <option value="aliyun">Aliyun Drive</option>
                                    <option value="baidu">Baidu Netdisk</option>
                                    <option value="quark">Quark</option>
                                    <option value="google">Google Drive</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <input className="flex-1 bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none font-mono text-xs" value={newResource.link} onChange={e => setNewResource({...newResource, link: e.target.value})} placeholder="Share Link (https://...)" />
                                <input className="w-32 bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none font-mono text-xs" value={newResource.accessCode} onChange={e => setNewResource({...newResource, accessCode: e.target.value})} placeholder="Code" />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsAddingResource(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">Cancel</button>
                                <button onClick={addResource} className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-6 py-2 rounded font-bold hover:bg-blue-500 hover:text-white transition-colors">Mount Resource</button>
                            </div>
                        </div>
                    )}

                    <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-12 bg-white/5 p-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-white/5">
                            <div className="col-span-6 pl-2">Title / Link</div>
                            <div className="col-span-4">Provider</div>
                            <div className="col-span-2 text-right pr-2">Action</div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {(data.resources || []).map(res => (
                                <div key={res.id} className="grid grid-cols-12 p-4 items-center hover:bg-white/5 transition-colors text-sm">
                                    <div className="col-span-6 flex items-center gap-3 pl-2">
                                        <Folder size={20} className="text-blue-400 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-white truncate">{res.title}</div>
                                            <div className="text-xs text-slate-500 truncate font-mono">{res.link}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-300 uppercase">{res.provider}</span>
                                    </div>
                                    <div className="col-span-2 flex justify-end pr-2">
                                        <button onClick={() => updateData(prev => ({...prev, resources: prev.resources.filter(r => r.id !== res.id)}))} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* General, Artists, Articles, Contact Tabs would go here following similar patterns... */}
             {activeTab === 'general' && (
                <div className="max-w-4xl mx-auto pb-20">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest mb-4">Hero Settings</h3>
                        <div className="space-y-4">
                             <div><label className="text-xs text-slate-500 block mb-1 font-bold">Title Line 1</label><input value={data.hero.titleLine1} onChange={e => updateData(prev => ({...prev, hero: {...prev.hero, titleLine1: e.target.value}}))} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white outline-none"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1 font-bold">Title Line 2</label><input value={data.hero.titleLine2} onChange={e => updateData(prev => ({...prev, hero: {...prev.hero, titleLine2: e.target.value}}))} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white outline-none"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1 font-bold">Subtitle</label><textarea value={data.hero.subtitle} onChange={e => updateData(prev => ({...prev, hero: {...prev.hero, subtitle: e.target.value}}))} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white outline-none" rows={2}/></div>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
