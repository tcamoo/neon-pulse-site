
import React, { useState, useRef, useEffect } from 'react';
import type { Track, SiteData, Article, Artist, FeaturedAlbum, CloudConfig, Resource } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, Upload, Cloud, CheckCircle2, AlertCircle, HardDrive, Database, Image as ImageIcon, Menu, Type, Mail, Key, RefreshCw, Save, Disc, Album, Phone, MapPin, FileEdit, ToggleLeft, ToggleRight, CloudLightning, CloudRain, Eye, EyeOff, FolderOpen, ArrowUp, Link, Box } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'resources' | 'cloud' | 'contact';
type CloudProvider = 'ali' | 'one' | 'cf' | null;

// --- AWS Signature V4 Helper for R2/OSS Uploads (Browser Native) ---
const uploadToS3 = async (file: File, config: CloudConfig, onProgress: (percent: number) => void): Promise<string> => {
    if (!config.accessKey || !config.secretKey || !config.bucket || !config.endpoint) {
        throw new Error("配置不完整: 缺少 AccessKey, SecretKey, Bucket 或 Endpoint");
    }

    const method = 'PUT';
    const service = 's3';
    const region = 'auto'; 
    // Ensure endpoint has protocol
    const endpointUrl = config.endpoint.startsWith('http') ? config.endpoint : `https://${config.endpoint}`;
    const host = new URL(endpointUrl).host;
    const path = `/${config.bucket}/${file.name}`;
    const url = `${endpointUrl}${path}`;
    
    const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = datetime.substr(0, 8);
    
    const arrayBuffer = await file.arrayBuffer();
    const payloadHashBuf = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const payloadHash = Array.from(new Uint8Array(payloadHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${datetime}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    const canonicalRequestHashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
    const canonicalRequestHash = Array.from(new Uint8Array(canonicalRequestHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const stringToSign = `${algorithm}\n${datetime}\n${credentialScope}\n${canonicalRequestHash}`;

    const getSignatureKey = async (key: string, date: string, regionName: string, serviceName: string) => {
        const enc = new TextEncoder();
        const kDate = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', enc.encode(`AWS4${key}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(date));
        const kRegion = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', kDate, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(regionName));
        const kService = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', kRegion, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(serviceName));
        const kSigning = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', kService, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode('aws4_request'));
        return kSigning;
    };

    const signingKeyBuffer = await getSignatureKey(config.secretKey, date, region, service);
    const signingKey = await crypto.subtle.importKey('raw', signingKeyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBuf = await crypto.subtle.sign('HMAC', signingKey, new TextEncoder().encode(stringToSign));
    const signature = Array.from(new Uint8Array(signatureBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const authorizationHeader = `${algorithm} Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress = Math.min(progress + 10, 90);
        onProgress(progress);
    }, 200);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'x-amz-date': datetime,
                'x-amz-content-sha256': payloadHash,
                'Authorization': authorizationHeader,
                'Content-Type': file.type || 'application/octet-stream',
            },
            body: file
        });

        clearInterval(progressInterval);
        
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Upload Failed: ${response.status} ${errText}`);
        }
        
        onProgress(100);
        
        // Generate Return URL
        // If Public Domain is set, use it. Otherwise construct from endpoint (generic S3 style)
        if (config.publicDomain) {
             const publicDomain = config.publicDomain.replace(/\/$/, '');
             const encodedFilename = encodeURIComponent(file.name);
             return `${publicDomain}/${encodedFilename}`;
        } else {
             // Fallback for OSS without custom domain binding
             // Note: This is a rough guess, usually OSS needs specific public bucket domain handling
             return `${endpointUrl}/${file.name}`;
        }

    } catch (error) {
        clearInterval(progressInterval);
        throw error;
    }
};


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

const UploadProgressWidget = ({ progress, speed, remaining, active, message }: { progress: number, speed: string, remaining: string, active: boolean, message?: string }) => {
    if (!active) return null;
    
    return (
        <div className="relative w-full bg-black/60 border border-electric-cyan/30 rounded-xl overflow-hidden p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.5)_2px)] bg-[size:4px_4px] opacity-20 pointer-events-none"></div>
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-electric-cyan uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Activity size={12} className="animate-pulse" /> 
                        {message || "正在上传 (Uplink Active)"}
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
    const [localConfig, setLocalConfig] = useState<CloudConfig>(config || { enabled: false, accessKey: '', secretKey: '', bucket: '', endpoint: '' });
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
                    <Cloud size={14} /> 配置 {label}
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
                            placeholder="例如: https://<account>.r2.cloudflarestorage.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Access Key ID</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.accessKey || ''}
                            onChange={(e) => setLocalConfig({...localConfig, accessKey: e.target.value})}
                            placeholder="Ex: LTAI5t8..."
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
                            placeholder="my-music-bucket"
                        />
                    </div>
                    <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            Public Domain (公开访问域名)
                        </label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-electric-cyan text-xs focus:border-electric-cyan outline-none"
                            value={localConfig.publicDomain || ''}
                            onChange={(e) => setLocalConfig({...localConfig, publicDomain: e.target.value})}
                            placeholder="https://pub-xxx.r2.dev"
                        />
                    </div>
                </div>
            )}

             {/* Form for OAuth Services (OneDrive) */}
             {type === 'oauth' && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 mb-2">
                        注意：静态网站无法直接处理 OAuth 回调。此处仅用于存储客户端 ID 和密钥，实际上传请使用官方客户端生成分享链接，然后在“资源下载”中添加。
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Client ID</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.clientId || ''}
                            onChange={(e) => setLocalConfig({...localConfig, clientId: e.target.value})}
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Client Secret</label>
                         <input 
                            type="password" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.secretKey || ''}
                            onChange={(e) => setLocalConfig({...localConfig, secretKey: e.target.value})}
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-white/5">
                <button 
                    onClick={() => onSave({...localConfig, enabled: true})}
                    className={`px-6 py-2.5 rounded-lg font-bold text-xs text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-all ${color.replace('text-', 'bg-')}`}
                >
                    <Save size={16} /> 保存配置
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
    title: '', artist: 'VES', album: 'Neon Dreams', duration: '', plays: 0, coverUrl: '', audioUrl: '', lyrics: '', sourceType: 'native', externalId: ''
  });
  const [searchTerm] = useState('');
  const audioInputRef = useRef<HTMLInputElement>(null);

  // --- State for Articles ---
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

  // --- State for Resources (New) ---
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
      title: '', description: '', type: 'audio', provider: 'aliyun', link: '', accessCode: '', size: '', date: ''
  });
  
  // --- State for Hero Image Upload ---
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  
  // --- State for Featured Album Upload ---
  const albumImageInputRef = useRef<HTMLInputElement>(null);

  // --- State for Uploads & Cloud ---
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'music' | 'image'>('music'); 
  const [pickerTarget, setPickerTarget] = useState<'article' | 'track' | 'hero' | 'album'>('track');
  const [pickerProvider, setPickerProvider] = useState<'cf' | 'local'>('local');
  const cloudUploadInputRef = useRef<HTMLInputElement>(null);
  
  // KV Sync Secret
  const [kvSyncSecret, setKvSyncSecret] = useState(() => {
      return localStorage.getItem('ves_sync_secret') || '';
  });
  
  // Which Cloud Config Form is Open
  const [editingCloud, setEditingCloud] = useState<CloudProvider>(null);

  // Cloud Files State (Simulated list + Uploaded list)
  const [cloudFiles, setCloudFiles] = useState<{name: string, size: string, url: string, provider: 'ali' | 'one' | 'cf', type: 'audio' | 'image', isNew?: boolean}[]>([
      { name: 'VES_Demo_v1.mp3', size: '8.4 MB', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', provider: 'cf', type: 'audio' },
  ]);
  
  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const [uploadStatus, setUploadStatus] = useState<{
    active: boolean;
    progress: number;
    speed: string;
    remaining: string;
    message?: string;
  }>({ active: false, progress: 0, speed: '0 MB/s', remaining: '0s' });

  // --- Helpers ---
  const getRandomImage = () => `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;

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

  const handleContactChange = (field: keyof SiteData['contact'], value: string) => {
      updateData({
          ...data,
          contact: { ...data.contact, [field]: value }
      });
  }
  
  // --- Sync Functions ---
  const handleSyncPush = async () => {
      if (!kvSyncSecret) {
          setSyncMessage("错误：请输入同步密钥 (Secret Key)");
          setSyncStatus('error');
          return;
      }
      
      localStorage.setItem('ves_sync_secret', kvSyncSecret);
      setSyncStatus('syncing');
      try {
          const res = await fetch('/api/sync', {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'x-auth-key': kvSyncSecret
              },
              body: JSON.stringify(data)
          });
          
          if (res.ok) {
              setSyncStatus('success');
              setSyncMessage('成功：数据已同步到云端！');
          } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const errData = await res.json().catch(() => ({}));
              setSyncStatus('error');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setSyncMessage(`失败: ${res.status} ${(errData as any).error || '验证失败'}`);
          }
      } catch (e) {
          setSyncStatus('error');
          setSyncMessage('错误：网络连接失败。');
      }
      setTimeout(() => { if (syncStatus === 'success') setSyncStatus('idle'); }, 5000);
  };

  // --- Cloud Config Handlers (Safe Access) ---
  const handleCloudToggle = (provider: 'ali' | 'one' | 'cf') => {
      let key: keyof SiteData['integrations'];
      if (provider === 'cf') key = 'cloudflare';
      else if (provider === 'ali') key = 'aliDrive';
      else if (provider === 'one') key = 'oneDrive';
      else return; 

      const currentConfig = data.integrations?.[key];
      if (currentConfig?.enabled) {
          updateData(prev => ({ ...prev, integrations: { ...prev.integrations, [key]: { ...prev.integrations[key], enabled: false } } }));
          setEditingCloud(null);
      } else {
          setEditingCloud(provider);
      }
  };

  const handleSaveCloudConfig = (provider: 'ali' | 'one' | 'cf', config: CloudConfig) => {
      let key: keyof SiteData['integrations'];
      if (provider === 'cf') key = 'cloudflare';
      else if (provider === 'ali') key = 'aliDrive';
      else if (provider === 'one') key = 'oneDrive';
      else return;

      updateData(prev => ({ 
          ...prev, 
          integrations: { 
              ...prev.integrations, 
              [key]: config 
          } 
      }));
      setEditingCloud(null);
  };

  // --- Cloud File Selection Logic ---
  const handleCloudFileSelect = (file: {url: string, type: 'audio' | 'image', name: string}) => {
      setShowCloudPicker(false);
      
      if (pickerTarget === 'hero') {
          updateData(prev => ({ ...prev, hero: { ...prev.hero, heroImage: file.url } }));
      } else if (pickerTarget === 'album') {
          updateData(prev => ({ ...prev, featuredAlbum: { ...prev.featuredAlbum, coverUrl: file.url } }));
      } else if (pickerTarget === 'track') {
          setNewTrack(prev => ({ ...prev, audioUrl: file.url }));
      } else if (pickerTarget === 'article') {
          if (pickerMode === 'image') {
              setNewArticle(prev => ({ ...prev, coverUrl: file.url }));
          }
      }
  };

  // --- REAL Upload Logic for R2 (or other S3 compatible if configured) ---
  const handleCloudUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const config = data.integrations?.cloudflare; // Defaulting to R2 for direct uploads in this version
      
      if (pickerProvider === 'cf' && config?.enabled) {
          setUploadStatus({ active: true, progress: 0, speed: 'Calculating...', remaining: '...', message: '正在连接 R2...' });
          try {
              const publicUrl = await uploadToS3(file, config, (percent) => {
                  setUploadStatus(prev => ({
                      ...prev, progress: percent, speed: 'Uploading', remaining: percent < 100 ? '...' : 'Finishing', message: percent < 100 ? '上传中 (Uploading)...' : '处理中...'
                  }));
              });
              
              const newFile = {
                  name: file.name,
                  size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                  url: publicUrl,
                  provider: 'cf' as const,
                  type: file.type.startsWith('image') ? 'image' : 'audio' as 'image'|'audio',
                  isNew: true
              };
              
              setCloudFiles(prev => [newFile, ...prev]);
              setUploadStatus({ active: false, progress: 0, speed: '', remaining: '' });
          } catch (err: any) {
              console.error(err);
              setUploadStatus(prev => ({ ...prev, message: '上传失败: ' + err.message }));
              setTimeout(() => setUploadStatus({ active: false, progress: 0, speed: '', remaining: '' }), 3000);
          }
      } else {
          alert("当前仅支持 Cloudflare R2 进行直传。");
      }
  };

  // Local blob upload (Simulation)
  const handleGenericUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'album' | 'track' | 'article') => {
      const file = e.target.files?.[0];
      if (file) {
          const finalUrl = URL.createObjectURL(file);
          if (target === 'hero') updateData(prev => ({ ...prev, hero: { ...prev.hero, heroImage: finalUrl } }));
          else if (target === 'album') updateData(prev => ({ ...prev, featuredAlbum: { ...prev.featuredAlbum, coverUrl: finalUrl } }));
          else if (target === 'article') setNewArticle(prev => ({ ...prev, coverUrl: finalUrl }));
          else if (target === 'track') setNewTrack(prev => ({ ...prev, audioUrl: finalUrl }));
      }
  }
  
  const addTrack = () => {
    if (!newTrack.title) return;
    const track: Track = {
      id: Date.now().toString(),
      title: newTrack.title || '无题',
      artist: newTrack.artist || 'VES',
      album: newTrack.album || '单曲',
      duration: newTrack.duration || '3:00',
      plays: 0,
      coverUrl: newTrack.coverUrl || getRandomImage(),
      audioUrl: newTrack.audioUrl,
      lyrics: newTrack.lyrics || '',
      sourceType: newTrack.sourceType,
      externalId: newTrack.externalId
    };
    updateData({ ...data, tracks: [track, ...data.tracks] }); 
    setIsAddingTrack(false);
    setNewTrack({ title: '', artist: 'VES', album: 'Neon Dreams', duration: '', plays: 0, coverUrl: '', audioUrl: '', lyrics: '', sourceType: 'native', externalId: '' });
  };
  const deleteTrack = (id: string) => updateData({ ...data, tracks: data.tracks.filter(t => t.id !== id) });
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
  const deleteArticle = (id: string) => updateData({ ...data, articles: data.articles.filter(a => a.id !== id) });
  const addArtist = () => {
    const artist: Artist = { id: Date.now().toString(), name: newArtist.name || 'Name', role: newArtist.role || 'Artist', avatarUrl: newArtist.avatarUrl || getRandomImage(), status: 'active' };
    updateData({ ...data, artists: [...(data.artists || []), artist] });
    setIsAddingArtist(false);
    setNewArtist({ name: '', role: '', avatarUrl: '', status: 'active' });
  };
  const deleteArtist = (id: string) => updateData({ ...data, artists: data.artists.filter(a => a.id !== id) });

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
            <TabButton id="music" activeTab={activeTab} setActiveTab={setActiveTab} icon={Music} label="音乐管理" colorClass="bg-electric-cyan" />
            <TabButton id="resources" activeTab={activeTab} setActiveTab={setActiveTab} icon={HardDrive} label="资源下载" colorClass="bg-blue-400" />
            <TabButton id="articles" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText} label="动态日志" colorClass="bg-lime-punch" />
            <TabButton id="artists" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mic2} label="艺人管理" colorClass="bg-purple-500" />
            <TabButton id="contact" activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="联系信息" colorClass="bg-rose-500" />
            <div className="hidden md:block h-px bg-white/5 my-2"></div>
            <TabButton id="cloud" activeTab={activeTab} setActiveTab={setActiveTab} icon={RefreshCw} label="云端同步" colorClass="bg-orange-500" />
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

            {/* Resources Tab */}
            {activeTab === 'resources' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <HardDrive size={18} className="text-blue-400" />
                            <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest">资源下载管理 (Netdisk Mount)</h3>
                        </div>
                        <button 
                            onClick={() => setIsAddingResource(!isAddingResource)}
                            className="bg-blue-400 text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> {isAddingResource ? '取消' : '添加资源链接'}
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
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">网盘提供商</label>
                                    <select className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.provider} onChange={e => setNewResource({...newResource, provider: e.target.value as any})}>
                                        <option value="aliyun">阿里云盘</option>
                                        <option value="baidu">百度网盘</option>
                                        <option value="quark">夸克网盘</option>
                                        <option value="google">Google Drive</option>
                                    </select>
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">分享链接</label>
                                <input className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none font-mono text-xs" value={newResource.link} onChange={e => setNewResource({...newResource, link: e.target.value})} placeholder="https://..." />
                            </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">提取码 (选填)</label>
                                    <input className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none font-mono" value={newResource.accessCode} onChange={e => setNewResource({...newResource, accessCode: e.target.value})} placeholder="xxxx" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">文件大小</label>
                                    <input className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.size} onChange={e => setNewResource({...newResource, size: e.target.value})} placeholder="例如: 1.5 GB" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">类型</label>
                                    <select className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})}>
                                        <option value="audio">音频 (Audio)</option>
                                        <option value="video">视频 (Video)</option>
                                        <option value="project">工程文件 (Project)</option>
                                        <option value="other">其他 (Other)</option>
                                    </select>
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">描述说明</label>
                                <textarea rows={2} className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-blue-400 outline-none" value={newResource.description} onChange={e => setNewResource({...newResource, description: e.target.value})} placeholder="资源简介..." />
                            </div>

                             <button onClick={addResource} className="bg-blue-500/20 text-blue-400 border border-blue-500/50 font-bold py-3 rounded-lg hover:bg-blue-500 hover:text-midnight transition-all flex justify-center items-center gap-2 mt-2">
                                <Save size={18} /> 保存资源
                            </button>
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        {(data.resources || []).length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-slate-500 flex flex-col items-center gap-2">
                                <FolderOpen size={32} />
                                <p>暂无资源链接</p>
                            </div>
                        ) : (
                            data.resources.map(res => (
                                <div key={res.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-blue-400/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${res.provider === 'aliyun' ? 'bg-orange-500/20 text-orange-500' : res.provider === 'baidu' ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-slate-400'}`}>
                                            {res.provider === 'aliyun' ? 'Ali' : res.provider === 'baidu' ? 'Pan' : 'HD'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{res.title}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-3">
                                                <span>{res.size}</span>
                                                {res.accessCode && <span className="text-blue-400">Code: {res.accessCode}</span>}
                                                <a href={res.link} target="_blank" className="hover:text-white flex items-center gap-1"><Link size={10}/> Link</a>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteResource(res.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}

            {/* Music Tab */}
            {activeTab === 'music' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-electric-cyan font-mono text-sm uppercase tracking-widest">单曲列表</h3>
                        <button onClick={() => setIsAddingTrack(!isAddingTrack)} className="bg-electric-cyan text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2">
                           <Plus size={16} /> 添加单曲
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
                                    <button onClick={() => setNewTrack({...newTrack, sourceType: 'native'})} className={`px-3 py-1 rounded text-xs font-bold ${newTrack.sourceType === 'native' ? 'bg-electric-cyan text-black' : 'bg-white/10 text-slate-400'}`}>文件直链/R2</button>
                                    <button onClick={() => setNewTrack({...newTrack, sourceType: 'netease'})} className={`px-3 py-1 rounded text-xs font-bold ${newTrack.sourceType === 'netease' ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400'}`}>网易云音乐 ID</button>
                                </div>
                                {newTrack.sourceType === 'native' ? (
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <input className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-electric-cyan outline-none text-xs font-mono" value={newTrack.audioUrl} onChange={e => setNewTrack({...newTrack, audioUrl: e.target.value})} placeholder="输入 URL 或 R2 上传..." />
                                        <button onClick={() => { setPickerTarget('track'); setPickerMode('music'); setPickerProvider('cf'); setShowCloudPicker(true); }} className="bg-electric-cyan/10 text-electric-cyan px-4 py-2 md:py-0 rounded-lg border border-electric-cyan/20 flex items-center justify-center gap-2 text-xs font-bold"><Cloud size={16} /> R2 上传</button>
                                        <input type="file" accept="audio/*" className="hidden" ref={audioInputRef} onChange={(e) => handleGenericUpload(e, 'track')} />
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-red-500 outline-none text-xs font-mono" value={newTrack.externalId} onChange={e => setNewTrack({...newTrack, externalId: e.target.value})} placeholder="输入网易云音乐歌曲ID" />
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
                                        <div className="text-xs text-slate-500">{track.sourceType === 'netease' ? 'ID: ' + track.externalId : 'File'}</div>
                                    </div>
                                </div>
                                <button onClick={() => deleteTrack(track.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

             {/* Articles Tab */}
             {activeTab === 'articles' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                     <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-lime-punch font-mono text-sm uppercase tracking-widest">文章动态</h3>
                        <button onClick={() => setIsAddingArticle(!isAddingArticle)} className="bg-lime-punch text-midnight px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-all flex items-center gap-2"><Plus size={16} /> 添加</button>
                    </div>
                     {isAddingArticle && (
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 grid gap-4">
                             <input placeholder="标题" className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                             <textarea rows={2} placeholder="摘要" className="w-full bg-black/50 p-3 rounded-lg border border-white/10 text-white" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
                             <div className="flex gap-2"><button onClick={() => { setPickerTarget('article'); setPickerMode('image'); setPickerProvider('local'); setShowCloudPicker(true); }} className="bg-white/5 p-2 rounded text-xs text-slate-300">选择图片</button></div>
                            <button onClick={addArticle} className="bg-lime-punch/20 text-lime-punch border border-lime-punch/50 font-bold py-2 rounded-lg">发布</button>
                        </div>
                    )}
                    <div className="space-y-3">
                         {data.articles.map(article => (
                                <div key={article.id} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="font-bold text-white">{article.title}</div>
                                    <button onClick={() => deleteArticle(article.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                </div>
                            ))}
                    </div>
                </motion.div>
            )}

             {/* Artists Tab */}
             {activeTab === 'artists' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5"><h3 className="text-purple-500 font-mono text-sm uppercase tracking-widest">艺术家管理</h3><button onClick={() => setIsAddingArtist(!isAddingArtist)} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-purple-400"><Plus size={16} /></button></div>
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

            {/* Cloud Tab */}
             {activeTab === 'cloud' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-4xl mx-auto pb-20">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                        <Cloud size={18} className="text-orange-500"/>
                        <h3 className="text-orange-500 font-mono text-sm uppercase tracking-widest">云端服务配置 (Cloud Services)</h3>
                    </div>
                    
                    {/* Sync */}
                    <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><RefreshCw size={20}/> 全站数据同步</h4>
                             <div className="space-y-4 max-w-md mt-4">
                                <div className="space-y-2"><input type="password" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono" placeholder="Sync Secret Key" value={kvSyncSecret} onChange={(e) => setKvSyncSecret(e.target.value)} /></div>
                                <button onClick={handleSyncPush} disabled={syncStatus === 'syncing'} className="px-6 py-3 rounded-xl font-bold text-sm bg-orange-500 text-white">{syncStatus === 'syncing' ? '正在同步...' : '推送到云端'}</button>
                                <div className="text-xs text-slate-400">{syncMessage}</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Cloudflare R2 Config */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center justify-between">
                            <div><h4 className="text-white font-bold flex items-center gap-2"><Database size={16} /> Cloudflare R2</h4><p className="text-xs text-slate-500">推荐使用，免费且支持 S3 协议 (用于音频直传)</p></div>
                            <button onClick={() => handleCloudToggle('cf')} className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${data.integrations?.cloudflare?.enabled ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/10 text-white hover:bg-yellow-500'}`}>{data.integrations?.cloudflare?.enabled ? '已连接' : '配置'}</button>
                        </div>
                            <AnimatePresence>
                            {editingCloud === 'cf' && !data.integrations?.cloudflare?.enabled && (
                                <CloudConfigForm label="Cloudflare R2" color="text-yellow-500" config={data.integrations?.cloudflare!} onSave={(config) => handleSaveCloudConfig('cf', config)} onCancel={() => setEditingCloud(null)} type="s3" />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Aliyun Config (Restored) */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center justify-between">
                            <div><h4 className="text-white font-bold flex items-center gap-2"><CloudLightning size={16} /> 阿里云 OSS</h4><p className="text-xs text-slate-500">适用于国内访问加速 (S3 兼容模式)</p></div>
                            <button onClick={() => handleCloudToggle('ali')} className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${data.integrations?.aliDrive?.enabled ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/10 text-white hover:bg-orange-500'}`}>{data.integrations?.aliDrive?.enabled ? '已连接' : '配置'}</button>
                        </div>
                            <AnimatePresence>
                            {editingCloud === 'ali' && !data.integrations?.aliDrive?.enabled && (
                                <CloudConfigForm label="阿里云 OSS" color="text-orange-500" config={data.integrations?.aliDrive!} onSave={(config) => handleSaveCloudConfig('ali', config)} onCancel={() => setEditingCloud(null)} type="s3" />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* OneDrive Config (Restored) */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center justify-between">
                            <div><h4 className="text-white font-bold flex items-center gap-2"><CloudRain size={16} /> OneDrive</h4><p className="text-xs text-slate-500">仅存储 Client ID (用于外部链接生成)</p></div>
                            <button onClick={() => handleCloudToggle('one')} className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${data.integrations?.oneDrive?.enabled ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/10 text-white hover:bg-blue-500'}`}>{data.integrations?.oneDrive?.enabled ? '已连接' : '配置'}</button>
                        </div>
                            <AnimatePresence>
                            {editingCloud === 'one' && !data.integrations?.oneDrive?.enabled && (
                                <CloudConfigForm label="OneDrive" color="text-blue-500" config={data.integrations?.oneDrive!} onSave={(config) => handleSaveCloudConfig('one', config)} onCancel={() => setEditingCloud(null)} type="oauth" />
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

      {/* Cloud Picker Modal */}
      {showCloudPicker && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl h-[600px] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
                 <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
                      <h3 className="font-bold text-white flex items-center gap-2"><Cloud size={18} className="text-electric-cyan" /> 选择文件 (R2)</h3>
                      <button onClick={() => setShowCloudPicker(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
                 </div>
                 <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                      <div className="w-full md:w-48 bg-black/20 border-r border-white/10 p-2 flex flex-row md:flex-col gap-1">
                          <button onClick={() => setPickerProvider('local')} className={`p-3 rounded-lg text-sm font-bold text-left ${pickerProvider === 'local' ? 'bg-white/10' : 'text-slate-400'}`}>本地</button>
                          <button onClick={() => setPickerProvider('cf')} className={`p-3 rounded-lg text-sm font-bold text-left ${pickerProvider === 'cf' ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-400'}`}>R2 Storage</button>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto bg-black/40 custom-scrollbar">
                            <input type="file" ref={cloudUploadInputRef} onChange={handleCloudUpload} className="hidden" accept={pickerMode === 'image' ? "image/*" : "audio/*"} />
                            {pickerProvider === 'local' ? (
                                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/10 rounded-xl bg-white/5 cursor-pointer" onClick={() => {
                                    if (pickerTarget === 'hero') heroImageInputRef.current?.click();
                                    else if (pickerTarget === 'album') albumImageInputRef.current?.click();
                                    else if (pickerTarget === 'track') audioInputRef.current?.click();
                                    else if (pickerTarget === 'article') articleImageInputRef.current?.click();
                                    setShowCloudPicker(false); 
                                }}><Upload size={40} className="text-slate-500 mb-4" /><p className="text-slate-400 text-sm">点击选择本地文件 (临时预览)</p></div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                        <span className="text-xs text-slate-400 font-mono">R2 Bucket</span>
                                         <button onClick={() => cloudUploadInputRef.current?.click()} disabled={uploadStatus.active} className="bg-white text-midnight px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-slate-200 disabled:opacity-50"><ArrowUp size={14} /> 上传到 R2</button>
                                    </div>
                                    <UploadProgressWidget active={uploadStatus.active} progress={uploadStatus.progress} speed={uploadStatus.speed} remaining={uploadStatus.remaining} message={uploadStatus.message} />
                                    <div className="space-y-2">
                                        {cloudFiles.map((file, i) => (
                                            <div key={i} onClick={() => handleCloudFileSelect(file)} className="group flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 cursor-pointer hover:bg-electric-cyan/10">
                                                <div className="flex items-center gap-3">
                                                    {file.type === 'audio' ? <Music size={18} className="text-slate-500" /> : <ImageIcon size={18} className="text-slate-500" />}
                                                    <div className="text-sm font-bold text-slate-200">{file.name}</div>
                                                </div>
                                                <CheckCircle2 size={18} className="opacity-0 group-hover:opacity-100 text-electric-cyan" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                      </div>
                 </div>
            </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;
