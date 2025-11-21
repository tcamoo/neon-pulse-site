
import React, { useState, useRef, useEffect } from 'react';
import type { Track, SiteData, Article, Artist, FeaturedAlbum, CloudConfig, Resource } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, Upload, Cloud, CheckCircle2, AlertCircle, HardDrive, Database, Image as ImageIcon, Menu, Type, Mail, Key, RefreshCw, Save, Disc, Album, Phone, MapPin, FileEdit, ToggleLeft, ToggleRight, CloudLightning, CloudRain, Eye, EyeOff, FolderOpen, ArrowUp, Link, Box, Zap, Lock } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'resources' | 'cloud' | 'contact';
type CloudProvider = 'ali' | 'one' | 'cf' | null;

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
    type = 's3'
}: { 
    config: CloudConfig, 
    onSave: (newConfig: CloudConfig) => void, 
    onCancel: () => void,
    label: string,
    color: string,
    type?: 's3' | 'oauth'
}) => {
    const [localConfig, setLocalConfig] = useState<CloudConfig>(config || { enabled: false, accessKey: '', secretKey: '', bucket: '', endpoint: '', publicDomain: '', clientId: '', refreshToken: '' });
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
                    <Cloud size={14} /> {label} 配置 ({type === 's3' ? 'S3 / Object Storage' : 'OAuth / Netdisk'})
                </h5>
                <button onClick={onCancel} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            
            {/* Form for S3 Compatible Services (Cloudflare R2, Aliyun OSS) */}
            {type === 's3' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            Endpoint (API URL)
                        </label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.endpoint || ''}
                            onChange={(e) => setLocalConfig({...localConfig, endpoint: e.target.value})}
                            placeholder="e.g. oss-cn-shanghai.aliyuncs.com or https://<id>.r2.cloudflarestorage.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Access Key ID</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.accessKey || ''}
                            onChange={(e) => setLocalConfig({...localConfig, accessKey: e.target.value})}
                            placeholder="Access Key"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Access Key Secret</label>
                        <div className="relative">
                            <input 
                                type={showSecret ? "text" : "password"} 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                                value={localConfig.secretKey || ''}
                                onChange={(e) => setLocalConfig({...localConfig, secretKey: e.target.value})}
                                placeholder="••••••••••••"
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Bucket Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.bucket || ''}
                            onChange={(e) => setLocalConfig({...localConfig, bucket: e.target.value})}
                            placeholder="Bucket Name"
                        />
                    </div>
                    <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            Public Domain (CDN)
                        </label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-electric-cyan text-xs focus:border-electric-cyan outline-none"
                            value={localConfig.publicDomain || ''}
                            onChange={(e) => setLocalConfig({...localConfig, publicDomain: e.target.value})}
                            placeholder="https://files.yoursite.com"
                        />
                    </div>
                </div>
            )}

             {/* Form for OAuth Services (OneDrive, Aliyun Drive) */}
             {type === 'oauth' && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 mb-2 flex items-start gap-2">
                        <Lock size={14} className="shrink-0 mt-0.5" />
                        <span>
                            注意：此处配置 OAuth 应用凭证 (Client ID/Secret)。要生成下载链接，请使用“快速授权”模拟获取 Token。
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Client Secret / App Secret</label>
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Refresh Token (Long-lived)</label>
                         <input 
                            type="password" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.refreshToken || ''}
                            onChange={(e) => setLocalConfig({...localConfig, refreshToken: e.target.value})}
                            placeholder="Refresh Token"
                        />
                    </div>
                    
                    {/* Quick Auth Simulation */}
                    <button 
                        onClick={() => alert("Redirecting to Provider OAuth Page... (Simulation)\n\nIn a real app, this would open a popup to authorize and retrieve the Refresh Token automatically.")}
                        className="mt-2 py-3 w-full bg-white text-midnight font-bold text-xs rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        <Zap size={14} /> 快速授权 (Quick Auth)
                    </button>
                </div>
            )}

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
  
  // --- State for Resources (New) ---
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
      title: '', description: '', type: 'audio', provider: 'aliyun', link: '', accessCode: '', size: '', date: ''
  });

  // --- State for Cloud Config ---
  const [editingCloud, setEditingCloud] = useState<CloudProvider>(null);

  // --- Sync Status State ---
  const [kvSyncSecret, setKvSyncSecret] = useState(() => localStorage.getItem('ves_sync_secret') || '');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // --- Helpers & Handlers ---
  const handleHeroChange = (field: keyof SiteData['hero'], value: string) => updateData({ ...data, hero: { ...data.hero, [field]: value } });
  const handleContactChange = (field: keyof SiteData['contact'], value: string) => updateData({ ...data, contact: { ...data.contact, [field]: value } });

  // Cloud Toggle Logic
  const handleCloudToggle = (provider: 'ali' | 'one' | 'cf') => {
      if (editingCloud === provider) {
          setEditingCloud(null);
      } else {
          setEditingCloud(provider);
      }
  };
  
  const handleDisconnect = (provider: 'ali' | 'one' | 'cf') => {
      let key: keyof SiteData['integrations'];
      if (provider === 'cf') key = 'cloudflare';
      else if (provider === 'ali') key = 'aliDrive';
      else if (provider === 'one') key = 'oneDrive';
      else return;

      if (window.confirm("确定要断开连接吗？这将清除本地的认证信息。")) {
          updateData(prev => ({ 
              ...prev, 
              integrations: { ...prev.integrations, [key]: { ...prev.integrations[key], enabled: false } } 
          }));
          setEditingCloud(null);
      }
  }

  const handleSaveCloudConfig = (provider: 'ali' | 'one' | 'cf', config: CloudConfig) => {
      let key: keyof SiteData['integrations'];
      if (provider === 'cf') key = 'cloudflare';
      else if (provider === 'ali') key = 'aliDrive';
      else if (provider === 'one') key = 'oneDrive';
      else return;

      updateData(prev => ({ 
          ...prev, 
          integrations: { ...prev.integrations, [key]: config } 
      }));
      setEditingCloud(null);
  };

  // --- Resource Handlers ---
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
      setNewResource({ title: '', description: '', type: 'audio', provider: 'aliyun', link: '', accessCode: '', size: '', date: '' });
  };

  const deleteResource = (id: string) => {
      if (confirm("确认删除该资源链接吗？")) {
          updateData(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== id) }));
      }
  }

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
                <SonicText text="后台管理" />
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-lime-punch rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Admin Mode • v2.6</p>
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
            <div className="hidden md:block px-4 py-2 text-xs font-mono text-slate-600 uppercase tracking-widest">系统菜单</div>
            <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="网站概览" colorClass="bg-hot-pink" />
            <TabButton id="resources" activeTab={activeTab} setActiveTab={setActiveTab} icon={HardDrive} label="资源/网盘" colorClass="bg-blue-400" />
            <TabButton id="cloud" activeTab={activeTab} setActiveTab={setActiveTab} icon={RefreshCw} label="云端集成" colorClass="bg-orange-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="联系信息" colorClass="bg-rose-500" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            
            {/* General Tab */}
            {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                         <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest mb-4">首页设置</h3>
                         <div className="space-y-4">
                             <div><label className="text-xs text-slate-500 block mb-1">主标题 1</label><input value={data.hero.titleLine1} onChange={e => handleHeroChange('titleLine1', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1">主标题 2</label><input value={data.hero.titleLine2} onChange={e => handleHeroChange('titleLine2', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1">副标题</label><textarea value={data.hero.subtitle} onChange={e => handleHeroChange('subtitle', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" rows={3}/></div>
                             <div><label className="text-xs text-slate-500 block mb-1">滚动字幕</label><input value={data.hero.marqueeText} onChange={e => handleHeroChange('marqueeText', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"/></div>
                         </div>
                    </div>
                </motion.div>
            )}

            {/* Resources (Netdisk) Tab */}
            {activeTab === 'resources' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <HardDrive size={18} className="text-blue-400" />
                            <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest">网盘资源挂载 (Mounts)</h3>
                        </div>
                        <button 
                            onClick={() => setIsAddingResource(!isAddingResource)}
                            className="bg-blue-400 text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> {isAddingResource ? '取消' : '添加资源'}
                        </button>
                    </div>

                    {isAddingResource && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4 shadow-inner">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">资源标题</label>
                                    <input className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="例如: 2025 现场素材包" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">来源/网盘</label>
                                    <select className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.provider} onChange={e => setNewResource({...newResource, provider: e.target.value as any})}>
                                        <option value="aliyun">阿里云盘 (Aliyun Drive)</option>
                                        <option value="baidu">百度网盘 (Baidu Netdisk)</option>
                                        <option value="quark">夸克网盘 (Quark)</option>
                                        <option value="google">Google Drive</option>
                                    </select>
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">分享链接 / 直链</label>
                                <input className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none font-mono text-xs" value={newResource.link} onChange={e => setNewResource({...newResource, link: e.target.value})} placeholder="https://..." />
                            </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">提取码</label>
                                    <input className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none font-mono" value={newResource.accessCode} onChange={e => setNewResource({...newResource, accessCode: e.target.value})} placeholder="可选" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">大小</label>
                                    <input className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.size} onChange={e => setNewResource({...newResource, size: e.target.value})} placeholder="e.g. 1.5 GB" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">文件类型</label>
                                    <select className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})}>
                                        <option value="audio">Audio</option>
                                        <option value="video">Video</option>
                                        <option value="project">Project File</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                             <button onClick={addResource} className="bg-blue-500/20 text-blue-400 border border-blue-500/50 font-bold py-3 rounded-lg hover:bg-blue-500 hover:text-midnight transition-all flex justify-center items-center gap-2 mt-2">
                                <Save size={18} /> 挂载资源
                            </button>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        {(data.resources || []).length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-white/10 rounded-xl text-slate-500 flex flex-col items-center gap-3">
                                <FolderOpen size={40} className="opacity-50" />
                                <p>暂无挂载资源</p>
                            </div>
                        ) : (
                            data.resources.map(res => (
                                <div key={res.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-blue-400/30 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg ${res.provider === 'aliyun' ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : res.provider === 'baidu' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' : 'bg-white/10 text-slate-400'}`}>
                                            {res.provider === 'aliyun' ? 'Ali' : res.provider === 'baidu' ? 'Pan' : 'HD'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg flex items-center gap-2">
                                                {res.title}
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-mono uppercase">{res.type}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                                                <span className="font-mono">{res.size}</span>
                                                {res.accessCode && <span className="text-blue-400 bg-blue-400/10 px-1.5 rounded">提取码: {res.accessCode}</span>}
                                                <a href={res.link} target="_blank" className="hover:text-white flex items-center gap-1 border-b border-transparent hover:border-white transition-colors"><Link size={10}/> Direct Link</a>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteResource(res.id)} className="p-3 text-slate-600 hover:text-red-500 transition-colors bg-white/5 rounded-lg hover:bg-white/10"><Trash2 size={18} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}

            {/* Cloud Tab */}
             {activeTab === 'cloud' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-4xl mx-auto pb-20">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                        <Cloud size={18} className="text-orange-500"/>
                        <h3 className="text-orange-500 font-mono text-sm uppercase tracking-widest">云端集成 (Cloud Integrations)</h3>
                    </div>
                    
                    <p className="text-slate-400 text-sm">配置第三方存储服务以启用高级功能。支持 S3 兼容存储及 OAuth 网盘授权。</p>

                    {/* Aliyun Config */}
                    <div className={`bg-white/5 border border-white/10 rounded-xl p-5 transition-all ${data.integrations?.aliDrive?.enabled ? 'border-orange-500/30 bg-orange-500/5' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.integrations?.aliDrive?.enabled ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                    <CloudLightning size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        Aliyun OSS
                                        {data.integrations?.aliDrive?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 rounded-full">Active</span>}
                                    </h4>
                                    <p className="text-xs text-slate-500">Object Storage Service (S3)</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {data.integrations?.aliDrive?.enabled && (
                                    <button onClick={() => handleDisconnect('ali')} className="px-4 py-2 rounded-lg font-bold text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                        断开
                                    </button>
                                )}
                                <button onClick={() => handleCloudToggle('ali')} className="px-4 py-2 rounded-lg font-bold text-xs bg-white/10 text-white hover:bg-white hover:text-midnight transition-colors">
                                    {editingCloud === 'ali' ? '关闭' : '配置/挂载'}
                                </button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {editingCloud === 'ali' && (
                                <CloudConfigForm label="Aliyun OSS" color="text-orange-500" config={data.integrations?.aliDrive!} onSave={(config) => handleSaveCloudConfig('ali', config)} onCancel={() => setEditingCloud(null)} type="s3" />
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
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        Microsoft OneDrive
                                        {data.integrations?.oneDrive?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 rounded-full">Active</span>}
                                    </h4>
                                    <p className="text-xs text-slate-500">Personal / Business (OAuth)</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {data.integrations?.oneDrive?.enabled && (
                                    <button onClick={() => handleDisconnect('one')} className="px-4 py-2 rounded-lg font-bold text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                        断开
                                    </button>
                                )}
                                <button onClick={() => handleCloudToggle('one')} className="px-4 py-2 rounded-lg font-bold text-xs bg-white/10 text-white hover:bg-white hover:text-midnight transition-colors">
                                    {editingCloud === 'one' ? '关闭' : '配置/挂载'}
                                </button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {editingCloud === 'one' && (
                                <CloudConfigForm label="OneDrive" color="text-blue-500" config={data.integrations?.oneDrive!} onSave={(config) => handleSaveCloudConfig('one', config)} onCancel={() => setEditingCloud(null)} type="oauth" />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Cloudflare R2 Config */}
                    <div className={`bg-white/5 border border-white/10 rounded-xl p-5 transition-all ${data.integrations?.cloudflare?.enabled ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.integrations?.cloudflare?.enabled ? 'bg-yellow-500 text-midnight' : 'bg-white/10 text-slate-500'}`}>
                                    <Database size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        Cloudflare R2
                                        {data.integrations?.cloudflare?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 rounded-full">Active</span>}
                                    </h4>
                                    <p className="text-xs text-slate-500">S3 Compatible Storage</p>
                                </div>
                            </div>
                             <div className="flex gap-2">
                                {data.integrations?.cloudflare?.enabled && (
                                    <button onClick={() => handleDisconnect('cf')} className="px-4 py-2 rounded-lg font-bold text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                        断开
                                    </button>
                                )}
                                <button onClick={() => handleCloudToggle('cf')} className="px-4 py-2 rounded-lg font-bold text-xs bg-white/10 text-white hover:bg-white hover:text-midnight transition-colors">
                                    {editingCloud === 'cf' ? '关闭' : '配置/挂载'}
                                </button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {editingCloud === 'cf' && (
                                <CloudConfigForm label="Cloudflare R2" color="text-yellow-500" config={data.integrations?.cloudflare!} onSave={(config) => handleSaveCloudConfig('cf', config)} onCancel={() => setEditingCloud(null)} type="s3" />
                            )}
                        </AnimatePresence>
                    </div>

                </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                        <Mail size={18} className="text-rose-500"/>
                        <h3 className="text-rose-500 font-mono text-sm uppercase tracking-widest">底部联系信息管理</h3>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">商务合作邮箱</label><input value={data.contact?.email || ''} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white" /></div>
                            <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">联系电话</label><input value={data.contact?.phone || ''} onChange={(e) => handleContactChange('phone', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">底部版权文字</label><textarea value={data.contact?.footerText || ''} onChange={(e) => handleContactChange('footerText', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-slate-300 resize-none" /></div>
                    </div>
                </motion.div>
            )}

        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
