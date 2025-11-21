
import React, { useState, useRef } from 'react';
import type { Track, SiteData, Article, Artist, CloudConfig, Resource } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, Upload, Cloud, HardDrive, Image as ImageIcon, Type, Mail, RefreshCw, Save, Disc, Album, CloudLightning, CloudRain, Eye, EyeOff, FolderOpen, Zap, Lock } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'resources' | 'cloud' | 'contact';
type CloudProvider = 'ali' | 'one' | null;

// Interactive Text Component for Header
const SonicText = ({ text }: { text: string }) => {
    return (
        <div className="flex items-center cursor-default">
            {text.split('').map((char, i) => (
                <motion.span 
                    key={i}
                    whileHover={{ 
                        scaleY: [1, 1.5, 0.8, 1.2, 1], 
                        color: ['#fff', '#D9F99D', '#FF0080', '#06B6D4', '#fff'],
                        textShadow: "0 0 8px rgba(217, 249, 157, 0.8)"
                    }}
                    transition={{ duration: 0.5 }}
                    className="inline-block origin-bottom font-display font-bold text-xl tracking-wider text-white transition-colors"
                    style={{ marginRight: char === ' ' ? '0.5em' : '0' }}
                >
                    {char}
                </motion.span>
            ))}
        </div>
    );
};

const TabButton = ({ 
  id, 
  activeTab, 
  setActiveTab, 
  icon: Icon, 
  label, 
  colorClass 
}: { 
  id: Tab, 
  activeTab: Tab, 
  setActiveTab: (id: Tab) => void, 
  icon: any, 
  label: string, 
  colorClass: string 
}) => (
  <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 p-4 rounded-xl transition-all font-bold text-sm relative overflow-hidden group w-full text-left shrink-0
      ${activeTab === id ? 'bg-white/5 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${colorClass}`}></div>
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 ${activeTab === id ? colorClass : 'bg-transparent'}`}></div>
      <Icon size={18} className={activeTab === id ? 'text-white' : 'opacity-70'} /> 
      <span className="whitespace-nowrap">{label}</span>
  </button>
);

const CloudConfigForm = ({ 
    config, 
    onSave, 
    onCancel, 
    label, 
    color,
    onQuickAuth
}: { 
    config: CloudConfig, 
    onSave: (newConfig: CloudConfig) => void, 
    onCancel: () => void,
    onQuickAuth: () => void,
    label: string,
    color: string
}) => {
    const [localConfig, setLocalConfig] = useState<CloudConfig>(config || { enabled: false, clientId: '', secretKey: '', refreshToken: '', publicDomain: '' });
    const [showSecret, setShowSecret] = useState(false);
    
    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 border border-white/10 rounded-xl p-6 mt-4 space-y-4 relative"
        >
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                <h5 className={`font-bold text-sm ${color} flex items-center gap-2`}>
                    <Cloud size={14} /> {label} 配置 (OAuth)
                </h5>
                <button onClick={onCancel} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 mb-2 flex items-start gap-2">
                    <Lock size={14} className="shrink-0 mt-0.5" />
                    <span>
                        配置 OAuth 应用凭证以获取访问权限。如果没有现有 Token，请使用“快速授权”模拟获取。
                    </span>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Client ID / App Key</label>
                    <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                        value={localConfig.clientId || ''}
                        onChange={(e) => setLocalConfig({...localConfig, clientId: e.target.value})}
                        placeholder="App Client ID"
                    />
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Client Secret</label>
                    <div className="relative">
                        <input 
                            type={showSecret ? "text" : "password"} 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.secretKey || ''}
                            onChange={(e) => setLocalConfig({...localConfig, secretKey: e.target.value})}
                            placeholder="App Secret"
                        />
                        <button 
                            className="absolute right-2 top-2 text-slate-500 hover:text-white"
                            onClick={() => setShowSecret(!showSecret)}
                        >
                            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Refresh Token</label>
                    <div className="flex gap-2">
                         <input 
                            type="password" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.refreshToken || ''}
                            onChange={(e) => setLocalConfig({...localConfig, refreshToken: e.target.value})}
                            placeholder="Enter Refresh Token"
                        />
                        <button 
                            onClick={() => {
                                onQuickAuth();
                                setLocalConfig({...localConfig, refreshToken: `mock_refresh_token_${Date.now()}`});
                            }}
                            className="px-3 bg-white/10 hover:bg-white/20 text-white text-xs rounded border border-white/10 flex items-center gap-1 whitespace-nowrap"
                            title="Simulate OAuth Flow"
                        >
                            <Zap size={12} className="text-yellow-400" /> 快速授权
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        Public Domain / CDN (Optional)
                    </label>
                    <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-electric-cyan text-xs focus:border-electric-cyan outline-none"
                        value={localConfig.publicDomain || ''}
                        onChange={(e) => setLocalConfig({...localConfig, publicDomain: e.target.value})}
                        placeholder="https://cdn.yoursite.com"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
                <button 
                    onClick={() => onSave({...localConfig, enabled: true})}
                    className={`px-6 py-2.5 rounded-lg font-bold text-xs text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-all ${color.replace('text-', 'bg-')}`}
                >
                    <Save size={16} /> 保存配置并挂载
                </button>
            </div>
        </motion.div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ data, updateData, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // --- State for Music ---
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [newTrack, setNewTrack] = useState<Partial<Track>>({ title: '', artist: 'VES', album: '', duration: '', coverUrl: '' });

  // --- State for Resources ---
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
      title: '', description: '', type: 'audio', provider: 'aliyun', link: '', accessCode: '', size: '', date: ''
  });

  // --- State for Cloud Config ---
  const [editingCloud, setEditingCloud] = useState<CloudProvider>(null);

  // --- Handlers ---
  const handleHeroChange = (field: keyof SiteData['hero'], value: string) => updateData({ ...data, hero: { ...data.hero, [field]: value } });
  const handleContactChange = (field: keyof SiteData['contact'], value: string) => updateData({ ...data, contact: { ...data.contact, [field]: value } });

  const handleCloudToggle = (provider: 'ali' | 'one') => {
      if (editingCloud === provider) setEditingCloud(null);
      else setEditingCloud(provider);
  };
  
  const handleSaveCloudConfig = (provider: 'ali' | 'one', config: CloudConfig) => {
      const key = provider === 'ali' ? 'aliDrive' : 'oneDrive';
      updateData(prev => ({ ...prev, integrations: { ...prev.integrations, [key]: config } }));
      setEditingCloud(null);
  };

  const handleQuickAuth = () => {
      alert("Simulating OAuth Popup...\n\nAccess Granted.\nRefresh Token acquired.");
  };

  // Music Handlers
  const addTrack = () => {
      if (!newTrack.title) return;
      const track: Track = {
          id: Date.now().toString(),
          title: newTrack.title || 'Untitled',
          artist: newTrack.artist || 'VES',
          album: newTrack.album || 'Single',
          duration: newTrack.duration || '0:00',
          plays: 0,
          coverUrl: newTrack.coverUrl || 'https://picsum.photos/200',
          audioUrl: ''
      };
      updateData(prev => ({ ...prev, tracks: [track, ...prev.tracks] }));
      setIsAddingTrack(false);
      setNewTrack({ title: '', artist: 'VES' });
  };
  
  const deleteTrack = (id: string) => {
      if(confirm('Delete this track?')) updateData(prev => ({ ...prev, tracks: prev.tracks.filter(t => t.id !== id) }));
  };

  // Resource Handlers
  const addResource = () => {
      if (!newResource.title) return;
      const resource: Resource = {
          id: Date.now().toString(),
          title: newResource.title || 'New Resource',
          description: newResource.description || '',
          type: newResource.type || 'audio',
          provider: newResource.provider || 'aliyun',
          link: newResource.link || '#',
          accessCode: newResource.accessCode,
          size: newResource.size || 'Unknown',
          date: new Date().toLocaleDateString().replace(/\//g, '.')
      };
      updateData(prev => ({ ...prev, resources: [...(prev.resources || []), resource] }));
      setIsAddingResource(false);
      setNewResource({ title: '', description: '', type: 'audio', provider: 'aliyun' });
  };

  const deleteResource = (id: string) => {
      if (confirm("Delete resource?")) updateData(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== id) }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="bg-surface/50 backdrop-blur-md p-4 md:p-6 flex justify-between items-center border-b border-white/5 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-hot-pink to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-hot-pink/20 animate-pulse">
                <Activity size={20} />
            </div>
            <div>
                <SonicText text="VES ADMIN" />
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-lime-punch rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">System Online</p>
                </div>
            </div>
         </div>
         <button onClick={onClose} className="group bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 p-2 rounded-full transition-all border border-transparent hover:border-red-500/50">
            <X size={24} />
         </button>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-2 md:p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-hidden custom-scrollbar no-scrollbar">
            <div className="hidden md:block px-4 py-2 text-xs font-mono text-slate-600 uppercase tracking-widest">MENU</div>
            <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="概览" colorClass="bg-hot-pink" />
            <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="作品库" colorClass="bg-electric-cyan" />
            <TabButton id="resources" activeTab={activeTab} setActiveTab={setActiveTab} icon={HardDrive} label="网盘挂载" colorClass="bg-blue-400" />
            <TabButton id="cloud" activeTab={activeTab} setActiveTab={setActiveTab} icon={RefreshCw} label="云端授权" colorClass="bg-orange-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="联系信息" colorClass="bg-rose-500" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            
            {/* General Tab */}
            {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                         <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest mb-4">首页主视觉</h3>
                         <div className="space-y-4">
                             <div><label className="text-xs text-slate-500 block mb-1">Title L1</label><input value={data.hero.titleLine1} onChange={e => handleHeroChange('titleLine1', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1">Title L2</label><input value={data.hero.titleLine2} onChange={e => handleHeroChange('titleLine2', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1">Subtitle</label><textarea value={data.hero.subtitle} onChange={e => handleHeroChange('subtitle', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" rows={3}/></div>
                         </div>
                    </div>
                </motion.div>
            )}

            {/* Music Tab */}
            {activeTab === 'music' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                     <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">单曲管理</h3>
                        <button onClick={() => setIsAddingTrack(!isAddingTrack)} className="bg-electric-cyan text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white"><Plus size={16}/></button>
                     </div>
                     {isAddingTrack && (
                        <div className="bg-white/5 p-6 rounded-xl mb-6 grid gap-4 border border-white/10">
                            <input placeholder="标题" className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} />
                            <input placeholder="艺术家" className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} />
                            <input placeholder="专辑" className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newTrack.album} onChange={e => setNewTrack({...newTrack, album: e.target.value})} />
                            <input placeholder="封面 URL" className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newTrack.coverUrl} onChange={e => setNewTrack({...newTrack, coverUrl: e.target.value})} />
                            <button onClick={addTrack} className="bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/50 py-2 rounded font-bold">Add Track</button>
                        </div>
                     )}
                     <div className="space-y-2">
                        {data.tracks.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-white/5 p-3 rounded hover:bg-white/10">
                                <div className="flex items-center gap-3">
                                    <img src={t.coverUrl} className="w-10 h-10 rounded object-cover" />
                                    <div><div className="text-white font-bold">{t.title}</div><div className="text-xs text-slate-500">{t.artist}</div></div>
                                </div>
                                <button onClick={() => deleteTrack(t.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        ))}
                     </div>
                </motion.div>
            )}

            {/* Resources (Netdisk) Tab */}
            {activeTab === 'resources' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <HardDrive size={18} className="text-blue-400" />
                            <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest">网盘资源挂载</h3>
                        </div>
                        <button onClick={() => setIsAddingResource(!isAddingResource)} className="bg-blue-400 text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white flex items-center gap-2"><Plus size={16} /> 挂载资源</button>
                    </div>

                    {isAddingResource && (
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="资源名称" />
                                <select className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newResource.provider} onChange={e => setNewResource({...newResource, provider: e.target.value as any})}>
                                    <option value="aliyun">阿里云盘 (Aliyun)</option>
                                    <option value="one">OneDrive</option>
                                    <option value="quark">夸克网盘</option>
                                </select>
                            </div>
                            <input className="bg-black/50 p-3 rounded border border-white/10 text-white font-mono text-xs" value={newResource.link} onChange={e => setNewResource({...newResource, link: e.target.value})} placeholder="分享链接 / 直链" />
                            <div className="grid md:grid-cols-3 gap-4">
                                <input className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newResource.accessCode} onChange={e => setNewResource({...newResource, accessCode: e.target.value})} placeholder="提取码 (可选)" />
                                <input className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newResource.size} onChange={e => setNewResource({...newResource, size: e.target.value})} placeholder="大小 (e.g. 2GB)" />
                                <select className="bg-black/50 p-3 rounded border border-white/10 text-white" value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})}>
                                    <option value="audio">Audio</option>
                                    <option value="video">Video</option>
                                    <option value="project">Project</option>
                                </select>
                            </div>
                            <button onClick={addResource} className="bg-blue-500/20 text-blue-400 border border-blue-500/50 py-2 rounded font-bold hover:bg-blue-500 hover:text-white">Save Resource</button>
                        </div>
                    )}

                    <div className="grid gap-3">
                        {(data.resources || []).map(res => (
                            <div key={res.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-blue-400/30 hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg ${res.provider === 'aliyun' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                                        {res.provider === 'aliyun' ? 'Ali' : 'One'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-lg flex items-center gap-2">{res.title}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                                            <span className="font-mono">{res.size}</span>
                                            {res.accessCode && <span className="text-blue-400 bg-blue-400/10 px-1.5 rounded">Code: {res.accessCode}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => deleteResource(res.id)} className="p-3 text-slate-600 hover:text-red-500 transition-colors bg-white/5 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Cloud Tab */}
             {activeTab === 'cloud' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-4xl mx-auto pb-20">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                        <Cloud size={18} className="text-orange-500"/>
                        <h3 className="text-orange-500 font-mono text-sm uppercase tracking-widest">云端授权 (Integrations)</h3>
                    </div>
                    
                    {/* Aliyun Config */}
                    <div className={`bg-white/5 border border-white/10 rounded-xl p-5 transition-all ${data.integrations?.aliDrive?.enabled ? 'border-orange-500/30 bg-orange-500/5' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.integrations?.aliDrive?.enabled ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                    <CloudLightning size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Aliyun Drive (Personal)</h4>
                                    <p className="text-xs text-slate-500">个人网盘直链解析</p>
                                </div>
                            </div>
                            <button onClick={() => handleCloudToggle('ali')} className="px-4 py-2 rounded-lg font-bold text-xs bg-white/10 text-white hover:bg-white hover:text-midnight transition-colors">
                                {editingCloud === 'ali' ? 'Close' : 'Configure'}
                            </button>
                        </div>
                        <AnimatePresence>
                            {editingCloud === 'ali' && (
                                <CloudConfigForm label="Aliyun Drive" color="text-orange-500" config={data.integrations?.aliDrive!} onSave={(c) => handleSaveCloudConfig('ali', c)} onCancel={() => setEditingCloud(null)} onQuickAuth={handleQuickAuth} />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* OneDrive Config */}
                    <div className={`bg-white/5 border border-white/10 rounded-xl p-5 transition-all ${data.integrations?.oneDrive?.enabled ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.integrations?.oneDrive?.enabled ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                    <CloudRain size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">OneDrive (Personal/E5)</h4>
                                    <p className="text-xs text-slate-500">Microsoft Graph API</p>
                                </div>
                            </div>
                            <button onClick={() => handleCloudToggle('one')} className="px-4 py-2 rounded-lg font-bold text-xs bg-white/10 text-white hover:bg-white hover:text-midnight transition-colors">
                                {editingCloud === 'one' ? 'Close' : 'Configure'}
                            </button>
                        </div>
                        <AnimatePresence>
                            {editingCloud === 'one' && (
                                <CloudConfigForm label="OneDrive" color="text-blue-500" config={data.integrations?.oneDrive!} onSave={(c) => handleSaveCloudConfig('one', c)} onCancel={() => setEditingCloud(null)} onQuickAuth={handleQuickAuth} />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">Email</label><input value={data.contact?.email || ''} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white" /></div>
                            <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">Phone</label><input value={data.contact?.phone || ''} onChange={(e) => handleContactChange('phone', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white" /></div>
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
