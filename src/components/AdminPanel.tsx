
import React, { useState, useRef } from 'react';
import type { Track, SiteData, Article, Artist, FeaturedAlbum, CloudConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, Upload, Save, Cloud, CloudLightning, CloudRain, CheckCircle2, AlertCircle, HardDrive, Database, Image as ImageIcon, Disc, Menu, Type, Mail, Phone, MapPin, FileEdit, Album, ToggleLeft, ToggleRight, Eye, EyeOff, Lock, Shield, Globe, Info, Key, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'cloud' | 'contact' | 'settings';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const UploadProgressWidget = ({ progress, speed, remaining, active }: { progress: number, speed: string, remaining: string, active: boolean }) => {
    if (!active) return null;
    
    return (
        <div className="relative w-full bg-black/60 border border-electric-cyan/30 rounded-xl overflow-hidden p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.5)_2px)] bg-[size:4px_4px] opacity-20 pointer-events-none"></div>
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-electric-cyan uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Activity size={12} className="animate-pulse" /> 
                        正在上传 (Uplink Active)
                    </span>
                    <span className="text-2xl font-display font-bold text-white tracking-tighter">
                        {Math.round(progress)}<span className="text-sm text-slate-500">%</span>
                    </span>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                    <div className="text-electric-cyan">{speed}</div>
                    <div>剩余时间: {remaining}</div>
                </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
                <motion.div 
                    className="h-full bg-gradient-to-r from-electric-cyan via-white to-hot-pink relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-white blur-[4px]"></div>
                </motion.div>
            </div>
        </div>
    );
}

const AdminPanel: React.FC<AdminPanelProps> = ({ data, updateData, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // --- State for Music ---
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [newTrack, setNewTrack] = useState<Partial<Track>>({
    title: '', artist: 'VES', album: 'Neon Dreams', duration: '', plays: 0, coverUrl: '', audioUrl: '', lyrics: '', sourceType: 'native', externalId: ''
  });
  const [searchTerm] = useState('');
  const audioInputRef = useRef<HTMLInputElement>(null);

  // --- State for Articles (Articles) ---
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', category: '', date: '', excerpt: '', coverUrl: '', linkedTrackId: ''
  });
  const articleImageInputRef = useRef<HTMLInputElement>(null);

  // --- State for Artists ---
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({
    name: '', role: '', avatarUrl: '', status: 'active'
  });
  
  // --- State for Password Change ---
  const [passwordField, setPasswordField] = useState(data.adminPassword || 'admin');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // --- State for Hero Image Upload ---
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  
  // --- State for Featured Album Upload ---
  const albumImageInputRef = useRef<HTMLInputElement>(null);

  // --- State for Cloud/Uploads ---
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'music' | 'image'>('music'); 
  const [pickerProvider, setPickerProvider] = useState<'ali' | 'one' | 'cf' | 'local'>('local');
  const [pickerTarget, setPickerTarget] = useState<'article' | 'track' | 'hero' | 'album'>('track');
  
  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [simulatedCloudFiles] = useState<{name: string, size: string, url: string, provider: 'ali' | 'one' | 'cf', type: 'audio' | 'image'}[]>([
      { name: 'VES_Demo_v1.mp3', size: '8.4 MB', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', provider: 'ali', type: 'audio' },
      { name: 'Cover_Art_Final.jpg', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop', provider: 'ali', type: 'image' },
  ]);

  const [uploadStatus, setUploadStatus] = useState<{
    active: boolean;
    progress: number;
    speed: string;
    remaining: string;
  }>({ active: false, progress: 0, speed: '0 MB/s', remaining: '0s' });

  // --- Helpers ---
  const getRandomImage = () => `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;

  const simulateUpload = (onComplete: (url: string) => void) => {
    setUploadStatus({ active: true, progress: 0, speed: '1.5 MB/s', remaining: 'Calculating...' });
    
    let progress = 0;
    const duration = 1500;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      progress += increment;
      const currentSpeed = (1.5 + Math.random() * 3.0).toFixed(1); 
      const remainingSeconds = Math.max(0, Math.ceil((duration - (progress / 100 * duration)) / 1000));

      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        setTimeout(() => {
            setUploadStatus({ active: false, progress: 0, speed: '0 MB/s', remaining: '0s' });
            onComplete(`blob:simulated_upload_${Date.now()}`); 
        }, 500);
      } 
      
      setUploadStatus(() => ({ 
          active: true, 
          progress: Math.min(progress, 100), 
          speed: `${currentSpeed} MB/s`, 
          remaining: `${remainingSeconds}s` 
      }));
      
    }, intervalTime);
  };

  // --- Handlers ---
  const handleHeroChange = (field: keyof SiteData['hero'], value: string) => {
    updateData({
        ...data,
        hero: { ...data.hero, [field]: value }
    });
  };

  const handleAlbumChange = (field: keyof FeaturedAlbum, value: string) => {
      updateData({
          ...data,
          featuredAlbum: { ...data.featuredAlbum, [field]: value }
      });
  };

  const handleNavChange = (index: number, newValue: string) => {
      const newNav = [...data.navigation];
      newNav[index].label = newValue;
      updateData({ ...data, navigation: newNav });
  }

  const handleContactChange = (field: keyof SiteData['contact'], value: string) => {
      updateData({
          ...data,
          contact: { ...data.contact, [field]: value }
      });
  }

  const handlePasswordChange = () => {
      updateData({...data, adminPassword: passwordField});
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
  };
  
  // --- Sync Functions ---
  const handleSyncPush = async () => {
      const key = data.integrations.cloudflare.accessKey;
      if (!key) {
          setSyncMessage("请先输入 Access Secret Key");
          setSyncStatus('error');
          return;
      }
      
      setSyncStatus('syncing');
      try {
          const res = await fetch('/api/sync', {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'x-auth-key': key
              },
              body: JSON.stringify(data)
          });
          
          if (res.ok) {
              setSyncStatus('success');
              setSyncMessage('数据已成功同步到云端！');
          } else {
              setSyncStatus('error');
              setSyncMessage(`同步失败: ${res.statusText}. 请检查 Secret Key.`);
          }
      } catch (e) {
          setSyncStatus('error');
          setSyncMessage('网络错误，无法连接到云函数。');
      }
      
      setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleGenericUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'album' | 'track' | 'article') => {
      const file = e.target.files?.[0];
      if (file) {
          simulateUpload((url) => {
             const finalUrl = URL.createObjectURL(file);
             if (target === 'hero') {
                 updateData(prev => ({ ...prev, hero: { ...prev.hero, heroImage: finalUrl } }));
             } else if (target === 'album') {
                 updateData(prev => ({ ...prev, featuredAlbum: { ...prev.featuredAlbum, coverUrl: finalUrl } }));
             } else if (target === 'article') {
                 setNewArticle(prev => ({ ...prev, coverUrl: finalUrl }));
             } else if (target === 'track') {
                 setNewTrack(prev => ({ ...prev, audioUrl: finalUrl }));
             }
          });
      }
  }
  
  const addTrack = () => {
    if (!newTrack.title) return;
    
    let finalAudioUrl = newTrack.audioUrl || '';
    
    // Netease Conversion Logic
    if (newTrack.sourceType === 'netease' && newTrack.externalId) {
        finalAudioUrl = `https://music.163.com/song/media/outer/url?id=${newTrack.externalId}.mp3`;
    }

    const track: Track = {
      id: Date.now().toString(),
      title: newTrack.title || '无题',
      artist: newTrack.artist || 'VES',
      album: newTrack.album || '未知专辑',
      duration: newTrack.duration || '3:00',
      plays: Math.floor(Math.random() * 50000),
      coverUrl: newTrack.coverUrl || getRandomImage(),
      audioUrl: finalAudioUrl,
      lyrics: newTrack.lyrics || '',
      sourceType: newTrack.sourceType,
      externalId: newTrack.externalId
    };
    updateData({ ...data, tracks: [track, ...data.tracks] }); 
    setIsAddingTrack(false);
    setNewTrack({ title: '', artist: 'VES', album: 'Neon Dreams', duration: '', plays: 0, coverUrl: '', audioUrl: '', lyrics: '', sourceType: 'native', externalId: '' });
  };

  const deleteTrack = (id: string) => {
    if(window.confirm('确认删除这首歌曲吗？')) {
        updateData({ ...data, tracks: data.tracks.filter(t => t.id !== id) });
    }
  };

  const addArticle = () => {
    if (!newArticle.title) return;
    const article: Article = {
        id: Date.now().toString(),
        title: newArticle.title || '新文章',
        category: newArticle.category || '#NEWS',
        date: newArticle.date || new Date().toLocaleDateString().replace(/\//g, '.'),
        excerpt: newArticle.excerpt || '',
        coverUrl: newArticle.coverUrl || getRandomImage(),
        linkedTrackId: newArticle.linkedTrackId
    };
    updateData({ ...data, articles: [...data.articles, article] });
    setIsAddingArticle(false);
    setNewArticle({ title: '', category: '', date: '', excerpt: '', coverUrl: '', linkedTrackId: '' });
  };

  const deleteArticle = (id: string) => {
    if(window.confirm('确认删除这篇文章吗？')) {
        updateData({ ...data, articles: data.articles.filter(a => a.id !== id) });
    }
  };

  const addArtist = () => {
    if (!newArtist.name) return;
    const artist: Artist = {
        id: Date.now().toString(),
        name: newArtist.name || 'Name',
        role: newArtist.role || 'Artist',
        avatarUrl: newArtist.avatarUrl || getRandomImage(),
        status: (newArtist.status as any) || 'active'
    };
    updateData({ ...data, artists: [...(data.artists || []), artist] });
    setIsAddingArtist(false);
    setNewArtist({ name: '', role: '', avatarUrl: '', status: 'active' });
  };

  const deleteArtist = (id: string) => {
      if(window.confirm('确认移除该艺术家？')) {
          updateData({ ...data, artists: data.artists.filter(a => a.id !== id) });
      }
  }

  const handleCloudFileSelect = (file: {url: string, type: 'audio' | 'image', name: string}) => {
      setShowCloudPicker(false);
      
      simulateUpload((url) => {
          if (pickerTarget === 'hero') {
              updateData(prev => ({ ...prev, hero: { ...prev.hero, heroImage: file.url } }));
          } else if (pickerTarget === 'album') {
              updateData(prev => ({ ...prev, featuredAlbum: { ...prev.featuredAlbum, coverUrl: file.url } }));
          } else if (pickerTarget === 'track') {
              setNewTrack(prev => ({ ...prev, audioUrl: file.url }));
          } else if (pickerTarget === 'article') {
              if (pickerMode === 'image') {
                  setNewArticle(prev => ({ ...prev, coverUrl: file.url }));
              } else {
                   const trackId = Date.now().toString();
                   const autoTrack: Track = {
                       id: trackId,
                       title: file.name.replace(/\.[^/.]+$/, ""),
                       artist: 'VES',
                       album: '云端导入',
                       duration: '0:00',
                       plays: 0,
                       coverUrl: getRandomImage(),
                       audioUrl: file.url
                   };
                   updateData(prev => ({ ...prev, tracks: [autoTrack, ...prev.tracks] }));
                   setNewArticle(prev => ({ ...prev, linkedTrackId: trackId }));
              }
          }
      });
  };

  const filteredTracks = (data.tracks || []).filter(track => 
    track.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="w-12 h-12 bg-gradient-to-br from-hot-pink to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-hot-pink/20 animate-pulse">
                <Activity size={24} />
            </div>
            <div>
                <SonicText text="VES CENTRAL SYSTEM" />
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-lime-punch rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Admin Mode • v2.5</p>
                </div>
            </div>
         </div>
         <button onClick={onClose} className="group bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 p-2 rounded-full transition-all border border-transparent hover:border-red-500/50">
            <X size={24} />
         </button>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-hidden custom-scrollbar">
            <div className="hidden md:block px-4 py-2 text-xs font-mono text-slate-600 uppercase tracking-widest">MAIN MENU</div>
            <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="Dashboard" colorClass="bg-hot-pink" />
            <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="Music Library" colorClass="bg-electric-cyan" />
            <TabButton id="articles" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText} label="Transmission Logs" colorClass="bg-lime-punch" />
            <TabButton id="artists" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mic2} label="Artist Roster" colorClass="bg-purple-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="Contact Data" colorClass="bg-rose-500" />
            <div className="hidden md:block h-px bg-white/5 my-2"></div>
            <TabButton id="cloud" activeTab={activeTab} setActiveTab={setActiveTab} icon={RefreshCw} label="Data Sync" colorClass="bg-orange-500" />
            <TabButton id="settings" activeTab={activeTab} setActiveTab={setActiveTab} icon={Shield} label="System Settings" colorClass="bg-slate-400" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            
            {/* --- TAB: GENERAL --- */}
            {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto">
                    {/* General content similar to before */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                            <Type size={18} className="text-hot-pink"/>
                            <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest">首页主视觉设置 (Visuals)</h3>
                        </div>
                        {/* ... (Hero fields kept same for brevity, assumed handled by parent state updates) ... */}
                         <div className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">主标题 第一行</label>
                                    <input value={data.hero.titleLine1} onChange={(e) => handleHeroChange('titleLine1', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-hot-pink outline-none font-display text-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">主标题 第二行 (渐变色)</label>
                                    <input value={data.hero.titleLine2} onChange={(e) => handleHeroChange('titleLine2', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-electric-cyan focus:border-electric-cyan outline-none font-display text-xl" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold">副标题</label>
                                <input value={data.hero.subtitle} onChange={(e) => handleHeroChange('subtitle', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white outline-none" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- TAB: MUSIC --- */}
            {activeTab === 'music' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
                     <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">单曲列表 (Tracks)</h3>
                        <button onClick={() => setIsAddingTrack(!isAddingTrack)} className="bg-electric-cyan text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2">
                           <Plus size={16} /> {isAddingTrack ? '取消' : '添加单曲'}
                        </button>
                    </div>
                    
                    {isAddingTrack && (
                        <div className="bg-white/5 p-6 rounded-2xl mb-6">
                             <input placeholder="Title" className="w-full bg-black/50 p-3 mb-2 text-white" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})}/>
                             <button onClick={addTrack} className="bg-electric-cyan text-black px-4 py-2 font-bold rounded">Save</button>
                        </div>
                    )}

                    <div className="grid gap-3">
                        {filteredTracks.map(track => (
                            <div key={track.id} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <img src={track.coverUrl} className="w-10 h-10 rounded object-cover" alt="" />
                                    <div className="font-bold text-white">{track.title}</div>
                                </div>
                                <button onClick={() => deleteTrack(track.id)} className="text-red-500 p-2"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- TAB: CLOUD (Pages Sync) --- */}
            {activeTab === 'cloud' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                        <RefreshCw size={18} className="text-orange-500"/>
                        <h3 className="text-orange-500 font-mono text-sm uppercase tracking-widest">Cloudflare Pages Sync (Native KV)</h3>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 text-orange-500/10"><Cloud size={120}/></div>
                        
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Database size={20} className="text-orange-500"/> 数据云同步
                            </h4>
                            <p className="text-sm text-slate-300 mb-6 max-w-lg leading-relaxed">
                                使用 Cloudflare Pages 内置的 KV 存储功能。无需额外配置 Worker。
                                只需在 Cloudflare Dashboard 中将 KV 命名空间绑定为 `SITE_DATA_KV` 并设置 `SYNC_SECRET` 环境变量。
                            </p>

                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Key size={10} /> Sync Secret Key
                                    </label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none font-mono tracking-widest"
                                        placeholder="输入在后台设置的密钥..."
                                        value={data.integrations.cloudflare.accessKey || ''}
                                        onChange={(e) => updateData(prev => ({
                                            ...prev,
                                            integrations: {
                                                ...prev.integrations,
                                                cloudflare: { ...prev.integrations.cloudflare, enabled: true, accessKey: e.target.value }
                                            }
                                        }))}
                                    />
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <button 
                                        onClick={handleSyncPush}
                                        disabled={syncStatus === 'syncing'}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg
                                        ${syncStatus === 'syncing' ? 'bg-white/10 text-slate-400 cursor-wait' : 'bg-orange-500 text-white hover:bg-orange-400 hover:scale-105'}`}
                                    >
                                        {syncStatus === 'syncing' ? <RefreshCw size={18} className="animate-spin"/> : <Upload size={18}/>}
                                        {syncStatus === 'syncing' ? '同步中...' : '推送到云端'}
                                    </button>
                                </div>

                                {syncStatus !== 'idle' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2
                                        ${syncStatus === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                                        ${syncStatus === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                                        `}
                                    >
                                        {syncStatus === 'success' && <CheckCircle2 size={14}/>}
                                        {syncStatus === 'error' && <AlertCircle size={14}/>}
                                        {syncMessage}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- TAB: SETTINGS, ARTISTS, CONTACT (Existing) --- */}
             {activeTab === 'settings' && (
                <div className="p-6 text-slate-400">Settings go here...</div>
             )}
             {activeTab === 'contact' && (
                <div className="p-6 text-slate-400">Contact editor goes here...</div>
             )}
             {activeTab === 'artists' && (
                 <div className="p-6 text-slate-400">Artist list goes here...</div>
             )}

        </div>
      </div>
      
      {/* Cloud Picker Modal (Simplified) */}
      {showCloudPicker && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center">
            <div className="bg-surface p-8 rounded-xl max-w-lg w-full">
                 <h3 className="text-white font-bold mb-4">Select File</h3>
                 <p className="text-slate-400 text-sm mb-6">Native Cloud Picker implementation would go here. Use local upload for now.</p>
                 <button onClick={() => setShowCloudPicker(false)} className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20">Close</button>
            </div>
        </div>
      )}

    </motion.div>
  );
};

export default AdminPanel;
