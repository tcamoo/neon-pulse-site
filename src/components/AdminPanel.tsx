
import React, { useState } from 'react';
import type { Track, SiteData, Article, Artist, Resource, CloudConfig, ThemeMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, X, Activity, Layout, Music, FileText, 
    Mic2, HardDrive, Mail, Database, Save, Link2, 
    Cloud, Check, AlertCircle, Settings, Disc, Globe, Image, FolderOpen, Palette
} from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'resources' | 'storage' | 'contact' | 'theme';

// --- UI Components ---

const TabButton = ({ id, activeTab, setActiveTab, icon: Icon, label, colorClass }: any) => (
  <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 p-4 rounded-xl transition-all font-bold text-sm relative overflow-hidden group w-full text-left shrink-0 mb-2
      ${activeTab === id ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
  >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 ${activeTab === id ? colorClass : 'bg-transparent'}`}></div>
      <Icon size={18} className={activeTab === id ? 'text-white' : 'opacity-70'} /> 
      <span className="whitespace-nowrap tracking-wider">{label}</span>
  </button>
);

const InputGroup = ({ label, children, subLabel }: { label: string, children: React.ReactNode, subLabel?: string }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            {label}
            {subLabel && <span className="text-slate-600 normal-case font-normal">{subLabel}</span>}
        </label>
        {children}
    </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
        {...props}
        className={`w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-slate-600 font-mono ${props.className}`}
    />
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select 
            {...props}
            className={`w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer font-mono ${props.className}`}
        >
            {props.children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            ▼
        </div>
    </div>
);

// Theme Preview Card
const ThemeCard = ({ mode, currentMode, onClick, colors, label, desc }: { 
    mode: ThemeMode, 
    currentMode: ThemeMode | undefined, 
    onClick: () => void,
    colors: string[],
    label: string,
    desc: string
}) => {
    const isActive = (currentMode || 'cyberpunk') === mode;
    
    return (
        <button 
            onClick={onClick}
            className={`relative group w-full text-left bg-black/30 rounded-2xl p-5 border transition-all duration-300 overflow-hidden
            ${isActive ? 'border-white/60 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
        >
            {isActive && (
                <div className="absolute top-3 right-3 bg-white text-midnight text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Check size={10} /> ACTIVE
                </div>
            )}
            
            <div className="flex gap-2 mb-4">
                {colors.map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-white/10 shadow-lg" style={{ backgroundColor: c }}></div>
                ))}
            </div>
            
            <h3 className={`font-display font-bold text-lg mb-1 transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                {label}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </button>
    );
}

// --- Helper Logic ---

// Smart URL Builder for R2
const R2PathBuilder = ({ config, value, onChange, placeholder }: { config: CloudConfig, value: string | undefined, onChange: (val: string) => void, placeholder: string }) => {
    const [mode, setMode] = useState<'raw' | 'smart'>('smart');
    const [filename, setFilename] = useState('');

    // Initialize filename from full URL if possible
    React.useEffect(() => {
        if (value && config.publicDomain && value.startsWith(config.publicDomain)) {
            setFilename(value.replace(config.publicDomain, '').replace(/^\//, ''));
            setMode('smart');
        } else if (value) {
            setMode('raw');
        }
    }, []); // Run once on mount basically

    const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFilename(name);
        // Auto construct URL
        const domain = config.publicDomain?.replace(/\/$/, '') || '';
        onChange(`${domain}/${name}`);
    };

    if (!config.enabled || !config.publicDomain) {
        return (
             <StyledInput 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder} 
            />
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2 text-[10px] font-bold uppercase">
                <button onClick={() => setMode('smart')} className={`px-2 py-1 rounded ${mode === 'smart' ? 'bg-yellow-500 text-midnight' : 'bg-white/5 text-slate-500'}`}>智能生成 (Smart)</button>
                <button onClick={() => setMode('raw')} className={`px-2 py-1 rounded ${mode === 'raw' ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>手动输入 (Raw)</button>
            </div>
            
            {mode === 'smart' ? (
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-3">
                    <span className="text-xs text-yellow-500 font-mono whitespace-nowrap max-w-[120px] truncate" title={config.publicDomain}>
                        {config.publicDomain.replace(/^https?:\/\//, '')}/
                    </span>
                    <input 
                        value={filename}
                        onChange={handleFilenameChange}
                        placeholder="输入文件名 (例如: song.mp3)"
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm font-mono placeholder:text-slate-600"
                    />
                </div>
            ) : (
                <StyledInput 
                    value={value || ''} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder="https://..." 
                />
            )}
        </div>
    );
}


const AdminPanel: React.FC<AdminPanelProps> = ({ data, updateData, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // --- Form States ---
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [trackMode, setTrackMode] = useState<'native' | 'netease'>('native');
  const [newTrack, setNewTrack] = useState<Partial<Track>>({ title: '', artist: 'VES', album: 'Single', duration: '', coverUrl: '', audioUrl: '', neteaseId: '' });

  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({ title: '', provider: 'aliyun', type: 'project', link: '', accessCode: '' });

  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [newArticle, setNewArticle] = useState<Partial<Article>>({ title: '', category: '', date: new Date().toLocaleDateString(), excerpt: '', coverUrl: '' });

  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({ name: '', role: '', avatarUrl: '', status: 'active' });

  // --- Handlers ---

  // Tracks
  const handleAddTrack = () => {
      if (!newTrack.title) return;
      const track: Track = {
          id: Date.now().toString(),
          title: newTrack.title!,
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

  // Resources
  const handleAddResource = () => {
      if (!newResource.title) return;
      const res: Resource = {
          id: Date.now().toString(),
          title: newResource.title!,
          description: newResource.description || '',
          type: newResource.type || 'other',
          provider: newResource.provider || 'aliyun',
          link: newResource.link || '#',
          accessCode: newResource.accessCode,
          size: newResource.size || 'Unknown',
          date: new Date().toLocaleDateString()
      };
      updateData(prev => ({ ...prev, resources: [...(prev.resources || []), res] }));
      setIsAddingResource(false);
      setNewResource({ title: '', provider: 'aliyun', type: 'project', link: '', accessCode: '' });
  };

  // Articles
  const handleAddArticle = () => {
      if(!newArticle.title) return;
      const art: Article = {
          id: Date.now().toString(),
          title: newArticle.title!,
          category: newArticle.category || '#NEWS',
          date: newArticle.date || new Date().toLocaleDateString(),
          excerpt: newArticle.excerpt || '',
          coverUrl: newArticle.coverUrl || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853',
      };
      updateData(prev => ({ ...prev, articles: [art, ...prev.articles] }));
      setIsAddingArticle(false);
      setNewArticle({ title: '', category: '', date: new Date().toLocaleDateString(), excerpt: '', coverUrl: '' });
  };

  // Artists
  const handleAddArtist = () => {
      if(!newArtist.name) return;
      const artist: Artist = {
          id: Date.now().toString(),
          name: newArtist.name!,
          role: newArtist.role || 'Member',
          avatarUrl: newArtist.avatarUrl || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
          status: newArtist.status || 'active'
      };
      updateData(prev => ({ ...prev, artists: [...prev.artists, artist] }));
      setIsAddingArtist(false);
      setNewArtist({ name: '', role: '', avatarUrl: '', status: 'active' });
  };


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 z-[60] bg-[#0F172A] text-slate-200 flex flex-col overflow-hidden font-sans"
    >
      {/* Top Bar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-hot-pink to-purple-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,0,128,0.4)] animate-pulse">
                  <Activity size={18} />
              </div>
              <div>
                  <h1 className="font-display font-bold text-lg text-white tracking-wider leading-none">VES CONTROL SYSTEM</h1>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-lime-punch rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Admin Access Granted</span>
                  </div>
              </div>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X size={20} />
              </button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-black/20 border-r border-white/5 p-4 flex flex-col gap-1 shrink-0 overflow-y-auto custom-scrollbar hidden md:flex">
              <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Modules</div>
              <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="全局设置 (General)" colorClass="bg-hot-pink" />
              <TabButton id="theme" activeTab={activeTab} setActiveTab={setActiveTab} icon={Palette} label="UI 主题 (Theme)" colorClass="bg-white" />
              <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="音乐作品 (Music)" colorClass="bg-electric-cyan" />
              <TabButton id="resources" activeTab={activeTab} setActiveTab={setActiveTab} icon={HardDrive} label="资源挂载 (Netdisk)" colorClass="bg-blue-400" />
              <TabButton id="storage" activeTab={activeTab} setActiveTab={setActiveTab} icon={Database} label="云端存储 (R2/S3)" colorClass="bg-yellow-500" />
              <TabButton id="articles" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText} label="动态日志 (Logs)" colorClass="bg-lime-punch" />
              <TabButton id="artists" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mic2} label="艺术家 (Artists)" colorClass="bg-purple-500" />
              <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="联系信息 (Contact)" colorClass="bg-rose-500" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-midnight to-surface p-4 md:p-10 custom-scrollbar transition-colors duration-500">
              <div className="max-w-5xl mx-auto pb-20">
                  
                  {/* === GENERAL TAB === */}
                  {activeTab === 'general' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                              <Layout className="text-hot-pink" />
                              <h2 className="text-xl font-display font-bold text-white">主页视觉与导航</h2>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-8">
                              {/* Hero Settings */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                                  <h3 className="text-sm font-bold text-hot-pink uppercase tracking-widest mb-4 border-l-2 border-hot-pink pl-3">主视觉配置 (Hero)</h3>
                                  <InputGroup label="主标题 第一行">
                                      <StyledInput value={data.hero.titleLine1} onChange={e => updateData(prev => ({...prev, hero: {...prev.hero, titleLine1: e.target.value}}))} />
                                  </InputGroup>
                                  <InputGroup label="主标题 第二行 (渐变色)">
                                      <StyledInput value={data.hero.titleLine2} onChange={e => updateData(prev => ({...prev, hero: {...prev.hero, titleLine2: e.target.value}}))} />
                                  </InputGroup>
                                  <InputGroup label="副标题 / 介绍文案">
                                      <textarea rows={3} value={data.hero.subtitle} onChange={e => updateData(prev => ({...prev, hero: {...prev.hero, subtitle: e.target.value}}))} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors resize-none" />
                                  </InputGroup>
                                  <InputGroup label="底部跑马灯文字">
                                      <StyledInput value={data.hero.marqueeText} onChange={e => updateData(prev => ({...prev, hero: {...prev.hero, marqueeText: e.target.value}}))} />
                                  </InputGroup>
                                  
                                  <div className="pt-4 border-t border-white/5">
                                      <InputGroup label="背景大图 URL">
                                          <div className="flex gap-2">
                                              <div className="w-16 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-white/20">
                                                  <img src={data.hero.heroImage} className="w-full h-full object-cover" alt="Preview"/>
                                              </div>
                                              <R2PathBuilder 
                                                  config={data.storage} 
                                                  value={data.hero.heroImage} 
                                                  onChange={val => updateData(prev => ({...prev, hero: {...prev.hero, heroImage: val}}))} 
                                                  placeholder="输入图片 URL"
                                              />
                                          </div>
                                      </InputGroup>
                                  </div>
                              </div>

                              {/* Album Settings */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 border-l-2 border-purple-400 pl-3">主推专辑 (Featured Album)</h3>
                                  <InputGroup label="专辑名称">
                                      <StyledInput value={data.featuredAlbum.title} onChange={e => updateData(prev => ({...prev, featuredAlbum: {...prev.featuredAlbum, title: e.target.value}}))} />
                                  </InputGroup>
                                  <InputGroup label="类型 / 年份">
                                      <StyledInput value={data.featuredAlbum.type} onChange={e => updateData(prev => ({...prev, featuredAlbum: {...prev.featuredAlbum, type: e.target.value}}))} />
                                  </InputGroup>
                                  <InputGroup label="专辑简介">
                                      <textarea rows={3} value={data.featuredAlbum.description} onChange={e => updateData(prev => ({...prev, featuredAlbum: {...prev.featuredAlbum, description: e.target.value}}))} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors resize-none" />
                                  </InputGroup>
                                  <InputGroup label="封面图片 URL">
                                       <div className="flex gap-2">
                                          <div className="w-16 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-white/20">
                                              <img src={data.featuredAlbum.coverUrl} className="w-full h-full object-cover" alt="Preview"/>
                                          </div>
                                          <R2PathBuilder 
                                              config={data.storage} 
                                              value={data.featuredAlbum.coverUrl} 
                                              onChange={val => updateData(prev => ({...prev, featuredAlbum: {...prev.featuredAlbum, coverUrl: val}}))} 
                                              placeholder="输入封面 URL"
                                          />
                                      </div>
                                  </InputGroup>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* === THEME TAB === */}
                  {activeTab === 'theme' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                              <Palette className="text-white" />
                              <h2 className="text-xl font-display font-bold text-white">UI 主题风格 (Appearance)</h2>
                          </div>

                          <div className="grid md:grid-cols-3 gap-6">
                               <ThemeCard 
                                  mode="cyberpunk"
                                  label="Cyberpunk (Default)"
                                  desc="经典的午夜蓝背景，搭配霓虹粉与电光蓝。科技感强，适合电子音乐。"
                                  colors={['#0F172A', '#FF0080', '#06B6D4', '#D9F99D']}
                                  currentMode={data.theme}
                                  onClick={() => updateData(prev => ({...prev, theme: 'cyberpunk'}))}
                               />
                               <ThemeCard 
                                  mode="acid"
                                  label="Acid Rave"
                                  desc="极高对比度的纯黑背景，搭配酸性绿和警戒橙。具有攻击性的地下俱乐部风格。"
                                  colors={['#000000', '#CCFF00', '#FF3300', '#FFFFFF']}
                                  currentMode={data.theme}
                                  onClick={() => updateData(prev => ({...prev, theme: 'acid'}))}
                               />
                               <ThemeCard 
                                  mode="vaporwave"
                                  label="Vaporwave Dream"
                                  desc="深靛蓝与日落紫的碰撞。柔和但高饱和，充满复古未来主义的浪漫情调。"
                                  colors={['#240046', '#FF9E00', '#E0AAFF', '#7B2CBF']}
                                  currentMode={data.theme}
                                  onClick={() => updateData(prev => ({...prev, theme: 'vaporwave'}))}
                               />
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8">
                              <h3 className="font-bold text-white mb-2">Preview Info</h3>
                              <p className="text-sm text-slate-400">
                                  切换主题后，全站配色（背景、文字、边框、按钮）将实时更新。该设置将保存到本地及云端（如果启用了同步）。
                              </p>
                          </div>
                      </div>
                  )}

                  {/* === MUSIC TAB === */}
                  {activeTab === 'music' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                              <div className="flex items-center gap-3">
                                  <Music className="text-electric-cyan" />
                                  <h2 className="text-xl font-display font-bold text-white">音乐作品库</h2>
                              </div>
                              <button onClick={() => setIsAddingTrack(!isAddingTrack)} className="flex items-center gap-2 bg-electric-cyan text-midnight px-4 py-2 rounded-lg font-bold text-xs hover:bg-white transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                  <Plus size={16} /> 添加新单曲
                              </button>
                          </div>

                          <AnimatePresence>
                              {isAddingTrack && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white/5 border border-electric-cyan/30 rounded-2xl p-6 overflow-hidden"
                                  >
                                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                                          <div className="space-y-4">
                                              <InputGroup label="歌曲标题">
                                                  <StyledInput value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} placeholder="输入歌名..." />
                                              </InputGroup>
                                              <div className="grid grid-cols-2 gap-4">
                                                  <InputGroup label="艺术家">
                                                      <StyledInput value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} />
                                                  </InputGroup>
                                                  <InputGroup label="专辑">
                                                      <StyledInput value={newTrack.album} onChange={e => setNewTrack({...newTrack, album: e.target.value})} />
                                                  </InputGroup>
                                              </div>
                                              <InputGroup label="封面图片">
                                                  <R2PathBuilder config={data.storage} value={newTrack.coverUrl} onChange={val => setNewTrack({...newTrack, coverUrl: val})} placeholder="封面 URL" />
                                              </InputGroup>
                                          </div>
                                          
                                          <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-4">
                                              <div className="flex gap-2 bg-black/40 p-1 rounded-lg w-fit border border-white/10">
                                                  <button onClick={() => setTrackMode('native')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${trackMode === 'native' ? 'bg-electric-cyan text-midnight' : 'text-slate-400 hover:text-white'}`}>R2 / 直链播放</button>
                                                  <button onClick={() => setTrackMode('netease')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${trackMode === 'netease' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}>网易云 ID</button>
                                              </div>

                                              {trackMode === 'native' ? (
                                                  <div className="space-y-4 animate-in fade-in">
                                                      <InputGroup label="音频文件 URL" subLabel="支持 MP3/WAV/FLAC">
                                                          <R2PathBuilder config={data.storage} value={newTrack.audioUrl} onChange={val => setNewTrack({...newTrack, audioUrl: val})} placeholder="输入音频直链..." />
                                                      </InputGroup>
                                                      <InputGroup label="时长 (可选)">
                                                          <StyledInput value={newTrack.duration} onChange={e => setNewTrack({...newTrack, duration: e.target.value})} placeholder="3:45" className="w-32" />
                                                      </InputGroup>
                                                  </div>
                                              ) : (
                                                  <div className="space-y-4 animate-in fade-in">
                                                      <InputGroup label="网易云音乐 Song ID">
                                                          <StyledInput value={newTrack.neteaseId} onChange={e => setNewTrack({...newTrack, neteaseId: e.target.value})} placeholder="例如: 186016" className="border-red-500/50 focus:border-red-500" />
                                                      </InputGroup>
                                                      <div className="text-[10px] text-slate-500 bg-red-500/10 p-2 rounded border border-red-500/20">
                                                          提示：在网易云网页版打开歌曲，URL 中的 id 参数即为 Song ID。
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                      
                                      <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                                          <button onClick={() => setIsAddingTrack(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">取消</button>
                                          <button onClick={handleAddTrack} className="px-6 py-2 bg-electric-cyan text-midnight text-xs font-bold rounded-lg hover:bg-white transition-colors">保存歌曲</button>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>

                          <div className="space-y-2">
                              {data.tracks.map(track => (
                                  <div key={track.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                                      <div className="flex items-center gap-4">
                                          <img src={track.coverUrl} className="w-12 h-12 rounded-lg object-cover shadow-lg" />
                                          <div>
                                              <div className="text-white font-bold text-sm flex items-center gap-2">
                                                  {track.title}
                                                  {track.neteaseId ? (
                                                      <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded">Netease</span>
                                                  ) : (
                                                      <span className="text-[10px] px-1.5 py-0.5 bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30 rounded">Audio</span>
                                                  )}
                                              </div>
                                              <div className="text-xs text-slate-500">{track.artist} • {track.album}</div>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => updateData(prev => ({...prev, tracks: prev.tracks.filter(t => t.id !== track.id)}))}
                                          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                   {/* === RESOURCES TAB === */}
                   {activeTab === 'resources' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                              <div className="flex items-center gap-3">
                                  <HardDrive className="text-blue-400" />
                                  <h2 className="text-xl font-display font-bold text-white">资源挂载 (下载中心)</h2>
                              </div>
                              <button onClick={() => setIsAddingResource(!isAddingResource)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                  <Plus size={16} /> 新增资源
                              </button>
                          </div>

                          <AnimatePresence>
                              {isAddingResource && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white/5 border border-blue-500/30 rounded-2xl p-6 overflow-hidden"
                                  >
                                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                                          <InputGroup label="资源标题">
                                              <StyledInput value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="Project File v1.0..." />
                                          </InputGroup>
                                          <InputGroup label="存储服务商">
                                              <StyledSelect value={newResource.provider} onChange={e => setNewResource({...newResource, provider: e.target.value as any})}>
                                                  <option value="aliyun">阿里云盘 (Aliyun Drive)</option>
                                                  <option value="baidu">百度网盘 (Baidu Netdisk)</option>
                                                  <option value="quark">夸克网盘 (Quark)</option>
                                                  <option value="google">Google Drive</option>
                                                  <option value="other">其他链接</option>
                                              </StyledSelect>
                                          </InputGroup>
                                      </div>
                                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                                          <div className="md:col-span-2">
                                              <InputGroup label="分享链接 (Share Link)">
                                                  <StyledInput value={newResource.link} onChange={e => setNewResource({...newResource, link: e.target.value})} placeholder="https://..." />
                                              </InputGroup>
                                          </div>
                                          <InputGroup label="提取码 (Access Code)">
                                              <StyledInput value={newResource.accessCode} onChange={e => setNewResource({...newResource, accessCode: e.target.value})} placeholder="选填..." />
                                          </InputGroup>
                                      </div>
                                      <InputGroup label="描述 / 备注">
                                          <StyledInput value={newResource.description} onChange={e => setNewResource({...newResource, description: e.target.value})} placeholder="工程文件说明..." />
                                      </InputGroup>
                                      
                                      <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-4">
                                          <button onClick={() => setIsAddingResource(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">取消</button>
                                          <button onClick={handleAddResource} className="px-6 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-400 transition-colors">挂载资源</button>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>

                          <div className="grid gap-3">
                              {data.resources.map(res => (
                                  <div key={res.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                              <FolderOpen size={20} />
                                          </div>
                                          <div>
                                              <div className="text-white font-bold text-sm">{res.title}</div>
                                              <div className="text-xs text-slate-500 font-mono flex gap-3">
                                                  <span className="text-blue-400 uppercase">{res.provider}</span>
                                                  {res.accessCode && <span>Code: {res.accessCode}</span>}
                                                  <span className="truncate max-w-[200px] opacity-50">{res.link}</span>
                                              </div>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => updateData(prev => ({...prev, resources: prev.resources.filter(r => r.id !== res.id)}))}
                                          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* === STORAGE TAB === */}
                  {activeTab === 'storage' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                              <Database className="text-yellow-500" />
                              <h2 className="text-xl font-display font-bold text-white">云端存储配置 (R2/S3)</h2>
                          </div>
                          
                          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
                               <div className="flex items-center justify-between mb-6">
                                   <div>
                                       <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                           直链生成服务 
                                           {data.storage.enabled ? <span className="text-[10px] bg-green-500 text-midnight px-2 rounded font-bold">ACTIVE</span> : <span className="text-[10px] bg-slate-700 text-white px-2 rounded font-bold">INACTIVE</span>}
                                       </h3>
                                       <p className="text-xs text-slate-400 mt-1">配置 Cloudflare R2 或 AWS S3 以启用文件直链生成功能。</p>
                                   </div>
                                   <button 
                                      onClick={() => updateData(prev => ({...prev, storage: {...prev.storage, enabled: !prev.storage.enabled}}))}
                                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${data.storage.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white' : 'bg-green-500 text-midnight hover:bg-white'}`}
                                   >
                                       {data.storage.enabled ? '禁用服务' : '启用服务'}
                                   </button>
                               </div>

                               <div className={`space-y-4 transition-opacity ${data.storage.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                   <div className="grid md:grid-cols-2 gap-4">
                                       <InputGroup label="服务提供商">
                                            <StyledSelect value={data.storage.provider} onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, provider: e.target.value as any}}))}>
                                                <option value="r2">Cloudflare R2</option>
                                                <option value="s3">Amazon S3 / Compatible</option>
                                            </StyledSelect>
                                       </InputGroup>
                                       <InputGroup label="公开访问域名 (Public Domain)" subLabel="用于生成文件链接">
                                            <StyledInput 
                                                value={data.storage.publicDomain} 
                                                onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, publicDomain: e.target.value}}))} 
                                                placeholder="https://pub-xxxxxxxx.r2.dev" 
                                                className="border-yellow-500/30 focus:border-yellow-500"
                                            />
                                       </InputGroup>
                                   </div>
                                   
                                   <div className="pt-4 border-t border-white/5">
                                       <div className="flex items-center gap-2 text-xs text-yellow-500 mb-4 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                           <AlertCircle size={14} />
                                           <span>注意：前端仅保存配置用于生成链接。敏感密钥 (Secret Key) 建议仅在本地开发环境使用，或通过后端函数处理。</span>
                                       </div>
                                       <div className="grid md:grid-cols-2 gap-4">
                                           <InputGroup label="Access Key ID">
                                               <StyledInput value={data.storage.accessKeyId} onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, accessKeyId: e.target.value}}))} />
                                           </InputGroup>
                                           <InputGroup label="Secret Access Key">
                                               <StyledInput type="password" value={data.storage.secretAccessKey} onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, secretAccessKey: e.target.value}}))} />
                                           </InputGroup>
                                           <InputGroup label="Bucket Name">
                                               <StyledInput value={data.storage.bucketName} onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, bucketName: e.target.value}}))} />
                                           </InputGroup>
                                           <InputGroup label="Endpoint">
                                               <StyledInput value={data.storage.endpoint} onChange={e => updateData(prev => ({...prev, storage: {...prev.storage, endpoint: e.target.value}}))} />
                                           </InputGroup>
                                       </div>
                                   </div>
                               </div>
                          </div>
                      </div>
                  )}

                  {/* === ARTICLES TAB === */}
                  {activeTab === 'articles' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                              <div className="flex items-center gap-3">
                                  <FileText className="text-lime-punch" />
                                  <h2 className="text-xl font-display font-bold text-white">动态日志</h2>
                              </div>
                              <button onClick={() => setIsAddingArticle(!isAddingArticle)} className="flex items-center gap-2 bg-lime-punch text-midnight px-4 py-2 rounded-lg font-bold text-xs hover:bg-white transition-colors">
                                  <Plus size={16} /> 发布新动态
                              </button>
                          </div>

                          <AnimatePresence>
                              {isAddingArticle && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white/5 border border-lime-punch/30 rounded-2xl p-6 overflow-hidden mb-6"
                                  >
                                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                                          <InputGroup label="文章标题">
                                              <StyledInput value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                                          </InputGroup>
                                          <InputGroup label="分类话题 (#TAG)">
                                              <StyledInput value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value})} />
                                          </InputGroup>
                                      </div>
                                      <InputGroup label="内容摘要">
                                          <textarea rows={3} value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-lime-punch/50 transition-colors resize-none mb-4" />
                                      </InputGroup>
                                      <InputGroup label="封面图片">
                                          <R2PathBuilder config={data.storage} value={newArticle.coverUrl} onChange={val => setNewArticle({...newArticle, coverUrl: val})} placeholder="输入图片 URL" />
                                      </InputGroup>

                                      <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-4">
                                          <button onClick={() => setIsAddingArticle(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">取消</button>
                                          <button onClick={handleAddArticle} className="px-6 py-2 bg-lime-punch text-midnight text-xs font-bold rounded-lg hover:bg-white transition-colors">发布文章</button>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>

                          <div className="grid gap-3">
                              {data.articles.map(article => (
                                  <div key={article.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-lime-punch/30 transition-all group">
                                      <div className="flex items-center gap-4">
                                          <img src={article.coverUrl} className="w-12 h-12 rounded-lg object-cover" />
                                          <div>
                                              <div className="text-white font-bold text-sm">{article.title}</div>
                                              <div className="text-xs text-slate-500 font-mono">{article.date} • {article.category}</div>
                                          </div>
                                      </div>
                                      <button onClick={() => updateData(prev => ({...prev, articles: prev.articles.filter(a => a.id !== article.id)}))} className="p-2 text-slate-600 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  
                  {/* === CONTACT TAB === */}
                  {activeTab === 'contact' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                              <Mail className="text-rose-500" />
                              <h2 className="text-xl font-display font-bold text-white">联系信息配置</h2>
                          </div>
                          
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                              <div className="grid md:grid-cols-2 gap-6">
                                  <InputGroup label="商务邮箱">
                                      <StyledInput value={data.contact.email} onChange={e => updateData(prev => ({...prev, contact: {...prev.contact, email: e.target.value}}))} />
                                  </InputGroup>
                                  <InputGroup label="联系电话">
                                      <StyledInput value={data.contact.phone} onChange={e => updateData(prev => ({...prev, contact: {...prev.contact, phone: e.target.value}}))} />
                                  </InputGroup>
                                  <InputGroup label="地址行 1">
                                      <StyledInput value={data.contact.addressLine1} onChange={e => updateData(prev => ({...prev, contact: {...prev.contact, addressLine1: e.target.value}}))} />
                                  </InputGroup>
                                  <InputGroup label="地址行 2">
                                      <StyledInput value={data.contact.addressLine2} onChange={e => updateData(prev => ({...prev, contact: {...prev.contact, addressLine2: e.target.value}}))} />
                                  </InputGroup>
                              </div>
                              <InputGroup label="底部版权文案 (Footer Text)">
                                  <StyledInput value={data.contact.footerText} onChange={e => updateData(prev => ({...prev, contact: {...prev.contact, footerText: e.target.value}}))} />
                              </InputGroup>
                          </div>
                      </div>
                  )}

                  {/* === ARTISTS TAB === */}
                  {activeTab === 'artists' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div className="flex items-center justify-between border-b border-white/10 pb-4">
                              <div className="flex items-center gap-3">
                                  <Mic2 className="text-purple-500" />
                                  <h2 className="text-xl font-display font-bold text-white">艺术家阵容</h2>
                              </div>
                              <button onClick={() => setIsAddingArtist(!isAddingArtist)} className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-purple-400 transition-colors">
                                  <Plus size={16} /> 添加成员
                              </button>
                          </div>

                          <AnimatePresence>
                              {isAddingArtist && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 overflow-hidden mb-6"
                                  >
                                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                                          <InputGroup label="姓名 / 艺名">
                                              <StyledInput value={newArtist.name} onChange={e => setNewArtist({...newArtist, name: e.target.value})} />
                                          </InputGroup>
                                          <InputGroup label="角色 / 担当">
                                              <StyledInput value={newArtist.role} onChange={e => setNewArtist({...newArtist, role: e.target.value})} />
                                          </InputGroup>
                                      </div>
                                      <InputGroup label="头像 URL">
                                          <R2PathBuilder config={data.storage} value={newArtist.avatarUrl} onChange={val => setNewArtist({...newArtist, avatarUrl: val})} placeholder="https://..." />
                                      </InputGroup>

                                      <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-4">
                                          <button onClick={() => setIsAddingArtist(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">取消</button>
                                          <button onClick={handleAddArtist} className="px-6 py-2 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-white transition-colors">添加</button>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>

                          <div className="grid md:grid-cols-2 gap-4">
                              {data.artists.map(artist => (
                                  <div key={artist.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                                      <img src={artist.avatarUrl} className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/50" />
                                      <div>
                                          <div className="text-white font-bold">{artist.name}</div>
                                          <div className="text-xs text-purple-400">{artist.role}</div>
                                      </div>
                                      <button onClick={() => updateData(prev => ({...prev, artists: prev.artists.filter(a => a.id !== artist.id)}))} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

              </div>
          </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
