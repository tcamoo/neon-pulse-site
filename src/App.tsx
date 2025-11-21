
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MusicSection from './components/MusicSection';
import ArticleSection from './components/TourSection';
import ContactSection from './components/ContactSection';
import DownloadSection from './components/DownloadSection';
import Footer from './components/Footer';
import Visualizer from './components/Visualizer';
import AdminPanel from './components/AdminPanel';
import Loader from './components/Loader';
import TrackDetailModal from './components/TrackDetailModal';
import GlobalPlayer from './components/GlobalPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import type { SiteData, Track, ThemeMode } from './types';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

// Initial Data Configuration
const INITIAL_DATA: SiteData = {
  theme: 'cyberpunk',
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'admin',
  navigation: [
    { id: 'nav_1', label: '音乐作品', targetId: 'music' },
    { id: 'nav_2', label: '动态现场', targetId: 'live' },
    { id: 'nav_3', label: '资源挂载', targetId: 'downloads' },
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
        lyrics: "Walking down the street at midnight\nNeon lights reflecting in your eyes\nThe city sleeps but we are alive\nChasing shadows under purple skies"
    },
    { 
        id: 'netease_demo', 
        title: '网易云热单 (Demo)', 
        artist: 'Various', 
        album: 'Cloud Music', 
        duration: '04:20', 
        plays: 89000, 
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
        neteaseId: '186016', // Example ID (Sunny Day)
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
  ],
  artists: [
    { id: '1', name: 'VES', role: 'Main Vocal / Producer', avatarUrl: 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?q=80&w=2070&auto=format&fit=crop', status: 'active' },
  ],
  resources: [
      {
          id: '1',
          title: 'Neon Dreams - Project Files',
          description: 'Ableton Live 工程文件，包含所有未混音分轨。',
          type: 'project',
          provider: 'aliyun',
          link: 'https://www.aliyundrive.com/s/example',
          accessCode: 'VES1',
          size: '4.2 GB',
          date: '2025.02.20'
      }
  ],
  storage: {
      enabled: false,
      provider: 'r2',
      endpoint: '',
      accessKeyId: '',
      secretAccessKey: '',
      bucketName: 'ves-music',
      publicDomain: 'https://pub-xxx.r2.dev'
  },
  contact: {
    email: 'booking@echo-music.com',
    phone: '+1 (555) 000-0000',
    addressLine1: 'Neo-Tokyo District 9',
    addressLine2: 'Block 42-A',
    footerText: 'AUDIO VISUAL EXPERIENCE • DESIGNED FOR THE FUTURE • HIGH FIDELITY STREAMING •'
  }
};

// Define Themes
const THEMES: Record<ThemeMode, Record<string, string>> = {
    cyberpunk: {
        '--color-bg': '#0F172A',        // Midnight Blue
        '--color-primary': '#FF0080',   // Hot Pink
        '--color-secondary': '#06B6D4', // Electric Cyan
        '--color-accent': '#D9F99D',    // Lime Punch
        '--color-surface': '#1E293B',   // Slate 800
    },
    acid: {
        '--color-bg': '#000000',        // Pure Black
        '--color-primary': '#CCFF00',   // Acid Green
        '--color-secondary': '#FF3300', // Danger Orange
        '--color-accent': '#FFFFFF',    // White
        '--color-surface': '#111111',   // Dark Grey
    },
    vaporwave: {
        '--color-bg': '#240046',        // Deep Indigo
        '--color-primary': '#FF9E00',   // Sunset Orange
        '--color-secondary': '#E0AAFF', // Lavender
        '--color-accent': '#7B2CBF',    // Purple
        '--color-surface': '#3C096C',   // Rich Violet
    }
};

const App: React.FC = () => {
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
            storage: { ...INITIAL_DATA.storage, ...(parsed.storage || {}) },
            featuredAlbum: { ...INITIAL_DATA.featuredAlbum, ...(parsed.featuredAlbum || {}) },
            resources: parsed.resources || INITIAL_DATA.resources,
            tracks: parsed.tracks || INITIAL_DATA.tracks,
            articles: parsed.articles || INITIAL_DATA.articles,
            navigation: parsed.navigation || INITIAL_DATA.navigation,
            theme: parsed.theme || INITIAL_DATA.theme
        };
      }
    } catch (e) {
      console.warn('Failed to load site data from localStorage', e);
    }
    return INITIAL_DATA;
  });

  // Apply Theme Effect
  useEffect(() => {
      const theme = siteData.theme || 'cyberpunk';
      const colors = THEMES[theme] || THEMES['cyberpunk'];
      const root = document.documentElement;
      
      Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(key, value);
      });
  }, [siteData.theme]);

  useEffect(() => {
    try {
      localStorage.setItem('ves_site_data', JSON.stringify(siteData));
    } catch (e) {
      console.error('Failed to save site data to localStorage', e);
    }
  }, [siteData]);
  
  // Admin & Auth State
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
  
  const [selectedDetailTrack, setSelectedDetailTrack] = useState<Track | null>(null);
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

  const handlePlayTrack = async (track: Track) => {
    // If it's a Netease track, we don't use the global audio element
    if (track.neteaseId) {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
        setCurrentTrackId(track.id);
        return;
    }

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
        audioRef.current.src = "";
        audioRef.current.load();
    }

    // 3. Setup New Audio Element
    const newAudio = new Audio();
    newAudio.crossOrigin = "anonymous";
    newAudio.src = track.audioUrl || '';

    newAudio.addEventListener('timeupdate', () => setCurrentTime(newAudio.currentTime));
    newAudio.addEventListener('loadedmetadata', () => setDuration(newAudio.duration));
    newAudio.addEventListener('ended', () => setIsPlaying(false));
    newAudio.addEventListener('play', () => setIsPlaying(true));
    newAudio.addEventListener('pause', () => setIsPlaying(false));
    
    audioRef.current = newAudio;

    // 4. Connect to Visualizer (Browser Policy Permitting)
    try {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 1024;
            analyserRef.current.connect(audioContextRef.current.destination);
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        if (analyserRef.current && audioContextRef.current) {
            try {
                const source = audioContextRef.current.createMediaElementSource(newAudio);
                source.connect(analyserRef.current);
            } catch (e) {
                // CORS issues common with some CDNs
            }
        }
        setAnalyser(analyserRef.current);
    } catch (err) {
        setAnalyser(null);
    }

    // 5. Start Playback
    try {
        const playPromise = newAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setCurrentTrackId(track.id);
                setShowGlobalPlayer(true);
                setIsPlaying(true);
            }).catch(e => console.error("Playback start failed:", e));
        }
    } catch (e) {
        console.error("Synchronous playback error", e);
    }
  };

  const handleSeek = (time: number) => {
      if (audioRef.current) {
          const safeTime = Math.min(Math.max(0, time), audioRef.current.duration || 0);
          audioRef.current.currentTime = safeTime;
          setCurrentTime(safeTime);
      }
  };

  const currentTrack = siteData.tracks.find(t => t.id === currentTrackId) || null;

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", mouseMove);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      clearTimeout(timer);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
      }
    };
  }, []);

  const isSystemCursor = isAdminOpen || showPasswordModal;

  return (
    <div className={`bg-midnight min-h-screen text-gray-100 selection:bg-hot-pink selection:text-white font-sans relative pb-20 ${isSystemCursor ? 'cursor-auto' : 'cursor-none'} transition-colors duration-500`}>
      <div className="bg-grain pointer-events-none"></div>

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
                    className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-md relative overflow-hidden shadow-[0_0_50px_rgba(255,0,128,0.2)]"
                  >
                       <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><ShieldAlert size={20} /></button>
                       <div className="flex flex-col items-center gap-4 mb-8">
                           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-electric-cyan border border-electric-cyan/30"><Lock size={32} /></div>
                           <h2 className="font-display font-bold text-2xl text-white tracking-wider">SYSTEM LOCKED</h2>
                           <p className="text-slate-500 text-xs font-mono uppercase">Enter secure access token</p>
                       </div>
                       <form onSubmit={handleLogin} className="space-y-4">
                           <div className="relative">
                               <input type="password" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full bg-white/5 border ${loginError ? 'border-red-500 text-red-500' : 'border-white/10 text-white'} rounded-xl px-4 py-3 outline-none focus:border-electric-cyan transition-colors text-center font-mono tracking-[0.5em] text-lg placeholder:text-slate-700`} placeholder="••••••"/>
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

      <AnimatePresence>
        {showGlobalPlayer && currentTrack && !currentTrack.neteaseId && (
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
          <Navbar isAdmin={isAuthenticated} toggleAdmin={handleAdminToggle} navItems={siteData.navigation} />
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
            <DownloadSection resources={siteData.resources || []} />
            <ContactSection contactData={siteData.contact} />
            <Footer contactData={siteData.contact} />
          </main>
        </motion.div>
      )}
      
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
