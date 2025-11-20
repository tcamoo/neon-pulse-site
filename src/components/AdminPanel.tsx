
import React, { useState, useRef } from 'react';
import type { Track, SiteData, Article, Artist, FeaturedAlbum, CloudConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, Upload, Save, Cloud, CloudLightning, CloudRain, CheckCircle2, AlertCircle, HardDrive, Database, Image as ImageIcon, Disc, Menu, Type, Mail, Phone, MapPin, FileEdit, Album, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'cloud' | 'contact';
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

const CloudConfigForm = ({ 
    config, 
    onSave, 
    onCancel, 
    label, 
    color 
}: { 
    config: CloudConfig, 
    onSave: (newConfig: CloudConfig) => void, 
    onCancel: () => void,
    label: string,
    color: string
}) => {
    const [localConfig, setLocalConfig] = useState<CloudConfig>(config);
    const [showSecret, setShowSecret] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 border border-white/10 rounded-xl p-6 mt-4 space-y-4"
        >
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                <h5 className={`font-bold text-sm ${color}`}>配置 {label} 密钥</h5>
                <button onClick={onCancel} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Access Key / ID</label>
                    <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                        value={localConfig.accessKey || ''}
                        onChange={(e) => setLocalConfig({...localConfig, accessKey: e.target.value})}
                        placeholder="Ex: LTAI5t8..."
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Secret Key</label>
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
                        placeholder="my-music-bucket"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Endpoint / Region</label>
                    <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                        value={localConfig.endpoint || ''}
                        onChange={(e) => setLocalConfig({...localConfig, endpoint: e.target.value})}
                        placeholder="oss-cn-shanghai.aliyuncs.com"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button 
                    onClick={() => onSave({...localConfig, enabled: true})}
                    className={`px-4 py-2 rounded-lg font-bold text-xs text-white flex items-center gap-2 ${color.replace('text-', 'bg-')}`}
                >
                    <Save size={14} /> 保存并连接
                </button>
            </div>
        </motion.div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ data, updateData, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // --- State for Music ---
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [newTrack, setNewTrack] = useState<Partial<Track>>({
    title: '', artist: 'VES', album: 'Neon Dreams', duration: '', plays: 0, coverUrl: '', audioUrl: '', lyrics: ''
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
  
  // --- State for Hero Image Upload ---
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  
  // --- State for Featured Album Upload ---
  const albumImageInputRef = useRef<HTMLInputElement>(null);

  // --- State for Cloud/Uploads ---
  const [editingCloud, setEditingCloud] = useState<CloudProvider>(null); // Which provider form is open
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'music' | 'image'>('music'); 
  const [pickerProvider, setPickerProvider] = useState<'ali' | 'one' | 'cf' | 'local'>('local');
  const [pickerTarget, setPickerTarget] = useState<'article' | 'track' | 'hero' | 'album'>('track');
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [simulatedCloudFiles] = useState<{name: string, size: string, url: string, provider: 'ali' | 'one' | 'cf', type: 'audio' | 'image'}[]>([
      { name: 'VES_Demo_v1.mp3', size: '8.4 MB', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', provider: 'ali', type: 'audio' },
      { name: 'Cover_Art_Final.jpg', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop', provider: 'ali', type: 'image' },
      { name: 'Live_Shanghai_Set.wav', size: '42.1 MB', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Elipses.mp3', provider: 'ali', type: 'audio' },
      { name: 'Instrumental_04.mp3', size: '5.2 MB', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3', provider: 'one', type: 'audio' },
      { name: 'Master_Tape_R2.flac', size: '55.8 MB', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', provider: 'cf', type: 'audio' },
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
      
      setUploadStatus(prev => ({ 
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
    const track: Track = {
      id: Date.now().toString(),
      title: newTrack.title || '无题',
      artist: newTrack.artist || 'VES',
      album: newTrack.album || '未知专辑',
      duration: newTrack.duration || '3:00',
      plays: Math.floor(Math.random() * 50000),
      coverUrl: newTrack.coverUrl || getRandomImage(),
      audioUrl: newTrack.audioUrl || '',
      lyrics: newTrack.lyrics || ''
    };
    updateData({ ...data, tracks: [track, ...data.tracks] }); 
    setIsAddingTrack(false);
    setNewTrack({ title: '', artist: 'VES', album: 'Neon Dreams', duration: '', plays: 0, coverUrl: '', audioUrl: '', lyrics: '' });
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

  // Cloud Integration Logic
  const handleCloudToggle = (provider: 'ali' | 'one' | 'cf') => {
      let key: keyof SiteData['integrations'];
      if (provider === 'ali') key = 'aliDrive';
      else if (provider === 'one') key = 'oneDrive';
      else key = 'cloudflare';

      const currentConfig = data.integrations[key];

      if (currentConfig.enabled) {
          // Disconnect
          updateData(prev => ({
              ...prev,
              integrations: { ...prev.integrations, [key]: { ...prev.integrations[key], enabled: false } }
          }));
          setEditingCloud(null);
      } else {
          // Open Edit Mode to Connect
          setEditingCloud(provider);
      }
  };

  const handleSaveCloudConfig = (provider: 'ali' | 'one' | 'cf', config: CloudConfig) => {
      let key: keyof SiteData['integrations'];
      if (provider === 'ali') key = 'aliDrive';
      else if (provider === 'one') key = 'oneDrive';
      else key = 'cloudflare';

      updateData(prev => ({
          ...prev,
          integrations: { ...prev.integrations, [key]: config }
      }));
      setEditingCloud(null);
  };

  const handleCloudFileSelect = (file: {url: string, type: 'audio' | 'image', name: string}) => {
      setShowCloudPicker(false);
      
      simulateUpload(() => {
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
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-[#0a0f1d]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 mb-12 h-[85vh] flex flex-col ring-1 ring-white/5 relative font-sans"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-midnight to-surface p-4 md:p-6 flex justify-between items-center border-b border-white/5 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-hot-pink to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-hot-pink/20 animate-pulse">
                <Activity size={24} />
            </div>
            <div>
                <SonicText text="VES 后台管理系统" />
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-lime-punch rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">System Online • v2.5</p>
                </div>
            </div>
         </div>
         <button onClick={onClose} className="group bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 p-2 rounded-full transition-all border border-transparent hover:border-red-500/50">
            <X size={20} />
         </button>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-hidden custom-scrollbar">
            <div className="hidden md:block px-4 py-2 text-xs font-mono text-slate-600 uppercase tracking-widest">管理菜单</div>
            <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="仪表盘" colorClass="bg-hot-pink" />
            <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="作品库" colorClass="bg-electric-cyan" />
            <TabButton id="articles" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText} label="文章动态" colorClass="bg-lime-punch" />
            <TabButton id="artists" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mic2} label="艺术家" colorClass="bg-purple-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="联系信息" colorClass="bg-rose-500" />
            <div className="hidden md:block h-px bg-white/5 my-2"></div>
            <TabButton id="cloud" activeTab={activeTab} setActiveTab={setActiveTab} icon={Cloud} label="云端存储" colorClass="bg-orange-500" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            
            {/* --- TAB: GENERAL --- */}
            {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-3xl">
                    {/* Hero Visuals Config */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                            <Type size={18} className="text-hot-pink"/>
                            <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest">首页主视觉设置 (Visuals)</h3>
                        </div>
                        
                        {/* Hero Image Picker */}
                        <div className="mb-8 p-4 bg-black/30 rounded-xl border border-white/5">
                             <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block">主视觉海报 / 照片</label>
                             <div className="flex gap-6 items-center">
                                 <div className="w-24 h-32 bg-black rounded-lg overflow-hidden border border-white/20 shadow-lg relative group">
                                     <img src={data.hero.heroImage} className="w-full h-full object-cover" alt="Hero"/>
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white">Preview</div>
                                 </div>
                                 <div className="flex-1">
                                     <UploadProgressWidget active={uploadStatus.active} progress={uploadStatus.progress} speed={uploadStatus.speed} remaining={uploadStatus.remaining} />
                                     {!uploadStatus.active && (
                                         <div className="flex gap-3">
                                             <button 
                                                 onClick={() => { setPickerTarget('hero'); setPickerMode('image'); setPickerProvider('local'); setShowCloudPicker(true); }}
                                                 className="px-4 py-2 bg-hot-pink hover:bg-white hover:text-midnight text-white rounded-lg font-bold text-xs transition-all flex items-center gap-2"
                                             >
                                                 <ImageIcon size={16}/> 更换图片
                                             </button>
                                             <input type="file" accept="image/*" className="hidden" ref={heroImageInputRef} onChange={(e) => handleGenericUpload(e, 'hero')} />
                                         </div>
                                     )}
                                     <p className="mt-2 text-xs text-slate-500">建议尺寸: 800x1200px (Portrait). 支持 JPG, PNG.</p>
                                 </div>
                             </div>
                        </div>

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
                                <label className="text-[10px] text-slate-500 uppercase font-bold">副标题 / 介绍文案</label>
                                <textarea rows={3} value={data.hero.subtitle} onChange={(e) => handleHeroChange('subtitle', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-slate-300 focus:border-white outline-none resize-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold">底部跑马灯文字</label>
                                <input value={data.hero.marqueeText} onChange={(e) => handleHeroChange('marqueeText', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-lime-punch focus:border-lime-punch outline-none font-mono" />
                            </div>
                        </div>
                    </div>
                    
                     {/* Navigation Config */}
                     <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                            <Menu size={18} className="text-electric-cyan"/>
                            <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">导航栏设置</h3>
                        </div>
                        <div className="grid gap-4">
                            {data.navigation.map((nav, index) => (
                                <div key={nav.id} className="flex items-center gap-4">
                                    <span className="text-slate-500 text-xs font-mono w-20 uppercase">{nav.targetId}</span>
                                    <input 
                                        value={nav.label} 
                                        onChange={(e) => handleNavChange(index, e.target.value)} 
                                        className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-electric-cyan outline-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- TAB: MUSIC --- */}
            {activeTab === 'music' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    
                    {/* Featured Album Editor */}
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-6 mb-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><Disc size={100} /></div>
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5 relative z-10">
                             <Album size={18} className="text-purple-400"/>
                             <h3 className="text-purple-400 font-mono text-sm uppercase tracking-widest">主推专辑设置 (Featured Album)</h3>
                        </div>
                        <div className="grid md:grid-cols-12 gap-8 relative z-10">
                            {/* Album Cover */}
                            <div className="md:col-span-4 flex flex-col gap-4">
                                <div className="aspect-square rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black relative group">
                                    <img src={data.featuredAlbum.coverUrl} alt="Featured Cover" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => { setPickerTarget('album'); setPickerMode('image'); setPickerProvider('local'); setShowCloudPicker(true); }}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-xs"
                                    >
                                        <Upload size={24} /> 更换封面
                                    </button>
                                </div>
                                <input type="file" accept="image/*" className="hidden" ref={albumImageInputRef} onChange={(e) => handleGenericUpload(e, 'album')} />
                            </div>
                            {/* Album Info Inputs */}
                            <div className="md:col-span-8 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold">专辑名称</label>
                                        <input value={data.featuredAlbum.title} onChange={(e) => handleAlbumChange('title', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none font-display text-lg" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold">类型 / 年份</label>
                                        <input value={data.featuredAlbum.type} onChange={(e) => handleAlbumChange('type', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none font-mono" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">简介文案</label>
                                    <textarea rows={3} value={data.featuredAlbum.description} onChange={(e) => handleAlbumChange('description', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-slate-300 focus:border-purple-500 outline-none resize-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">单曲列表 (Tracks)</h3>
                        <button onClick={() => setIsAddingTrack(!isAddingTrack)} className="bg-electric-cyan text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2">
                           <Plus size={16} /> {isAddingTrack ? '取消' : '添加单曲'}
                        </button>
                    </div>

                    {isAddingTrack && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4 relative overflow-hidden">
                            <div className="grid md:grid-cols-2 gap-4 relative z-10">
                                <input placeholder="歌曲标题" className="bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} />
                                <input placeholder="艺术家" className="bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <label className="text-[10px] text-slate-400 uppercase font-bold">音频文件源</label>
                                <UploadProgressWidget active={uploadStatus.active} progress={uploadStatus.progress} speed={uploadStatus.speed} remaining={uploadStatus.remaining} />
                                {!uploadStatus.active && (
                                    <div className="flex gap-2">
                                        <input className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-electric-cyan outline-none text-xs font-mono" value={newTrack.audioUrl} onChange={e => setNewTrack({...newTrack, audioUrl: e.target.value})} placeholder="输入音频URL..." />
                                        <button onClick={() => { setPickerTarget('track'); setPickerProvider('local'); setPickerMode('music'); setShowCloudPicker(true); }} className="bg-electric-cyan/10 text-electric-cyan px-4 rounded-lg border border-electric-cyan/20 flex items-center gap-2 text-xs font-bold"><Cloud size={16} /> 从云端/本地选择</button>
                                        <input type="file" accept="audio/*" className="hidden" ref={audioInputRef} onChange={(e) => handleGenericUpload(e, 'track')} />
                                    </div>
                                )}
                            </div>
                            <button onClick={addTrack} disabled={uploadStatus.active} className="relative z-10 bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/50 font-bold py-3 rounded-lg hover:bg-electric-cyan hover:text-midnight transition-all mt-2 disabled:opacity-50">保存歌曲</button>
                        </motion.div>
                    )}

                    <div className="grid gap-3">
                        {filteredTracks.map(track => (
                            <div key={track.id} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 hover:border-electric-cyan/50 transition-all">
                                <div className="flex items-center gap-4"><img src={track.coverUrl} className="w-10 h-10 rounded object-cover" alt="" /><div className="font-bold text-white truncate">{track.title}</div></div>
                                <button onClick={() => deleteTrack(track.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- TAB: ARTICLES --- */}
             {activeTab === 'articles' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-lime-punch font-mono text-sm uppercase tracking-widest">文章动态管理 (News & Articles)</h3>
                        <button 
                            onClick={() => setIsAddingArticle(!isAddingArticle)}
                            className="bg-lime-punch text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> {isAddingArticle ? '取消' : '发布新文章'}
                        </button>
                    </div>

                    {isAddingArticle && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4 shadow-inner">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">文章标题</label>
                                    <input placeholder="输入文章标题" className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">分类话题 (Topic)</label>
                                    <input placeholder="#话题名称" className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value})} />
                                </div>
                             </div>
                             
                             <div className="space-y-2">
                                 <label className="text-[10px] text-slate-400 uppercase font-bold">内容摘要</label>
                                 <textarea rows={3} placeholder="写点什么..." className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
                             </div>

                             {/* Cover Image Upload */}
                             <div className="space-y-2">
                                 <label className="text-[10px] text-slate-400 uppercase font-bold">封面图片</label>
                                 <div className="flex gap-2 items-center">
                                     {newArticle.coverUrl && <img src={newArticle.coverUrl} className="w-10 h-10 rounded object-cover border border-white/20" alt="Preview"/>}
                                     <button 
                                        onClick={() => { setPickerTarget('article'); setPickerProvider('local'); setPickerMode('image'); setShowCloudPicker(true); }}
                                        className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-lime-punch transition-all text-xs font-bold flex items-center justify-center gap-2"
                                     >
                                         <ImageIcon size={16}/> {newArticle.coverUrl ? '更换图片' : '上传 / 选择图片'}
                                     </button>
                                     <input type="file" accept="image/*" className="hidden" ref={articleImageInputRef} onChange={(e) => handleGenericUpload(e, 'article')} />
                                 </div>
                             </div>

                             {/* BGM Selector */}
                             <div className="space-y-2">
                                 <label className="text-[10px] text-slate-400 uppercase font-bold">背景音乐 (可选)</label>
                                 
                                 <div className="flex gap-2 flex-col md:flex-row">
                                    <select 
                                        className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none text-xs"
                                        value={newArticle.linkedTrackId || ''}
                                        onChange={(e) => setNewArticle({...newArticle, linkedTrackId: e.target.value})}
                                    >
                                        <option value="">-- 无背景音乐 --</option>
                                        {data.tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { setPickerTarget('article'); setPickerProvider('local'); setPickerMode('music'); setShowCloudPicker(true); }}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-lime-punch border border-lime-punch/20 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-2"
                                        >
                                            <Upload size={14} /> 上传新音乐
                                        </button>
                                    </div>
                                </div>
                             </div>

                            <button onClick={addArticle} className="bg-lime-punch/20 text-lime-punch border border-lime-punch/50 font-bold py-3 rounded-lg hover:bg-lime-punch hover:text-midnight transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50">
                                <Save size={18} /> 发布文章
                            </button>
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        {data.articles.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 font-mono border border-dashed border-white/10 rounded-xl">暂无文章</div>
                        ) : (
                            data.articles.map(article => (
                                <div key={article.id} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 hover:border-lime-punch/50 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <img src={article.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-white truncate">{article.title}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                                <span>{article.date}</span>
                                                {article.linkedTrackId && <span className="text-lime-punch flex items-center gap-1"><Disc size={10} /> BGM</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteArticle(article.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}

            {/* --- TAB: ARTISTS --- */}
            {activeTab === 'artists' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5"><h3 className="text-purple-500 font-mono text-sm uppercase tracking-widest">艺术家管理 (Artist Roster)</h3><button onClick={() => setIsAddingArtist(!isAddingArtist)} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-purple-400"><Plus size={16} /></button></div>
                    {isAddingArtist && (
                        <div className="bg-white/5 p-4 rounded-xl mb-6 grid gap-4">
                             <input className="bg-black/50 p-3 rounded-lg text-white border border-white/10" placeholder="名字" value={newArtist.name} onChange={e => setNewArtist({...newArtist, name: e.target.value})} />
                             <input className="bg-black/50 p-3 rounded-lg text-white border border-white/10" placeholder="角色/分工" value={newArtist.role} onChange={e => setNewArtist({...newArtist, role: e.target.value})} />
                             <button onClick={addArtist} className="bg-purple-500/20 text-purple-400 border border-purple-500/50 py-2 rounded-lg font-bold">创建艺术家</button>
                        </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                        {(data.artists || []).map(artist => (
                            <div key={artist.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                <img src={artist.avatarUrl} className="w-12 h-12 rounded-full" alt=""/>
                                <div className="flex-1"><div className="text-white font-bold">{artist.name}</div><div className="text-slate-500 text-xs">{artist.role}</div></div>
                                <button onClick={() => deleteArtist(artist.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- TAB: CLOUD (Enhanced with Config Forms) --- */}
            {activeTab === 'cloud' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-3xl">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                        <Cloud size={18} className="text-orange-500"/>
                        <h3 className="text-orange-500 font-mono text-sm uppercase tracking-widest">云服务集成配置</h3>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-6">
                        连接第三方对象存储服务，以启用大文件上传功能。点击“连接服务”以配置访问密钥。
                    </p>

                    <div className="grid gap-4">
                        {/* AliDrive Toggle */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.integrations.aliDrive?.enabled ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                        <CloudLightning size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            阿里云 OSS (AliDrive) 
                                            {data.integrations.aliDrive?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">已连接</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500">适用于国内访问加速。</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleCloudToggle('ali')}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all
                                    ${data.integrations.aliDrive?.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-white/10 text-white hover:bg-orange-500'}`}
                                >
                                    {data.integrations.aliDrive?.enabled ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                                    {data.integrations.aliDrive?.enabled ? '断开连接' : '连接服务'}
                                </button>
                            </div>
                            
                            <AnimatePresence>
                                {editingCloud === 'ali' && !data.integrations.aliDrive?.enabled && (
                                    <CloudConfigForm 
                                        label="阿里云 OSS" 
                                        color="text-orange-500"
                                        config={data.integrations.aliDrive}
                                        onSave={(config) => handleSaveCloudConfig('ali', config)}
                                        onCancel={() => setEditingCloud(null)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* OneDrive Toggle */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.integrations.oneDrive?.enabled ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                        <CloudRain size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            Microsoft OneDrive 
                                            {data.integrations.oneDrive?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">已连接</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500">Office 365 生态系统集成。</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleCloudToggle('one')}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all
                                    ${data.integrations.oneDrive?.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-white/10 text-white hover:bg-blue-500'}`}
                                >
                                    {data.integrations.oneDrive?.enabled ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                                    {data.integrations.oneDrive?.enabled ? '断开连接' : '连接服务'}
                                </button>
                            </div>
                            <AnimatePresence>
                                {editingCloud === 'one' && !data.integrations.oneDrive?.enabled && (
                                    <CloudConfigForm 
                                        label="OneDrive" 
                                        color="text-blue-500"
                                        config={data.integrations.oneDrive}
                                        onSave={(config) => handleSaveCloudConfig('one', config)}
                                        onCancel={() => setEditingCloud(null)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Cloudflare Toggle */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-yellow-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.integrations.cloudflare?.enabled ? 'bg-yellow-500 text-midnight' : 'bg-white/10 text-slate-500'}`}>
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            Cloudflare R2 
                                            {data.integrations.cloudflare?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">已连接</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500">零出口费用对象存储。</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleCloudToggle('cf')}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all
                                    ${data.integrations.cloudflare?.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-white/10 text-white hover:bg-yellow-500'}`}
                                >
                                    {data.integrations.cloudflare?.enabled ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                                    {data.integrations.cloudflare?.enabled ? '断开连接' : '连接服务'}
                                </button>
                            </div>
                             <AnimatePresence>
                                {editingCloud === 'cf' && !data.integrations.cloudflare?.enabled && (
                                    <CloudConfigForm 
                                        label="Cloudflare R2" 
                                        color="text-yellow-500"
                                        config={data.integrations.cloudflare}
                                        onSave={(config) => handleSaveCloudConfig('cf', config)}
                                        onCancel={() => setEditingCloud(null)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}

             {/* --- TAB: CONTACT --- */}
            {activeTab === 'contact' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-3xl">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                        <Mail size={18} className="text-rose-500"/>
                        <h3 className="text-rose-500 font-mono text-sm uppercase tracking-widest">底部联系信息管理</h3>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><Mail size={10}/> 商务合作邮箱</label>
                                <input 
                                    value={data.contact?.email || ''} 
                                    onChange={(e) => handleContactChange('email', e.target.value)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none font-mono text-sm transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><Phone size={10}/> 联系电话</label>
                                <input 
                                    value={data.contact?.phone || ''} 
                                    onChange={(e) => handleContactChange('phone', e.target.value)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none font-mono text-sm transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><MapPin size={10}/> 地址行 1</label>
                                <input 
                                    value={data.contact?.addressLine1 || ''} 
                                    onChange={(e) => handleContactChange('addressLine1', e.target.value)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><MapPin size={10}/> 地址行 2</label>
                                <input 
                                    value={data.contact?.addressLine2 || ''} 
                                    onChange={(e) => handleContactChange('addressLine2', e.target.value)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><FileEdit size={10}/> 底部版权文字</label>
                            <textarea 
                                rows={2}
                                value={data.contact?.footerText || ''} 
                                onChange={(e) => handleContactChange('footerText', e.target.value)} 
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-slate-300 focus:border-rose-500 outline-none resize-none font-mono text-xs tracking-wide"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
      </div>

      {/* Universal Cloud File Picker Modal */}
      <AnimatePresence>
          {showCloudPicker && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
              >
                  <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden"
                  >
                      {/* Modal Header */}
                      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
                          <h3 className="font-bold text-white flex items-center gap-2">
                              <Cloud size={18} className="text-electric-cyan" /> 选择 {pickerMode === 'image' ? '图片' : '音频'}
                          </h3>
                          <button onClick={() => setShowCloudPicker(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
                      </div>

                      <div className="flex flex-1 overflow-hidden">
                          {/* Modal Sidebar */}
                          <div className="w-48 bg-black/20 border-r border-white/10 p-2 flex flex-col gap-1">
                              <button onClick={() => setPickerProvider('local')} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left ${pickerProvider === 'local' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}><HardDrive size={16} /> 本地设备</button>
                              <button onClick={() => setPickerProvider('ali')} disabled={!data.integrations.aliDrive?.enabled} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left ${pickerProvider === 'ali' ? 'bg-orange-500/20 text-orange-500' : 'text-slate-400 hover:text-white disabled:opacity-30 cursor-not-allowed'}`}><CloudLightning size={16} /> 阿里云 OSS</button>
                              <button onClick={() => setPickerProvider('one')} disabled={!data.integrations.oneDrive?.enabled} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left ${pickerProvider === 'one' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white disabled:opacity-30 cursor-not-allowed'}`}><CloudRain size={16} /> OneDrive</button>
                              <button onClick={() => setPickerProvider('cf')} disabled={!data.integrations.cloudflare?.enabled} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left ${pickerProvider === 'cf' ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-400 hover:text-white disabled:opacity-30 cursor-not-allowed'}`}><Database size={16} /> Cloudflare R2</button>
                          </div>

                          {/* Modal Content */}
                          <div className="flex-1 p-4 overflow-y-auto bg-black/40 custom-scrollbar">
                                {pickerProvider === 'local' ? (
                                    <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => {
                                        if (pickerTarget === 'hero') heroImageInputRef.current?.click();
                                        else if (pickerTarget === 'album') albumImageInputRef.current?.click();
                                        else if (pickerTarget === 'track') audioInputRef.current?.click();
                                        else if (pickerTarget === 'article') {
                                            if (pickerMode === 'image') articleImageInputRef.current?.click();
                                            else audioInputRef.current?.click();
                                        }
                                        setShowCloudPicker(false); 
                                    }}>
                                        <Upload size={40} className="text-slate-500 mb-4" />
                                        <p className="text-slate-400 text-sm font-bold">点击上传本地 {pickerMode === 'image' ? '图片' : '音频'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {simulatedCloudFiles.filter(f => f.provider === pickerProvider && f.type === (pickerMode === 'music' ? 'audio' : 'image')).length > 0 ? (
                                            simulatedCloudFiles.filter(f => f.provider === pickerProvider && f.type === (pickerMode === 'music' ? 'audio' : 'image')).map((file, i) => (
                                                <div key={i} onClick={() => handleCloudFileSelect(file)} className="group flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:border-electric-cyan/50 hover:bg-electric-cyan/10 cursor-pointer transition-all">
                                                    <div className="flex items-center gap-3">
                                                        {file.type === 'audio' ? <Music size={18} className="text-slate-500" /> : <ImageIcon size={18} className="text-slate-500" />}
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-200 group-hover:text-white">{file.name}</div>
                                                            <div className="text-xs text-slate-500">{file.size}</div>
                                                        </div>
                                                    </div>
                                                    <CheckCircle2 size={18} className="opacity-0 group-hover:opacity-100 text-electric-cyan" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
                                                <AlertCircle size={24} />
                                                <span>该云端文件夹为空</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                          </div>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AdminPanel;
