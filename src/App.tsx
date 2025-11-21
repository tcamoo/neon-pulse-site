
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MusicSection from './components/MusicSection';
import ArticleSection from './components/TourSection'; // Reusing file but repurposed
import ContactSection from './components/ContactSection';
import DownloadSection from './components/DownloadSection';
import Footer from './components/Footer';
import Visualizer from './components/Visualizer';
import AdminPanel from './components/AdminPanel';
import Loader from './components/Loader';
import TrackDetailModal from './components/TrackDetailModal';
import GlobalPlayer from './components/GlobalPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import type { SiteData, Track } from './types';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

// Initial Data Configuration
// Now attempts to read from Cloudflare/Vite Environment Variable VITE_ADMIN_PASSWORD
const INITIAL_DATA: SiteData = {
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'admin', // Default is 'admin' if env var is not set
  navigation: [
    { id: 'nav_1', label: '音乐作品', targetId: 'music' },
    { id: 'nav_2', label: '动态现场', targetId: 'live' },
    { id: 'nav_3', label: '资源下载', targetId: 'downloads' },
    { id: 'nav_4', label: '联系合作', targetId: 'contact' },
  ],
  hero: {
    titleLine1: 'SONIC',
    titleLine2: 'UNIVERSE',
    subtitle: '跨越数字与现实的边界，探索频率的无限可能。VES 的音乐不仅仅是听觉的享受，更是一场视觉与感官的盛宴。',
    marqueeText: 'VES World Tour 2025 • New Album "Neon Dreams" Out Now • Live at Tokyo Dome',
    buttonText: '最新单曲',
    heroImage: 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?q=80&w=2070&auto=format&fit=crop'
  },
  featuredAlbum: {
    title: "NEON DREAMS",
    type: "LP • 2025",
    description: "A sonic journey through the digital wasteland. Featuring the hit single 'Midnight City'.",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"
  },
  tracks: [
    { 
        id: '1', 
        title: 'Midnight City', 
        artist: 'VES', 
        album: 'Noise & Silence', 
        duration: '3:45', 
        plays: 124000, 
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop',
        audioUrl: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3',
        lyrics: "Walking down the street at midnight\nNeon lights reflecting in your eyes\nThe city sleeps but we are alive\nChasing shadows under purple skies\n\n(Chorus)\nOh, midnight city, take me away\nLost in the rhythm, we'll sway\nMidnight city, don't let go\nFeel the energy, let it flow\n\nConcrete jungle, electric dreams\nNothing is ever as it seems\nWe're running wild, we're running free\nJust you and the night and me"
    },
    { 
        id: '2', 
        title: 'Neon Tears', 
        artist: 'VES', 
        album: 'Noise & Silence', 
        duration: '4:12', 
        plays: 89000, 
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
        audioUrl: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Elipses.mp3',
        lyrics: "Tears falling down like acid rain\nColors blending in the drain\nCybernetic heart, feeling pain\nDisconnecting from the main\n\n(Chorus)\nNeon tears, crying in the dark\nLeft a glowing, burning mark\nNeon tears, digital soul\nLosing control, losing control\n\nSystem failure, crashing down\nSilence is the only sound\nReboot the feeling, start again\nErase the memory, ease the pain"
    },
    { 
        id: '3', 
        title: 'Void Walker', 
        artist: 'VES', 
        album: 'Single', 
        duration: '2:58', 
        plays: 210000, 
        coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
        audioUrl: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3',
        lyrics: "Stepping into the unknown\nGravity feels like a stone\nDrifting through the cosmic sea\nThe void is calling out to me\n\n(Chorus)\nVoid walker, space and time\nLeaving the world behind\nVoid walker, stars align\nInfinite universe is mine\n\nBlack holes and shooting stars\nWe've traveled so very far\nNo looking back, no return\nWatching the galaxies burn"
    },
  ],
  articles: [
    { 
      id: '1', 
      title: '模拟合成器的复兴：探索声音的本质', 
      category: '#GEAR_TALK', 
      date: '2025.02.14', 
      excerpt: '在数字音频工作站统治的时代，为什么我们依然迷恋那些充满了不确定性的电压控制振荡器？本文将带你走进 VES 的工作室。',
      coverUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=2070&auto=format&fit=crop',
      linkedTrackId: '1'
    },
    { 
      id: '2', 
      title: '东京巡演日记：霓虹灯下的赛博梦境', 
      category: '#TOUR_LIFE', 
      date: '2025.01.20', 
      excerpt: '涉谷的雨夜，Livehouse 里沸腾的人群，以及那些在后台发生的未曾公开的故事。另外，宣布下一站：首尔。',
      coverUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
      linkedTrackId: '2'
    },
    { 
      id: '3', 
      title: '新专辑《Neon Dreams》概念解析', 
      category: '#NEW_RELEASE', 
      date: '2024.12.25', 
      excerpt: '这不仅仅是一张专辑，这是一个关于逃离现实、构建内心乌托邦的音频实验。',
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop',
      linkedTrackId: '3' 
    }
  ],
  artists: [
    { id: '1', name: 'VES', role: 'Main Vocal / Producer', avatarUrl: 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?q=80&w=2070&auto=format&fit=crop', status: 'active' },
    { id: '2', name: 'NEON-X', role: 'Synth / Visuals', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=1780&auto=format&fit=crop', status: 'active' }
  ],
  resources: [
      {
          id: '1',
          title: 'Neon Dreams - Stems Pack',
          description: '包含专辑中所有鼓点、贝斯和合成器分轨文件，供 Remix 使用。',
          type: 'audio',
          provider: 'aliyun',
          link: 'https://www.aliyundrive.com/s/example',
          accessCode: '8888',
          size: '1.2 GB',
          date: '2025.01.15'
      },
      {
          id: '2',
          title: 'Live Visuals 4K',
          description: '东京巡演现场使用的视觉素材包，包含 VJ Loop。',
          type: 'video',
          provider: 'quark',
          link: '#',
          size: '4.5 GB',
          date: '2025.02.01'
      }
  ],
  contact: {
    email: 'booking@echo-music.com',
    phone: '+1 (555) 000-0000',
    addressLine1: 'Neo-Tokyo District 9',
    addressLine2: 'Block 42-A',
    footerText: 'AUDIO VISUAL EXPERIENCE • DESIGNED FOR THE FUTURE • HIGH FIDELITY STREAMING •'
  },
  integrations: {
    aliDrive: { enabled: false, accessKey: '', secretKey: '', bucket: '', endpoint: '' },
    oneDrive: { enabled: false, accessKey: '', secretKey: '', bucket: '', endpoint: '' },
    cloudflare: { enabled: false, accessKey: '', secretKey: '', bucket: '', endpoint: '' }
  }
};

const App: React.FC = () => {
  // Initialize state from localStorage first (fastest), then try Cloud sync
  // Deep merge logic to ensure new data structures (like integrations/resources) persist even if local storage has old schema
  const [siteData, setSiteData] = useState<SiteData>(() => {
    try {
      const savedData = localStorage.getItem('ves_site_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
            ...INITIAL_DATA,
            ...parsed,
            hero: { ...INITIAL_DATA.hero, ...(parsed.hero || {}) },
            contact: { ...INITIAL_DATA.contact, ...(parsed.contact || {}) },
            featuredAlbum: { ...INITIAL_DATA.featuredAlbum, ...(parsed.featuredAlbum || {}) },
            integrations: {
                ...INITIAL_DATA.integrations,
                ...(parsed.integrations || {}),
                aliDrive: { ...INITIAL_DATA.integrations.aliDrive, ...(parsed.integrations?.aliDrive || {}) },
                oneDrive: { ...INITIAL_DATA.integrations.oneDrive, ...(parsed.integrations?.oneDrive || {}) },
                cloudflare: { ...INITIAL_DATA.integrations.cloudflare, ...(parsed.integrations?.cloudflare || {}) },
            },
            // Arrays usually don't need deep merge, use parsed if available, else default
            resources: parsed.resources || INITIAL_DATA.resources,
            tracks: parsed.tracks || INITIAL_DATA.tracks,
            articles: parsed.articles || INITIAL_DATA.articles,
            artists: parsed.artists || INITIAL_DATA.artists,
            navigation: parsed.navigation || INITIAL_DATA.navigation
        };
      }
    } catch (e) {
      console.warn('Failed to load site data from localStorage', e);
    }
    return INITIAL_DATA;
  });

  // --- Cloud Synchronization Logic (Native Pages Functions) ---
  useEffect(() => {
      const fetchData = async () => {
          try {
              // GET request does not need headers, it is public read
              const res = await fetch('/api/sync', {
                  method: 'GET'
              });
              
              if (res.ok) {
                  const cloudData = await res.json();
                  if (cloudData && typeof cloudData === 'object') {
                      console.log("Cloud sync successful (Public Read)");
                      // Do a similar deep merge for cloud data update
                      setSiteData(prev => ({
                          ...prev,
                          ...cloudData,
                          hero: { ...prev.hero, ...(cloudData.hero || {}) },
                          contact: { ...prev.contact, ...(cloudData.contact || {}) },
                          integrations: {
                             ...prev.integrations,
                             ...(cloudData.integrations || {}),
                             aliDrive: { ...prev.integrations.aliDrive, ...(cloudData.integrations?.aliDrive || {}) },
                             oneDrive: { ...prev.integrations.oneDrive, ...(cloudData.integrations?.oneDrive || {}) },
                             cloudflare: { ...prev.integrations.cloudflare, ...(cloudData.integrations?.cloudflare || {}) }
                          }
                      }));
                  }
              } else {
                   console.warn("Cloud sync skipped (No data or API error):", res.status);
              }
          } catch (err) {
              console.error("Cloud sync connection error:", err);
          }
      };

      fetchData();
  }, []); // Run once on mount

  // Save to localStorage whenever siteData changes
  useEffect(() => {
    try {
      localStorage.setItem('ves_site_data', JSON.stringify(siteData));
    } catch (e) {
      console.error('Failed to save site data to localStorage', e);
    }
  }, [siteData]);
  
  // Admin Logic
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  
  // Audio Logic
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Track Detail Modal Logic
  const [selectedDetailTrack, setSelectedDetailTrack] = useState<Track | null>(null);
  // Global Player visibility (auto-show when playing)
  const [showGlobalPlayer, setShowGlobalPlayer] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Custom cursor
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleAdminToggle = () => {
      if (isAuthenticated) {
          setIsAdminOpen(true);
      } else {
          setShowPasswordModal(true);
      }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Check against the password in siteData (which can be changed)
      const currentPass = siteData.adminPassword || 'admin';
      
      if (passwordInput === currentPass) {
          setIsAuthenticated(true);
          setShowPasswordModal(false);
          setIsAdminOpen(true);
          setPasswordInput('');
          setLoginError(false);
      } else {
          setLoginError(true);
      }
  };

  // --- NEW: Robust Audio Handling ---
  const handlePlayTrack = async (track: Track) => {
    // 1. Toggle if same track
    if (currentTrackId === track.id && audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback toggle failed", e));
        }
        return;
    }

    // 2. Cleanup previous audio
    if (audioRef.current) {
        audioRef.current.pause();
        // Remove old listeners to prevent memory leaks / unwanted state updates
        audioRef.current.src = "";
        audioRef.current.load();
    }

    // 3. Setup New Audio Element
    // We recreate the Audio element to ensure a clean state for Web Audio / CORS
    const newAudio = new Audio();
    
    // Netease and some external streams block CORS (Cross-Origin Resource Sharing) headers.
    // If we attach them to Web Audio API (analyser), the browser SecurityPolicy will silent them.
    // Solution: If it's Netease/Restricted, DO NOT add crossOrigin="anonymous" and DO NOT connect to Web Audio.
    const isRestricted = track.sourceType === 'netease' || (track.audioUrl && track.audioUrl.includes('music.163.com'));

    if (!isRestricted) {
        newAudio.crossOrigin = "anonymous";
    } else {
        newAudio.removeAttribute('crossOrigin');
    }
    
    newAudio.src = track.audioUrl || '';

    // Bind Events
    newAudio.addEventListener('timeupdate', () => setCurrentTime(newAudio.currentTime));
    newAudio.addEventListener('loadedmetadata', () => setDuration(newAudio.duration));
    newAudio.addEventListener('ended', () => setIsPlaying(false));
    newAudio.addEventListener('play', () => setIsPlaying(true));
    newAudio.addEventListener('pause', () => setIsPlaying(false));
    newAudio.addEventListener('error', (e) => {
        // Only log real errors, avoid alerting on standard interruptions
        const target = e.target as HTMLAudioElement;
        if (target.error && target.error.code !== 0) {
             console.error("Audio playback error:", target.error);
        }
    });

    // Update Ref
    audioRef.current = newAudio;

    // 4. Connect to Visualizer (Only if NOT restricted)
    if (!isRestricted) {
        try {
            // Initialize Audio Context if needed
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContextClass();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 1024;
                analyserRef.current.connect(audioContextRef.current.destination);
            }

            // Resume context if suspended (browser autoplay policy)
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (analyserRef.current && audioContextRef.current) {
                 // Create a new source node for this specific element
                 const source = audioContextRef.current.createMediaElementSource(newAudio);
                 source.connect(analyserRef.current);
            }
            setAnalyser(analyserRef.current);
        } catch (err) {
            console.warn("Visualizer setup failed (likely CORS), falling back to simulated visuals.", err);
            setAnalyser(null);
        }
    } else {
        // Restricted Mode: Disable Real Visualizer (Visualizer component will handle simulation)
        setAnalyser(null);
    }

    // 5. Start Playback
    try {
        const playPromise = newAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Playback started successfully
                setCurrentTrackId(track.id);
                setShowGlobalPlayer(true);
                setIsPlaying(true);
            }).catch(e => {
                // Auto-play policy or abort error
                if (e.name === 'AbortError') {
                     // Ignore abort errors caused by rapid track switching
                     return;
                }
                console.error("Playback start failed:", e);
            });
        }
    } catch (e) {
        console.error("Synchronous playback error", e);
    }
  };

  const handleSeek = (time: number) => {
      if (audioRef.current) {
          // Ensure we don't seek past duration
          const safeTime = Math.min(Math.max(0, time), audioRef.current.duration || 0);
          audioRef.current.currentTime = safeTime;
          setCurrentTime(safeTime);
      }
  };

  // Find the full track object for currentTrackId
  const currentTrack = siteData.tracks.find(t => t.id === currentTrackId) || null;

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", mouseMove);

    // Simulate data fetching / asset loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      clearTimeout(timer);
      // Cleanup audio on unmount
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
      }
    };
  }, []);

  // Determine if the system cursor should be shown (when in admin mode or password modal)
  const isSystemCursor = isAdminOpen || showPasswordModal;

  return (
    <div className={`bg-void min-h-screen text-gray-100 selection:bg-hot-pink selection:text-white font-sans relative pb-20 ${isSystemCursor ? 'cursor-auto' : 'cursor-none'}`}>
      
      {/* Grain Overlay */}
      <div className="bg-grain pointer-events-none"></div>

      {/* Custom Cursor - Only show when NOT in admin mode */}
      {!isSystemCursor && (
        <>
          <motion.div
            className="fixed top-0 left-0 w-4 h-4 bg-hot-pink rounded-full pointer-events-none z-[100] mix-blend-difference"
            animate={{ x: cursorPosition.x - 8, y: cursorPosition.y - 8 }}
            transition={{ type: "tween", ease: "linear", duration: 0 }}
          />
          <motion.div
            className="fixed top-0 left-0 w-12 h-12 border border-electric-cyan/50 rounded-full pointer-events-none z-[100]"
            animate={{ x: cursorPosition.x - 24, y: cursorPosition.y - 24 }}
            transition={{ type: "spring", mass: 0.2, stiffness: 100 }}
          />
        </>
      )}

      <AnimatePresence mode="wait">
        {isLoading && <Loader />}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
          {showPasswordModal && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9999] bg-midnight/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-auto"
              >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={loginError ? { x: [-10, 10, -10, 10, 0], scale: 1, y: 0 } : { scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    transition={loginError ? { type: "spring", stiffness: 300, damping: 10 } : { duration: 0.3 }}
                    className="bg-black border border-white/10 rounded-2xl p-8 w-full max-w-md relative overflow-hidden shadow-[0_0_50px_rgba(255,0,128,0.2)]"
                  >
                       <button 
                            onClick={() => setShowPasswordModal(false)} 
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                       >
                           <ShieldAlert size={20} />
                       </button>
                       
                       <div className="flex flex-col items-center gap-4 mb-8">
                           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-electric-cyan border border-electric-cyan/30">
                               <Lock size={32} />
                           </div>
                           <h2 className="font-display font-bold text-2xl text-white tracking-wider">SYSTEM LOCKED</h2>
                           <p className="text-slate-500 text-xs font-mono uppercase">Enter secure access token</p>
                       </div>

                       <form onSubmit={handleLogin} className="space-y-4">
                           <div className="relative">
                               <input 
                                    type="password" 
                                    autoFocus
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className={`w-full bg-white/5 border ${loginError ? 'border-red-500 text-red-500' : 'border-white/10 text-white'} rounded-xl px-4 py-3 outline-none focus:border-electric-cyan transition-colors text-center font-mono tracking-[0.5em] text-lg placeholder:text-slate-700`}
                                    placeholder="••••••"
                               />
                           </div>
                           {loginError && <p className="text-center text-red-500 text-xs font-mono animate-pulse">ACCESS DENIED: INVALID TOKEN</p>}
                           <button type="submit" className="w-full bg-hot-pink hover:bg-white hover:text-midnight text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-lg shadow-hot-pink/20">
                               Access <ArrowRight size={16} />
                           </button>
                       </form>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDetailTrack && (
          <TrackDetailModal 
            track={selectedDetailTrack} 
            isPlaying={isPlaying && currentTrackId === selectedDetailTrack.id}
            currentTime={currentTrackId === selectedDetailTrack.id ? currentTime : 0}
            duration={currentTrackId === selectedDetailTrack.id ? duration : 0}
            onClose={() => setSelectedDetailTrack(null)}
            onPlayToggle={() => handlePlayTrack(selectedDetailTrack)}
            onSeek={handleSeek}
          />
        )}
      </AnimatePresence>

      {/* Global Sticky Player */}
      <AnimatePresence>
        {showGlobalPlayer && currentTrack && (
            <GlobalPlayer 
                track={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlayToggle={() => handlePlayTrack(currentTrack)}
                onSeek={handleSeek}
                onClose={() => {
                    if(isPlaying && audioRef.current) audioRef.current.pause();
                    setShowGlobalPlayer(false);
                }}
                onOpenDetail={() => setSelectedDetailTrack(currentTrack)}
            />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Navbar 
            isAdmin={isAuthenticated} 
            toggleAdmin={handleAdminToggle} 
            navItems={siteData.navigation}
          />
          
          {/* Pass analyser and playing state to Visualizer */}
          <Visualizer analyser={analyser} isPlaying={isPlaying} />

          <main className="relative w-full">
            
            <Hero data={siteData.hero} />
            
            <section id="music" className="relative z-20">
                <MusicSection 
                    tracks={siteData.tracks} 
                    featuredAlbum={siteData.featuredAlbum}
                    currentTrackId={currentTrackId}
                    isPlaying={isPlaying}
                    onPlayTrack={handlePlayTrack}
                    onViewDetails={(track) => setSelectedDetailTrack(track)}
                />
            </section>
            
            <ArticleSection 
              articles={siteData.articles} 
              onPlayLinkedTrack={(trackId) => {
                 const track = siteData.tracks.find(t => t.id === trackId);
                 if (track) handlePlayTrack(track);
              }}
              currentTrackId={currentTrackId}
              isPlaying={isPlaying}
            />
            
            {/* NEW: Download Section */}
            <DownloadSection resources={siteData.resources || []} />
            
            <ContactSection contactData={siteData.contact} />
            
            <Footer contactData={siteData.contact} />
          </main>
        </motion.div>
      )}
      
      {/* Admin Panel Overlay - Fullscreen Fixed */}
      <AnimatePresence>
        {isAdminOpen && (
            <div className="fixed inset-0 z-[60] cursor-auto">
                <AdminPanel 
                    data={siteData}
                    updateData={setSiteData}
                    onClose={() => setIsAdminOpen(false)} 
                />
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
