
import React, { useState, useRef } from 'react';
import type { Track, SiteData, Article, Artist, FeaturedAlbum } from '../types';
import { motion } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, Upload, Cloud, CheckCircle2, AlertCircle, HardDrive, Database, Image as ImageIcon, Menu, Type, Mail, Key, RefreshCw, Save, Disc, Album, Phone, MapPin, FileEdit } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'cloud' | 'contact';

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
  
  // --- State for Hero Image Upload ---
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  
  // --- State for Featured Album Upload ---
  const albumImageInputRef = useRef<HTMLInputElement>(null);

  // --- State for Uploads ---
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'music' | 'image'>('music'); 
  const [pickerTarget, setPickerTarget] = useState<'article' | 'track' | 'hero' | 'album'>('track');
  
  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const [uploadStatus, setUploadStatus] = useState<{
    active: boolean;
    progress: number;
    speed: string;
    remaining: string;
  }>({ active: false, progress: 0, speed: '0 MB/s', remaining: '0s' });

  // --- Helpers ---
  const getRandomImage = () => `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;

  const simulateUpload = (onComplete: (url: string) => void) => {
    setUploadStatus({ active: true, progress: 0, speed: '1.5 MB/s', remaining: '计算中...' });
    
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
  
  // --- Sync Functions ---
  const handleSyncPush = async () => {
      const key = data.integrations.cloudflare.accessKey;
      if (!key) {
          setSyncMessage("错误：请输入同步密钥 (Secret Key)");
          setSyncStatus('error');
          return;
      }
      
      setSyncStatus('syncing');
      try {
          // Send PUT request to save data to KV
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
              setSyncMessage('成功：数据已同步到云端！所有访客刷新后可见。');
          } else {
              const errData = await res.json().catch(() => ({}));
              setSyncStatus('error');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setSyncMessage(`失败: ${res.status} ${(errData as any).error || '请检查密钥是否正确'}`);
          }
      } catch (e) {
          setSyncStatus('error');
          setSyncMessage('错误：网络连接失败，无法连接到云函数。');
      }
      
      setTimeout(() => {
          if (syncStatus === 'success') setSyncStatus('idle');
      }, 5000);
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
      album: newTrack.album || '单曲',
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
                <SonicText text="VES 后台管理系统" />
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
            <div className="hidden md:block px-4 py-2 text-xs font-mono text-slate-600 uppercase tracking-widest">系统菜单</div>
            <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="网站概览" colorClass="bg-hot-pink" />
            <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="音乐管理" colorClass="bg-electric-cyan" />
            <TabButton id="articles" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText} label="动态日志" colorClass="bg-lime-punch" />
            <TabButton id="artists" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mic2} label="艺人管理" colorClass="bg-purple-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="联系信息" colorClass="bg-rose-500" />
            <div className="hidden md:block h-px bg-white/5 my-2"></div>
            <TabButton id="cloud" activeTab={activeTab} setActiveTab={setActiveTab} icon={RefreshCw} label="云端同步" colorClass="bg-orange-500" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            
            {/* --- TAB: GENERAL (Dashboard) --- */}
            {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                            <Type size={18} className="text-hot-pink"/>
                            <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest">首页视觉设置 (Home Visuals)</h3>
                        </div>

                        {/* Hero Image Picker */}
                        <div className="mb-8 p-4 bg-black/30 rounded-xl border border-white/5">
                             <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block">主视觉海报 / 背景图</label>
                             <div className="flex gap-6 items-center">
                                 <div className="w-24 h-32 bg-black rounded-lg overflow-hidden border border-white/20 shadow-lg relative group">
                                     <img src={data.hero.heroImage} className="w-full h-full object-cover" alt="Hero"/>
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white">预览</div>
                                 </div>
                                 <div className="flex-1">
                                     <UploadProgressWidget active={uploadStatus.active} progress={uploadStatus.progress} speed={uploadStatus.speed} remaining={uploadStatus.remaining} />
                                     {!uploadStatus.active && (
                                         <div className="flex gap-3">
                                             <button 
                                                 onClick={() => { setPickerTarget('hero'); setPickerMode('image'); setShowCloudPicker(true); }}
                                                 className="px-4 py-2 bg-hot-pink hover:bg-white hover:text-midnight text-white rounded-lg font-bold text-xs transition-all flex items-center gap-2"
                                             >
                                                 <ImageIcon size={16}/> 上传新图片
                                             </button>
                                             <input type="file" accept="image/*" className="hidden" ref={heroImageInputRef} onChange={(e) => handleGenericUpload(e, 'hero')} />
                                         </div>
                                     )}
                                     <p className="mt-2 text-xs text-slate-500">建议尺寸: 800x1200px (竖版). 支持 JPG, PNG.</p>
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
                                <label className="text-[10px] text-slate-500 uppercase font-bold">副标题文案</label>
                                <textarea rows={2} value={data.hero.subtitle} onChange={(e) => handleHeroChange('subtitle', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-slate-300 outline-none resize-none" />
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
                            <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">导航菜单设置 (Menu)</h3>
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
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
                     
                     {/* Featured Album Editor */}
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-6 mb-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><Disc size={100} /></div>
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5 relative z-10">
                             <Album size={18} className="text-purple-400"/>
                             <h3 className="text-purple-400 font-mono text-sm uppercase tracking-widest">主推专辑设置 (Featured Album)</h3>
                        </div>
                        <div className="grid md:grid-cols-12 gap-8 relative z-10">
                            <div className="md:col-span-4 flex flex-col gap-4">
                                <div className="aspect-square rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black relative group">
                                    <img src={data.featuredAlbum.coverUrl} alt="Featured Cover" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => { setPickerTarget('album'); setPickerMode('image'); setShowCloudPicker(true); }}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-xs"
                                    >
                                        <Upload size={24} /> 更换封面
                                    </button>
                                </div>
                                <input type="file" accept="image/*" className="hidden" ref={albumImageInputRef} onChange={(e) => handleGenericUpload(e, 'album')} />
                            </div>
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
                                <label className="text-[10px] text-slate-400 uppercase font-bold">音频来源</label>
                                
                                <div className="flex gap-2 mb-2">
                                    <button onClick={() => setNewTrack({...newTrack, sourceType: 'native'})} className={`px-3 py-1 rounded text-xs font-bold ${newTrack.sourceType === 'native' ? 'bg-electric-cyan text-black' : 'bg-white/10 text-slate-400'}`}>上传文件/外链</button>
                                    <button onClick={() => setNewTrack({...newTrack, sourceType: 'netease'})} className={`px-3 py-1 rounded text-xs font-bold ${newTrack.sourceType === 'netease' ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400'}`}>网易云音乐 ID</button>
                                </div>

                                {newTrack.sourceType === 'native' ? (
                                    <div className="flex gap-2">
                                        <input className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-electric-cyan outline-none text-xs font-mono" value={newTrack.audioUrl} onChange={e => setNewTrack({...newTrack, audioUrl: e.target.value})} placeholder="输入音频URL (mp3/wav)..." />
                                        <button onClick={() => { setPickerTarget('track'); setPickerMode('music'); setShowCloudPicker(true); }} className="bg-electric-cyan/10 text-electric-cyan px-4 rounded-lg border border-electric-cyan/20 flex items-center gap-2 text-xs font-bold"><Cloud size={16} /> 选择文件</button>
                                        <input type="file" accept="audio/*" className="hidden" ref={audioInputRef} onChange={(e) => handleGenericUpload(e, 'track')} />
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-red-500 outline-none text-xs font-mono" value={newTrack.externalId} onChange={e => setNewTrack({...newTrack, externalId: e.target.value})} placeholder="输入网易云音乐歌曲ID (例如: 123456)" />
                                        <div className="text-slate-500 text-xs flex items-center px-2">ID通常在歌曲链接中找到</div>
                                    </div>
                                )}
                            </div>
                            <button onClick={addTrack} disabled={uploadStatus.active} className="relative z-10 bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/50 font-bold py-3 rounded-lg hover:bg-electric-cyan hover:text-midnight transition-all mt-2 disabled:opacity-50">保存歌曲</button>
                        </motion.div>
                    )}

                    <div className="grid gap-3">
                        {filteredTracks.map(track => (
                            <div key={track.id} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 hover:border-electric-cyan/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <img src={track.coverUrl} className="w-10 h-10 rounded object-cover" alt="" />
                                    <div className="min-w-0">
                                        <div className="font-bold text-white truncate">{track.title}</div>
                                        <div className="text-xs text-slate-500">{track.sourceType === 'netease' ? '网易云 ID: ' + track.externalId : '直链/上传'}</div>
                                    </div>
                                </div>
                                <button onClick={() => deleteTrack(track.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- TAB: ARTICLES (Translation) --- */}
            {activeTab === 'articles' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-lime-punch font-mono text-sm uppercase tracking-widest">文章与动态 (Logs)</h3>
                        <button 
                            onClick={() => setIsAddingArticle(!isAddingArticle)}
                            className="bg-lime-punch text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> {isAddingArticle ? '取消' : '发布新动态'}
                        </button>
                    </div>

                    {isAddingArticle && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4 shadow-inner">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">标题</label>
                                    <input placeholder="输入标题..." className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">分类标签</label>
                                    <input placeholder="#标签" className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value})} />
                                </div>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-[10px] text-slate-400 uppercase font-bold">内容摘要</label>
                                 <textarea rows={3} placeholder="正文内容..." className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-[10px] text-slate-400 uppercase font-bold">封面图片</label>
                                 <div className="flex gap-2 items-center">
                                     {newArticle.coverUrl && <img src={newArticle.coverUrl} className="w-10 h-10 rounded object-cover border border-white/20" alt="Preview"/>}
                                     <button 
                                        onClick={() => { setPickerTarget('article'); setPickerMode('image'); setShowCloudPicker(true); }}
                                        className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-lime-punch transition-all text-xs font-bold flex items-center justify-center gap-2"
                                     >
                                         <ImageIcon size={16}/> {newArticle.coverUrl ? '更换图片' : '上传/选择图片'}
                                     </button>
                                     <input type="file" accept="image/*" className="hidden" ref={articleImageInputRef} onChange={(e) => handleGenericUpload(e, 'article')} />
                                 </div>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-[10px] text-slate-400 uppercase font-bold">关联背景音乐</label>
                                 <select 
                                        className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-lime-punch outline-none text-xs"
                                        value={newArticle.linkedTrackId || ''}
                                        onChange={(e) => setNewArticle({...newArticle, linkedTrackId: e.target.value})}
                                    >
                                        <option value="">-- 无背景音乐 --</option>
                                        {data.tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                             </div>
                            <button onClick={addArticle} className="bg-lime-punch/20 text-lime-punch border border-lime-punch/50 font-bold py-3 rounded-lg hover:bg-lime-punch hover:text-midnight transition-all flex justify-center items-center gap-2 mt-2">
                                <Save size={18} /> 发布
                            </button>
                        </motion.div>
                    )}
                    <div className="space-y-3">
                        {data.articles.map(article => (
                                <div key={article.id} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 hover:border-lime-punch/50 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <img src={article.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-white truncate">{article.title}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                                <span>{article.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteArticle(article.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                </div>
                            ))}
                    </div>
                </motion.div>
            )}

            {/* --- TAB: ARTISTS --- */}
            {activeTab === 'artists' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5"><h3 className="text-purple-500 font-mono text-sm uppercase tracking-widest">艺术家管理 (Roster)</h3><button onClick={() => setIsAddingArtist(!isAddingArtist)} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-purple-400"><Plus size={16} /></button></div>
                    {isAddingArtist && (
                        <div className="bg-white/5 p-4 rounded-xl mb-6 grid gap-4">
                             <input className="bg-black/50 p-3 rounded-lg text-white border border-white/10" placeholder="姓名 / 艺名" value={newArtist.name} onChange={e => setNewArtist({...newArtist, name: e.target.value})} />
                             <input className="bg-black/50 p-3 rounded-lg text-white border border-white/10" placeholder="分工 (如: Producer, Vocal)" value={newArtist.role} onChange={e => setNewArtist({...newArtist, role: e.target.value})} />
                             <button onClick={addArtist} className="bg-purple-500/20 text-purple-400 border border-purple-500/50 py-2 rounded-lg font-bold">保存</button>
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

             {/* --- TAB: CONTACT (Translation) --- */}
             {activeTab === 'contact' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                        <Mail size={18} className="text-rose-500"/>
                        <h3 className="text-rose-500 font-mono text-sm uppercase tracking-widest">底部联系信息 (Footer)</h3>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><Mail size={10}/> 商务邮箱</label>
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
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><MapPin size={10}/> 地址第一行</label>
                                <input 
                                    value={data.contact?.addressLine1 || ''} 
                                    onChange={(e) => handleContactChange('addressLine1', e.target.value)} 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2"><MapPin size={10}/> 地址第二行</label>
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

            {/* --- TAB: CLOUD (Pages Sync) --- */}
            {activeTab === 'cloud' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                        <RefreshCw size={18} className="text-orange-500"/>
                        <h3 className="text-orange-500 font-mono text-sm uppercase tracking-widest">Cloudflare KV 数据同步</h3>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 text-orange-500/10"><Cloud size={120}/></div>
                        
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Database size={20} className="text-orange-500"/> 原生云端同步
                            </h4>
                            <p className="text-sm text-slate-300 mb-6 max-w-lg leading-relaxed">
                                将此后台的所有数据永久保存到 Cloudflare KV。
                                请在 Cloudflare Dashboard 的 Pages 设置中，添加环境变量 <code>SYNC_SECRET</code>，并在下方输入相同的值。
                            </p>

                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Key size={10} /> Sync Secret Key (同步密钥)
                                    </label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none font-mono tracking-widest"
                                        placeholder="在此输入密钥..."
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
                                        {syncStatus === 'syncing' ? '正在同步...' : '推送到云端'}
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

        </div>
      </div>
      
      {/* Cloud Picker Modal (Simplified) */}
      {showCloudPicker && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[#0F172A] border border-white/10 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                     <HardDrive size={32} />
                 </div>
                 <h3 className="text-white font-bold text-xl mb-2">本地上传模式</h3>
                 <p className="text-slate-400 text-sm mb-6">请点击"上传"按钮直接选择本地文件。如果您配置了 R2/OSS，此处将显示云端文件浏览器。</p>
                 <div className="flex gap-4 justify-center">
                     <button onClick={() => {
                         // Trigger hidden file input based on target
                         if (pickerTarget === 'hero') heroImageInputRef.current?.click();
                         else if (pickerTarget === 'album') albumImageInputRef.current?.click();
                         else if (pickerTarget === 'track') audioInputRef.current?.click();
                         else if (pickerTarget === 'article') {
                            if (pickerMode === 'image') articleImageInputRef.current?.click();
                            else audioInputRef.current?.click(); // Fallback logic if BGM upload needed in article
                         }
                         setShowCloudPicker(false);
                     }} className="bg-electric-cyan text-black font-bold px-6 py-2 rounded-lg hover:bg-white">选择本地文件</button>
                     <button onClick={() => setShowCloudPicker(false)} className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20">取消</button>
                 </div>
            </div>
        </div>
      )}

    </motion.div>
  );
};

export default AdminPanel;
