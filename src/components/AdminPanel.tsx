
import React, { useState, useRef, useEffect } from 'react';
import type { Track, SiteData, Article, Artist, FeaturedAlbum, CloudConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Activity, Layout, Music, FileText, Mic2, Upload, Cloud, CheckCircle2, AlertCircle, HardDrive, Database, Image as ImageIcon, Menu, Type, Mail, Key, RefreshCw, Save, Disc, Album, Phone, MapPin, FileEdit, ToggleLeft, ToggleRight, CloudLightning, CloudRain, Eye, EyeOff, FolderOpen, ArrowUp, ExternalLink, HelpCircle, QrCode, LogIn, Copy, Wifi, WifiOff, Link } from 'lucide-react';

interface AdminPanelProps {
  data: SiteData;
  updateData: (newData: SiteData | ((prev: SiteData) => SiteData)) => void;
  onClose: () => void;
}

type Tab = 'general' | 'music' | 'articles' | 'artists' | 'cloud' | 'contact';
type CloudProvider = 'ali' | 'one' | 'cf' | null;

// --- AWS Signature V4 Helper for R2/OSS Uploads (Browser Native) ---
const uploadToS3 = async (file: File, config: CloudConfig, onProgress: (percent: number) => void): Promise<string> => {
    if (!config.accessKey || !config.secretKey || !config.bucket || !config.endpoint || !config.publicDomain) {
        throw new Error("配置不完整: 缺少 AccessKey, SecretKey, Bucket, Endpoint 或 Public Domain");
    }

    const method = 'PUT';
    const service = 's3';
    const region = 'auto'; // R2 default, OSS needs specific region but 'auto' often works for sig calculation if endpoint is full
    // Clean endpoint
    const endpointUrl = config.endpoint.startsWith('http') ? config.endpoint : `https://${config.endpoint}`;
    // R2 often uses path style: https://<account>.r2.cloudflarestorage.com/<bucket>/<key>
    // But easier is custom domain or S3 style. Let's assume standard virtual-hosted or path style.
    // For R2: https://<accountid>.r2.cloudflarestorage.com/<bucketname>/<filename>
    const host = new URL(endpointUrl).host;
    const path = `/${config.bucket}/${file.name}`;
    const url = `${endpointUrl}${path}`;
    
    const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = datetime.substr(0, 8);
    
    // 1. Payload SHA256
    const arrayBuffer = await file.arrayBuffer();
    const payloadHashBuf = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const payloadHash = Array.from(new Uint8Array(payloadHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 2. Canonical Request
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${datetime}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    // 3. String to Sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    const canonicalRequestHashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
    const canonicalRequestHash = Array.from(new Uint8Array(canonicalRequestHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const stringToSign = `${algorithm}\n${datetime}\n${credentialScope}\n${canonicalRequestHash}`;

    // 4. Sign Key
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

    // 5. Authorization Header
    const authorizationHeader = `${algorithm} Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // 6. Perform Upload
    // Simulate progress since fetch doesn't support it natively easily without XHR
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
        
        // Construct Public URL
        // Remove trailing slash from domain
        const publicDomain = config.publicDomain.replace(/\/$/, '');
        // Encode filename for URL
        const encodedFilename = encodeURIComponent(file.name);
        return `${publicDomain}/${encodedFilename}`;

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
    type = 's3',
    authLink
}: { 
    config: CloudConfig, 
    onSave: (newConfig: CloudConfig) => void, 
    onCancel: () => void,
    label: string,
    color: string,
    type?: 's3' | 'oauth',
    authLink?: string
}) => {
    const [localConfig, setLocalConfig] = useState<CloudConfig>(config);
    const [showSecret, setShowSecret] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    const handleTestConnection = () => {
        setTestStatus('testing');
        
        // For S3, we can try to check if we can sign a request, but without CORS configured on bucket, OPTIONS might fail.
        // We'll simulate a basic validation check.
        setTimeout(() => {
            if (type === 's3') {
                // Basic validation
                if (localConfig.accessKey && localConfig.secretKey && localConfig.bucket && localConfig.endpoint) {
                     setTestStatus('success');
                } else {
                     setTestStatus('error');
                }
            } else {
                // Basic validation for OAuth
                if (localConfig.refreshToken) {
                    setTestStatus('success');
                } else {
                    setTestStatus('error');
                }
            }
        }, 1500);
    };

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
            
            {/* Form for S3 Compatible Services (Cloudflare R2) */}
            {type === 's3' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            Public Domain (公开访问域名) <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-electric-cyan text-xs focus:border-electric-cyan outline-none"
                            value={localConfig.publicDomain || ''}
                            onChange={(e) => setLocalConfig({...localConfig, publicDomain: e.target.value})}
                            placeholder="https://pub-xxx.r2.dev (用于生成永久链接)"
                        />
                        <p className="text-[10px] text-slate-500">文件上传后链接为: <code>{localConfig.publicDomain || 'https://...'}/filename.mp3</code>。请确保 R2 后台已绑定此域名并开启公开访问。</p>
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Endpoint (S3 API URL)</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.endpoint || ''}
                            onChange={(e) => setLocalConfig({...localConfig, endpoint: e.target.value})}
                            placeholder="https://<account_id>.r2.cloudflarestorage.com"
                        />
                         <p className="text-[10px] text-slate-500">R2 格式: <code>https://&lt;account_id&gt;.r2.cloudflarestorage.com</code></p>
                    </div>
                </div>
            )}

            {/* Form for OAuth Services (OneDrive / Aliyun Drive Personal) */}
            {type === 'oauth' && (
                <div className="space-y-4">
                     {/* Quick Auth Guide Box */}
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col gap-3">
                        <div className="flex items-start gap-2">
                            <div className="p-1.5 bg-electric-cyan/10 rounded-full text-electric-cyan mt-0.5">
                                <LogIn size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">关于个人网盘上传 (Important)</h4>
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                    由于浏览器的安全策略(CORS)，纯静态网页无法直接上传文件到个人网盘(OneDrive/阿里云盘)。
                                    <br/><span className="text-white">解决方案：</span>请手动上传文件到网盘，生成分享直链，然后将链接填入“音频URL”框中。
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-1 pt-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">授权 Token (可选 - 仅用于 API 读取)</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-white outline-none"
                            value={localConfig.refreshToken || ''}
                            onChange={(e) => setLocalConfig({...localConfig, refreshToken: e.target.value})}
                            placeholder="Refresh Token..."
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-4 border-t border-white/5 items-center">
                {/* Test Connection Button */}
                <button 
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border
                    ${testStatus === 'success' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 
                      testStatus === 'error' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 
                      'border-white/10 text-slate-300 hover:bg-white/5'}`}
                >
                    {testStatus === 'testing' ? <RefreshCw size={14} className="animate-spin"/> : 
                     testStatus === 'success' ? <CheckCircle2 size={14}/> : 
                     testStatus === 'error' ? <AlertCircle size={14}/> : <Wifi size={14}/>}
                    {testStatus === 'testing' ? '检测中...' : 
                     testStatus === 'success' ? '配置格式正确' : 
                     testStatus === 'error' ? '信息不完整' : '检查配置格式'}
                </button>

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

  // --- State for Uploads & Cloud ---
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'music' | 'image'>('music'); 
  const [pickerTarget, setPickerTarget] = useState<'article' | 'track' | 'hero' | 'album'>('track');
  const [pickerProvider, setPickerProvider] = useState<'ali' | 'one' | 'cf' | 'local'>('local');
  const cloudUploadInputRef = useRef<HTMLInputElement>(null);
  
  // KV Sync Secret (Separate from File Storage Keys)
  const [kvSyncSecret, setKvSyncSecret] = useState(() => {
      return localStorage.getItem('ves_sync_secret') || '';
  });
  
  // Which Cloud Config Form is Open
  const [editingCloud, setEditingCloud] = useState<CloudProvider>(null);

  // Cloud Files State (Simulated list + Uploaded list)
  const [cloudFiles, setCloudFiles] = useState<{name: string, size: string, url: string, provider: 'ali' | 'one' | 'cf', type: 'audio' | 'image', isNew?: boolean}[]>([
      { name: 'VES_Demo_v1.mp3', size: '8.4 MB', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', provider: 'ali', type: 'audio' },
      { name: 'Cover_Art_Final.jpg', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop', provider: 'ali', type: 'image' },
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
      if (!kvSyncSecret) {
          setSyncMessage("错误：请输入同步密钥 (Secret Key)");
          setSyncStatus('error');
          return;
      }
      
      // Save secret to local storage
      localStorage.setItem('ves_sync_secret', kvSyncSecret);

      setSyncStatus('syncing');
      try {
          // Send PUT request to save data to KV
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
              setSyncMessage('成功：数据已同步到云端！所有访客刷新后可见。');
          } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // --- Cloud Config Handlers ---
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
      
      // If we are just selecting, we use the url directly
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
               // Article Audio logic (if needed later)
          }
      }
  };

  // --- REAL Upload Logic ---
  const handleCloudUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check which provider is active in the picker
      let config: CloudConfig | undefined;
      // Currently, Cloudflare R2 is the most viable for direct browser upload via S3 API
      if (pickerProvider === 'cf') config = data.integrations.cloudflare;
      
      // If using Aliyun, we treat it as OAuth/Link mode usually, BUT if user configured S3 keys for OSS, we can use that.
      // However, user specifically asked for "Aliyun Drive Personal" which is OAuth. 
      // We cannot direct upload to Personal Drive via Browser CORS easily without a proxy.
      // So we restrict "Real Upload" to R2 (CF) mainly.
      
      if (pickerProvider === 'cf' && config?.enabled) {
          // Start Real Upload
          setUploadStatus({ active: true, progress: 0, speed: 'Calculating...', remaining: '...', message: '正在连接 R2...' });
          
          try {
              const publicUrl = await uploadToS3(file, config, (percent) => {
                  setUploadStatus(prev => ({
                      ...prev,
                      progress: percent,
                      speed: 'Uploading',
                      remaining: percent < 100 ? '...' : 'Finishing',
                      message: percent < 100 ? '上传中 (Uploading)...' : '处理中 (Processing)...'
                  }));
              });
              
              // Success
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
              
              // Auto-select? Maybe just let user click it.
              // alert("上传成功！");

          } catch (err: any) {
              console.error(err);
              setUploadStatus(prev => ({ ...prev, message: '上传失败: ' + err.message }));
              setTimeout(() => setUploadStatus({ active: false, progress: 0, speed: '', remaining: '' }), 3000);
          }
      } else {
          // Fallback / Simulation for other providers where direct upload isn't implemented
          alert("当前仅支持 Cloudflare R2 进行网页直传。\n\n对于 OneDrive 或 阿里云盘，请使用客户端上传后，粘贴分享直链。");
      }
  };

  // Local blob upload (Simulation) - kept for local preview
  const handleGenericUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'album' | 'track' | 'article') => {
      const file = e.target.files?.[0];
      if (file) {
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
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-hot-pink to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-hot-pink/20 animate-pulse">
                <Activity size={20} />
            </div>
            <div>
                <SonicText text="后台管理" />
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
        {/* Sidebar - Scrollable on Mobile */}
        <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-2 md:p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-hidden custom-scrollbar no-scrollbar">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#0a0f1d] relative custom-scrollbar">
            {/* General Tab */}
            {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                            <Type size={18} className="text-hot-pink"/>
                            <h3 className="text-hot-pink font-mono text-sm uppercase tracking-widest">首页视觉设置 (Home Visuals)</h3>
                        </div>

                        {/* Hero Image Picker */}
                        <div className="mb-8 p-4 bg-black/30 rounded-xl border border-white/5">
                             <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block">主视觉海报 / 背景图</label>
                             <div className="flex gap-4 md:gap-6 items-center flex-col md:flex-row">
                                 <div className="w-full md:w-24 h-32 bg-black rounded-lg overflow-hidden border border-white/20 shadow-lg relative group">
                                     <img src={data.hero.heroImage} className="w-full h-full object-cover" alt="Hero"/>
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white">预览</div>
                                 </div>
                                 <div className="flex-1 w-full">
                                     <UploadProgressWidget active={uploadStatus.active} progress={uploadStatus.progress} speed={uploadStatus.speed} remaining={uploadStatus.remaining} message={uploadStatus.message} />
                                     {!uploadStatus.active && (
                                         <div className="flex gap-3">
                                             <button 
                                                 onClick={() => { setPickerTarget('hero'); setPickerMode('image'); setPickerProvider('local'); setShowCloudPicker(true); }}
                                                 className="flex-1 md:flex-none px-4 py-2 bg-hot-pink hover:bg-white hover:text-midnight text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
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
                </motion.div>
            )}

            {/* Music Tab */}
            {activeTab === 'music' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
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
                                        onClick={() => { setPickerTarget('album'); setPickerMode('image'); setPickerProvider('local'); setShowCloudPicker(true); }}
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
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <input className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-electric-cyan outline-none text-xs font-mono" value={newTrack.audioUrl} onChange={e => setNewTrack({...newTrack, audioUrl: e.target.value})} placeholder="输入音频URL (mp3/wav) 或使用 R2 上传..." />
                                        <button onClick={() => { setPickerTarget('track'); setPickerMode('music'); setPickerProvider('cf'); setShowCloudPicker(true); }} className="bg-electric-cyan/10 text-electric-cyan px-4 py-2 md:py-0 rounded-lg border border-electric-cyan/20 flex items-center justify-center gap-2 text-xs font-bold"><Cloud size={16} /> 云端上传(R2)</button>
                                        <input type="file" accept="audio/*" className="hidden" ref={audioInputRef} onChange={(e) => handleGenericUpload(e, 'track')} />
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-white focus:border-red-500 outline-none text-xs font-mono" value={newTrack.externalId} onChange={e => setNewTrack({...newTrack, externalId: e.target.value})} placeholder="输入网易云音乐歌曲ID (例如: 123456)" />
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

            {/* Articles Tab */}
             {activeTab === 'articles' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
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
                                        onClick={() => { setPickerTarget('article'); setPickerMode('image'); setPickerProvider('local'); setShowCloudPicker(true); }}
                                        className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-lime-punch transition-all text-xs font-bold flex items-center justify-center gap-2"
                                     >
                                         <ImageIcon size={16}/> {newArticle.coverUrl ? '更换图片' : '上传/选择图片'}
                                     </button>
                                     <input type="file" accept="image/*" className="hidden" ref={articleImageInputRef} onChange={(e) => handleGenericUpload(e, 'article')} />
                                 </div>
                             </div>
                             {/* BGM Selector */}
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
            
            {/* Artists Tab */}
            {activeTab === 'artists' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto pb-20">
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
            
            {/* Contact Tab */}
            {activeTab === 'contact' && (
                 <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-4xl mx-auto pb-20">
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

             {/* --- CLOUD INTEGRATIONS TAB --- */}
             {activeTab === 'cloud' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-4xl mx-auto pb-20">
                    
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                        <Cloud size={18} className="text-orange-500"/>
                        <h3 className="text-orange-500 font-mono text-sm uppercase tracking-widest">云端服务集成 (Cloud Services)</h3>
                    </div>

                    {/* Section 1: System Sync (KV) */}
                    <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 text-orange-500/10"><Database size={100}/></div>
                        
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <RefreshCw size={20} className="text-orange-500"/> 全站数据同步 (System Sync)
                            </h4>
                            <p className="text-sm text-slate-300 mb-6 max-w-lg leading-relaxed">
                                将此后台的配置数据（歌单、文章、设置）同步到 Cloudflare KV。
                                请确保已在 Pages 后台设置环境变量 <code>SYNC_SECRET</code>。
                            </p>

                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Key size={10} /> Sync Secret Key
                                    </label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none font-mono tracking-widest"
                                        placeholder="输入同步密钥..."
                                        value={kvSyncSecret}
                                        onChange={(e) => setKvSyncSecret(e.target.value)}
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

                    {/* Section 2: File Object Storage */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <HardDrive size={20} className="text-blue-400"/> 文件对象存储 (File Storage)
                        </h4>
                        <p className="text-sm text-slate-400 mb-6">
                            配置第三方存储服务以支持大文件（音频/图片）上传。
                        </p>

                        <div className="grid gap-4">
                            {/* Cloudflare Toggle */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-yellow-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.integrations.cloudflare?.enabled ? 'bg-yellow-500 text-midnight' : 'bg-white/10 text-slate-500'}`}>
                                            <Database size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold flex items-center gap-2">
                                                Cloudflare R2 (推荐)
                                                {data.integrations.cloudflare?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">已连接</span>}
                                            </h4>
                                            <p className="text-xs text-slate-500">兼容 S3 协议，支持浏览器直接上传。</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleCloudToggle('cf')}
                                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all
                                        ${data.integrations.cloudflare?.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-white/10 text-white hover:bg-yellow-500'}`}
                                    >
                                        {data.integrations.cloudflare?.enabled ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                                        {data.integrations.cloudflare?.enabled ? '断开连接' : '配置密钥'}
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
                                            type="s3"
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Aliyun Drive Personal Toggle */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.integrations.aliDrive?.enabled ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                            <CloudLightning size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold flex items-center gap-2">
                                                阿里云盘 (个人版)
                                                {data.integrations.aliDrive?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Token 配置</span>}
                                            </h4>
                                            <p className="text-xs text-slate-500">仅用于读取，不支持浏览器直传。</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleCloudToggle('ali')}
                                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all
                                        ${data.integrations.aliDrive?.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-white/10 text-white hover:bg-orange-500'}`}
                                    >
                                        {data.integrations.aliDrive?.enabled ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                                        {data.integrations.aliDrive?.enabled ? '断开连接' : '配置直链'}
                                    </button>
                                </div>
                                
                                <AnimatePresence>
                                    {editingCloud === 'ali' && !data.integrations.aliDrive?.enabled && (
                                        <CloudConfigForm 
                                            label="阿里云盘 (个人版)" 
                                            color="text-orange-500"
                                            config={data.integrations.aliDrive}
                                            onSave={(config) => handleSaveCloudConfig('ali', config)}
                                            onCancel={() => setEditingCloud(null)}
                                            type="oauth"
                                            authLink="https://alist.nn.ci/tool/aliyundrive/request.html"
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
                                                {data.integrations.oneDrive?.enabled && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Token 配置</span>}
                                            </h4>
                                            <p className="text-xs text-slate-500">仅用于读取，不支持浏览器直传。</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleCloudToggle('one')}
                                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all
                                        ${data.integrations.oneDrive?.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-white/10 text-white hover:bg-blue-500'}`}
                                    >
                                        {data.integrations.oneDrive?.enabled ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                                        {data.integrations.oneDrive?.enabled ? '断开连接' : '配置直链'}
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
                                            type="oauth"
                                            authLink="https://alist.nn.ci/tool/onedrive/request.html"
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
      </div>
      
      {/* Cloud Picker Modal */}
      {showCloudPicker && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl h-[600px] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
                 {/* ... Picker Header ... */}
                 <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <Cloud size={18} className="text-electric-cyan" /> 选择文件
                      </h3>
                      <button onClick={() => setShowCloudPicker(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
                 </div>

                 <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                      {/* Sidebar */}
                      <div className="w-full md:w-48 bg-black/20 border-b md:border-b-0 md:border-r border-white/10 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible shrink-0">
                           <button onClick={() => setPickerProvider('local')} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left shrink-0 ${pickerProvider === 'local' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}><HardDrive size={16} /> 本地</button>
                          <button onClick={() => setPickerProvider('cf')} disabled={!data.integrations.cloudflare?.enabled} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left shrink-0 ${pickerProvider === 'cf' ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-400 hover:text-white disabled:opacity-30 cursor-not-allowed'}`}><Database size={16} /> Cloudflare R2</button>
                          <button onClick={() => setPickerProvider('ali')} disabled={!data.integrations.aliDrive?.enabled} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left shrink-0 ${pickerProvider === 'ali' ? 'bg-orange-500/20 text-orange-500' : 'text-slate-400 hover:text-white disabled:opacity-30 cursor-not-allowed'}`}><CloudLightning size={16} /> 阿里云盘</button>
                          <button onClick={() => setPickerProvider('one')} disabled={!data.integrations.oneDrive?.enabled} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-bold text-left shrink-0 ${pickerProvider === 'one' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white disabled:opacity-30 cursor-not-allowed'}`}><CloudRain size={16} /> OneDrive</button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 overflow-y-auto bg-black/40 custom-scrollbar">
                            <input type="file" ref={cloudUploadInputRef} onChange={handleCloudUpload} className="hidden" accept={pickerMode === 'image' ? "image/*" : "audio/*"} />
                            
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
                                    <p className="text-slate-400 text-sm font-bold">点击选择本地文件 (模拟)</p>
                                    <p className="text-[10px] text-slate-600 mt-2">注意：本地文件刷新后会失效</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Upload Toolbar */}
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                            <FolderOpen size={14} />
                                            <span>
                                                {pickerProvider === 'cf' ? 'R2 Bucket' : 'Cloud Storage'}
                                            </span>
                                        </div>
                                        {/* Only allow upload for CF R2 in this demo */}
                                        {pickerProvider === 'cf' ? (
                                             <button 
                                                onClick={() => cloudUploadInputRef.current?.click()}
                                                disabled={uploadStatus.active}
                                                className="bg-white text-midnight px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-slate-200 disabled:opacity-50"
                                            >
                                                <ArrowUp size={14} /> 上传到 R2
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-500">仅支持 R2 直传</span>
                                        )}
                                    </div>

                                    {/* Upload Progress inside Picker */}
                                    <UploadProgressWidget active={uploadStatus.active} progress={uploadStatus.progress} speed={uploadStatus.speed} remaining={uploadStatus.remaining} message={uploadStatus.message} />

                                    {/* File List */}
                                    <div className="space-y-2">
                                        {cloudFiles.filter(f => f.provider === pickerProvider && f.type === (pickerMode === 'music' ? 'audio' : 'image')).length > 0 ? (
                                            cloudFiles.filter(f => f.provider === pickerProvider && f.type === (pickerMode === 'music' ? 'audio' : 'image')).map((file, i) => (
                                                <div key={i} onClick={() => handleCloudFileSelect(file)} className="group flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:border-electric-cyan/50 hover:bg-electric-cyan/10 cursor-pointer transition-all relative overflow-hidden">
                                                    <div className="flex items-center gap-3 relative z-10 overflow-hidden">
                                                        {file.type === 'audio' ? <Music size={18} className="text-slate-500 shrink-0" /> : <ImageIcon size={18} className="text-slate-500 shrink-0" />}
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-slate-200 group-hover:text-white flex items-center gap-2 truncate">
                                                                <span className="truncate">{file.name}</span>
                                                                {file.isNew && <span className="text-[8px] bg-lime-punch text-midnight px-1.5 py-0.5 rounded font-bold uppercase shrink-0">New</span>}
                                                            </div>
                                                            <div className="text-xs text-slate-500">{file.size}</div>
                                                        </div>
                                                    </div>
                                                    <CheckCircle2 size={18} className="opacity-0 group-hover:opacity-100 text-electric-cyan relative z-10 shrink-0" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
                                                <AlertCircle size={24} />
                                                <span>文件夹为空</span>
                                            </div>
                                        )}
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
