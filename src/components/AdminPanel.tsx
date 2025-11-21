
import React, { useState, useRef } from 'react';
import type { Track, SiteData, Article, Artist, Resource } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, HardDrive, Mail, Image as ImageIcon, Type, Disc, Album, FolderOpen, Save, RefreshCw, Link2 } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'resources' | 'contact';

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

const AdminPanel: React.FC<AdminPanelProps> = ({ data, updateData, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // --- Music State ---
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [trackMode, setTrackMode] = useState<'native' | 'netease'>('native');
  const [newTrack, setNewTrack] = useState<Partial<Track>>({ title: '', artist: 'VES', album: 'Single', duration: '', coverUrl: '', audioUrl: '', neteaseId: '' });

  // --- Article State ---
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [newArticle, setNewArticle] = useState<Partial<Article>>({ title: '', category: '#NEWS', excerpt: '', coverUrl: '' });

  // --- Artist State ---
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({ name: '', role: '', avatarUrl: '' });

  // --- Resource State (Netdisk) ---
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
      title: '', description: '', type: 'audio', provider: 'aliyun', link: '', accessCode: '', size: '', date: ''
  });

  // --- General Handlers ---
  const handleHeroChange = (field: keyof SiteData['hero'], value: string) => updateData({ ...data, hero: { ...data.hero, [field]: value } });
  const handleContactChange = (field: keyof SiteData['contact'], value: string) => updateData({ ...data, contact: { ...data.contact, [field]: value } });

  // --- Music Handlers ---
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
          audioUrl: trackMode === 'native' ? newTrack.audioUrl : undefined,
          neteaseId: trackMode === 'netease' ? newTrack.neteaseId : undefined,
      };
      updateData(prev => ({ ...prev, tracks: [track, ...prev.tracks] }));
      setIsAddingTrack(false);
      setNewTrack({ title: '', artist: 'VES', album: 'Single', duration: '', coverUrl: '', audioUrl: '', neteaseId: '' });
  };
  const deleteTrack = (id: string) => {
      if(confirm('确定删除这首歌吗？')) updateData(prev => ({ ...prev, tracks: prev.tracks.filter(t => t.id !== id) }));
  };

  // --- Article Handlers ---
  const addArticle = () => {
      if(!newArticle.title) return;
      const article: Article = {
          id: Date.now().toString(),
          title: newArticle.title!,
          category: newArticle.category || '#NEWS',
          date: new Date().toLocaleDateString(),
          excerpt: newArticle.excerpt || '',
          coverUrl: newArticle.coverUrl || 'https://picsum.photos/300',
      }
      updateData(prev => ({ ...prev, articles: [article, ...prev.articles] }));
      setIsAddingArticle(false);
      setNewArticle({ title: '', category: '#NEWS', excerpt: '', coverUrl: '' });
  }
  const deleteArticle = (id: string) => {
      if(confirm('确定删除这篇文章吗？')) updateData(prev => ({ ...prev, articles: prev.articles.filter(a => a.id !== id) }));
  }

  // --- Artist Handlers ---
  const addArtist = () => {
      if(!newArtist.name) return;
      const artist: Artist = {
          id: Date.now().toString(),
          name: newArtist.name!,
          role: newArtist.role || 'Artist',
          avatarUrl: newArtist.avatarUrl || 'https://picsum.photos/100',
          status: 'active'
      }
      updateData(prev => ({ ...prev, artists: [...prev.artists, artist] }));
      setIsAddingArtist(false);
      setNewArtist({ name: '', role: '', avatarUrl: '' });
  }
  const deleteArtist = (id: string) => {
      if(confirm('移除该艺术家？')) updateData(prev => ({ ...prev, artists: prev.artists.filter(a => a.id !== id) }));
  }

  // --- Resource Handlers ---
  const addResource = () => {
      if (!newResource.title) return;
      const resource: Resource = {
          id: Date.now().toString(),
          title: newResource.title || '新资源',
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
      setNewResource({ title: '', description: '', type: 'audio', provider: 'aliyun', link: '', accessCode: '', size: '' });
  };
  const deleteResource = (id: string) => {
      if (confirm("确定移除该资源链接吗？")) updateData(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== id) }));
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
                <SonicText text="VES ADMIN SYSTEM" />
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
            <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={Layout} label="网站概览" colorClass="bg-hot-pink" />
            <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="音乐管理" colorClass="bg-electric-cyan" />
            <TabButton id="resources" activeTab={activeTab} setActiveTab={setActiveTab} icon={HardDrive} label="网盘挂载" colorClass="bg-blue-400" />
            <TabButton id="articles" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText} label="文章动态" colorClass="bg-lime-punch" />
            <TabButton id="artists" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mic2} label="艺术家" colorClass="bg-purple-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="联系信息" colorClass="bg-rose-500" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            
            {/* General Tab */}
            {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                         <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                            <Type size={16} className="text-hot-pink" />
                            <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest">首页主视觉文案</h3>
                         </div>
                         <div className="space-y-4">
                             <div><label className="text-xs text-slate-500 block mb-1 font-bold">主标题第一行</label><input value={data.hero.titleLine1} onChange={e => handleHeroChange('titleLine1', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-hot-pink outline-none"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1 font-bold">主标题第二行 (渐变)</label><input value={data.hero.titleLine2} onChange={e => handleHeroChange('titleLine2', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-electric-cyan outline-none"/></div>
                             <div><label className="text-xs text-slate-500 block mb-1 font-bold">副标题</label><textarea value={data.hero.subtitle} onChange={e => handleHeroChange('subtitle', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-white outline-none" rows={3}/></div>
                             <div><label className="text-xs text-slate-500 block mb-1 font-bold">主图链接</label><input value={data.hero.heroImage} onChange={e => handleHeroChange('heroImage', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-slate-400 text-xs font-mono"/></div>
                         </div>
                    </div>
                </motion.div>
            )}

            {/* Music Tab */}
            {activeTab === 'music' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                     <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">单曲列表管理</h3>
                        <button onClick={() => setIsAddingTrack(!isAddingTrack)} className="bg-electric-cyan text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white flex items-center gap-2"><Plus size={16}/> 添加歌曲</button>
                     </div>

                     {isAddingTrack && (
                        <div className="bg-white/5 p-6 rounded-xl mb-6 grid gap-4 border border-white/10">
                            <div className="flex gap-4 mb-2">
                                <button onClick={() => setTrackMode('native')} className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${trackMode === 'native' ? 'bg-electric-cyan text-midnight border-electric-cyan' : 'border-white/20 text-slate-400'}`}>本地 / 直链音频</button>
                                <button onClick={() => setTrackMode('netease')} className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${trackMode === 'netease' ? 'bg-red-500 text-white border-red-500' : 'border-white/20 text-slate-400'}`}>网易云音乐 ID</button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="歌曲标题" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} />
                                <input placeholder="艺术家" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="专辑名称" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.album} onChange={e => setNewTrack({...newTrack, album: e.target.value})} />
                                <input placeholder="封面图 URL" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-electric-cyan outline-none" value={newTrack.coverUrl} onChange={e => setNewTrack({...newTrack, coverUrl: e.target.value})} />
                            </div>
                            
                            {trackMode === 'native' ? (
                                <input placeholder="音频文件 URL (MP3/WAV)" className="bg-black/50 p-3 rounded border border-white/10 text-white font-mono text-xs focus:border-electric-cyan outline-none" value={newTrack.audioUrl} onChange={e => setNewTrack({...newTrack, audioUrl: e.target.value})} />
                            ) : (
                                <input placeholder="网易云音乐 Song ID (数字)" className="bg-black/50 p-3 rounded border border-red-500/30 text-white font-mono text-xs focus:border-red-500 outline-none" value={newTrack.neteaseId} onChange={e => setNewTrack({...newTrack, neteaseId: e.target.value})} />
                            )}
                            
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsAddingTrack(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">取消</button>
                                <button onClick={addTrack} className="bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/50 px-6 py-2 rounded font-bold hover:bg-electric-cyan hover:text-midnight transition-colors">保存歌曲</button>
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
                                            {t.neteaseId && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">网易云</span>}
                                        </div>
                                        <div className="text-xs text-slate-500">{t.artist} • {t.album}</div>
                                    </div>
                                </div>
                                <button onClick={() => deleteTrack(t.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-white/10 rounded-full transition-all"><Trash2 size={18}/></button>
                            </div>
                        ))}
                     </div>
                </motion.div>
            )}

            {/* Resources (Netdisk) Tab - NEW MOUNT MODE UI */}
            {activeTab === 'resources' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <HardDrive size={18} className="text-blue-400" />
                            <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest">网盘挂载管理 (Mount Points)</h3>
                        </div>
                        <button onClick={() => setIsAddingResource(!isAddingResource)} className="bg-blue-400 text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white flex items-center gap-2"><Plus size={16} /> 新增挂载</button>
                    </div>

                    {isAddingResource && (
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4 shadow-lg">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500">资源标题</label>
                                    <input className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="例如: Neon Dreams 工程文件" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500">来源平台</label>
                                    <select className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.provider} onChange={e => setNewResource({...newResource, provider: e.target.value as any})}>
                                        <option value="aliyun">阿里云盘 (Aliyun)</option>
                                        <option value="baidu">百度网盘 (Baidu)</option>
                                        <option value="quark">夸克网盘 (Quark)</option>
                                        <option value="google">Google Drive</option>
                                        <option value="other">其他链接</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">分享链接 / 直链</label>
                                <div className="flex items-center gap-2 bg-black/50 rounded border border-white/10 px-3">
                                    <Link2 size={16} className="text-slate-500" />
                                    <input className="flex-1 bg-transparent p-3 text-white font-mono text-xs outline-none" value={newResource.link} onChange={e => setNewResource({...newResource, link: e.target.value})} placeholder="https://..." />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500">提取码 (可选)</label>
                                    <input className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.accessCode} onChange={e => setNewResource({...newResource, accessCode: e.target.value})} placeholder="e.g. 8888" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500">文件大小</label>
                                    <input className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.size} onChange={e => setNewResource({...newResource, size: e.target.value})} placeholder="e.g. 2.5 GB" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500">文件类型</label>
                                    <select className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})}>
                                        <option value="audio">音频 (Audio)</option>
                                        <option value="video">视频 (Video)</option>
                                        <option value="project">工程 (Project)</option>
                                        <option value="archive">压缩包 (Zip/Rar)</option>
                                        <option value="other">其他</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">描述信息</label>
                                <textarea className="w-full bg-black/50 p-3 rounded border border-white/10 text-white focus:border-blue-400 outline-none" rows={2} value={newResource.description} onChange={e => setNewResource({...newResource, description: e.target.value})} placeholder="资源简介..." />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsAddingResource(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">取消</button>
                                <button onClick={addResource} className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-6 py-2 rounded font-bold hover:bg-blue-500 hover:text-white transition-colors">挂载资源</button>
                            </div>
                        </div>
                    )}

                    {/* File Manager Style List */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-12 bg-white/5 p-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-white/5">
                            <div className="col-span-6 pl-2">Name / Link</div>
                            <div className="col-span-2">Size</div>
                            <div className="col-span-2">Provider</div>
                            <div className="col-span-2 text-right pr-2">Action</div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {(data.resources || []).map(res => (
                                <div key={res.id} className="grid grid-cols-12 p-4 items-center hover:bg-white/5 transition-colors group text-sm">
                                    <div className="col-span-6 flex items-center gap-3 pl-2">
                                        <FolderOpen size={20} className="text-blue-400 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-bold text-white truncate pr-4">{res.title}</div>
                                            <div className="text-xs text-slate-500 truncate font-mono">{res.link}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-slate-400 font-mono text-xs">{res.size}</div>
                                    <div className="col-span-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                            res.provider === 'aliyun' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                                            res.provider === 'baidu' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                            'border-slate-500/30 text-slate-400 bg-white/5'
                                        }`}>
                                            {res.provider.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-end pr-2">
                                        <button onClick={() => deleteResource(res.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {(data.resources || []).length === 0 && (
                                <div className="p-8 text-center text-slate-600 font-mono text-sm">暂无挂载资源</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h3 className="text-lime-punch font-mono text-sm uppercase tracking-widest">文章与动态</h3>
                        <button onClick={() => setIsAddingArticle(!isAddingArticle)} className="bg-lime-punch text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white flex items-center gap-2"><Plus size={16}/> 发布文章</button>
                     </div>
                     {isAddingArticle && (
                        <div className="bg-white/5 p-6 rounded-xl mb-6 grid gap-4 border border-white/10">
                            <input placeholder="文章标题" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                            <input placeholder="分类 (例如 #NEWS)" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value})} />
                            <textarea rows={3} placeholder="摘要" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
                            <input placeholder="封面图片 URL" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-lime-punch outline-none" value={newArticle.coverUrl} onChange={e => setNewArticle({...newArticle, coverUrl: e.target.value})} />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsAddingArticle(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">取消</button>
                                <button onClick={addArticle} className="bg-lime-punch/20 text-lime-punch border border-lime-punch/50 px-6 py-2 rounded font-bold hover:bg-lime-punch hover:text-midnight transition-colors">发布</button>
                            </div>
                        </div>
                     )}
                     <div className="space-y-2">
                        {data.articles.map(a => (
                            <div key={a.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10">
                                <div className="flex items-center gap-4">
                                    <img src={a.coverUrl} className="w-12 h-12 rounded-lg object-cover" />
                                    <div>
                                        <div className="text-white font-bold">{a.title}</div>
                                        <div className="text-xs text-slate-500">{a.date} • {a.category}</div>
                                    </div>
                                </div>
                                <button onClick={() => deleteArticle(a.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-white/10 rounded-full"><Trash2 size={18}/></button>
                            </div>
                        ))}
                     </div>
                </motion.div>
            )}

            {/* Artists Tab */}
            {activeTab === 'artists' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h3 className="text-purple-500 font-mono text-sm uppercase tracking-widest">艺术家</h3>
                        <button onClick={() => setIsAddingArtist(!isAddingArtist)} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-purple-400 flex items-center gap-2"><Plus size={16}/> 添加</button>
                     </div>
                     {isAddingArtist && (
                        <div className="bg-white/5 p-6 rounded-xl mb-6 grid gap-4 border border-white/10">
                            <input placeholder="名字" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-purple-500 outline-none" value={newArtist.name} onChange={e => setNewArtist({...newArtist, name: e.target.value})} />
                            <input placeholder="角色 (e.g. Vocal)" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-purple-500 outline-none" value={newArtist.role} onChange={e => setNewArtist({...newArtist, role: e.target.value})} />
                            <input placeholder="头像 URL" className="bg-black/50 p-3 rounded border border-white/10 text-white focus:border-purple-500 outline-none" value={newArtist.avatarUrl} onChange={e => setNewArtist({...newArtist, avatarUrl: e.target.value})} />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsAddingArtist(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">取消</button>
                                <button onClick={addArtist} className="bg-purple-500/20 text-purple-400 border border-purple-500/50 px-6 py-2 rounded font-bold hover:bg-purple-500 hover:text-white transition-colors">保存</button>
                            </div>
                        </div>
                     )}
                     <div className="grid md:grid-cols-2 gap-4">
                        {data.artists.map(a => (
                            <div key={a.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-transparent hover:border-purple-500/30 hover:bg-purple-500/5 transition-all relative group">
                                <img src={a.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <div className="text-white font-bold">{a.name}</div>
                                    <div className="text-xs text-slate-500">{a.role}</div>
                                </div>
                                <button onClick={() => deleteArtist(a.id)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 p-2 bg-black/50 rounded-full"><Trash2 size={16}/></button>
                            </div>
                        ))}
                     </div>
                </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">Email</label><input value={data.contact?.email || ''} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none" /></div>
                            <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">Phone</label><input value={data.contact?.phone || ''} onChange={(e) => handleContactChange('phone', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] text-slate-500 uppercase font-bold">Footer Text</label><textarea value={data.contact?.footerText || ''} onChange={(e) => handleContactChange('footerText', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none" rows={2} /></div>
                    </div>
                </motion.div>
            )}

        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
