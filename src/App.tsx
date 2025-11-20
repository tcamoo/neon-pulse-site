
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MusicSection from './components/MusicSection';
import ArticleSection from './components/TourSection'; // Reusing file but repurposed
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Visualizer from './components/Visualizer';
import AdminPanel from './components/AdminPanel';
import Loader from './components/Loader';
import TrackDetailModal from './components/TrackDetailModal';
import GlobalPlayer from './components/GlobalPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import type { SiteData, Track } from './types';

// Initial Data Configuration
const INITIAL_DATA: SiteData = {
  navigation: [
    { id: 'nav_1', label: '音乐作品', targetId: 'music' },
    { id: 'nav_2', label: '动态现场', targetId: 'live' },
    { id: 'nav_3', label: '联系合作', targetId: 'contact' },
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
  const [siteData, setSiteData] = useState<SiteData>(INITIAL_DATA);
  const [isAdmin, setIsAdmin] = useState(true); // Enabled by default for preview
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
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Custom cursor
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  // Initialize Audio & Events
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
        
        // Event Listeners
        const audio = audioRef.current;
        
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onEnded = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onError = () => {
          console.error("Audio error occurred:", audio.error);
          setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('error', onError);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }
  }, []);

  const handlePlayTrack = async (track: Track) => {
    if (!audioRef.current) return;

    // Initialize Audio Context on first user interaction
    if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        // Fix: use the polyfilled class
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        // Higher FFT size for better resolution in Visualizer (default 256 -> 1024)
        analyserRef.current.fftSize = 1024;
        
        // Create source only once
        if (!sourceRef.current) {
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
        }
        
        setAnalyser(analyserRef.current);
    }

    // Ensure context is running
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    if (currentTrackId === track.id) {
        // Toggle Play/Pause
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Playback failed during toggle:", e);
                });
            }
        }
    } else {
        // Play new track
        if (track.audioUrl) {
            try {
                // Optimistically pause the current track before switching
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                
                audioRef.current.src = track.audioUrl;
                audioRef.current.load(); // Ensure the new source is loaded
                
                const playPromise = audioRef.current.play();
                
                if (playPromise !== undefined) {
                    playPromise
                    .then(() => {
                        setCurrentTrackId(track.id);
                        setShowGlobalPlayer(true);
                    })
                    .catch(e => {
                        console.error("Playback failed:", e);
                        alert("Playback failed: " + e.message);
                    });
                }
            } catch (err) {
                console.error("Error setting up playback:", err);
            }
        } else {
            console.warn("No audio URL for this track");
            alert("This track does not have a valid audio URL.");
        }
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
    };
  }, []);

  return (
    <div className="bg-void min-h-screen text-gray-100 selection:bg-hot-pink selection:text-white cursor-none font-sans relative pb-20">
      
      {/* Grain Overlay */}
      <div className="bg-grain pointer-events-none"></div>

      {/* Custom Cursor */}
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

      <AnimatePresence mode="wait">
        {isLoading && <Loader />}
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
            isAdmin={isAdmin} 
            toggleAdmin={() => setIsAdmin(!isAdmin)} 
            navItems={siteData.navigation}
          />
          
          {/* Pass analyser to Visualizer */}
          <Visualizer analyser={analyser} />

          <main className="relative w-full">
            
            <Hero data={siteData.hero} />
            
            <section id="music" className="relative z-20">
                {/* Admin Panel Overlay */}
                <AnimatePresence>
                    {isAdmin && (
                        <div className="container mx-auto max-w-6xl relative z-50 pt-24 px-6">
                            <AdminPanel 
                                data={siteData}
                                updateData={setSiteData}
                                onClose={() => setIsAdmin(false)} 
                            />
                        </div>
                    )}
                </AnimatePresence>

                <MusicSection 
                    tracks={siteData.tracks} 
                    featuredAlbum={siteData.featuredAlbum}
                    currentTrackId={currentTrackId}
                    isPlaying={isPlaying}
                    onPlayTrack={handlePlayTrack}
                    onViewDetails={(track) => setSelectedDetailTrack(track)}
                />
            </section>
            
            {/* Now renders ArticleSection but passing tracks for linking */}
            <ArticleSection 
              articles={siteData.articles} 
              onPlayLinkedTrack={(trackId) => {
                 const track = siteData.tracks.find(t => t.id === trackId);
                 if (track) handlePlayTrack(track);
              }}
              currentTrackId={currentTrackId}
              isPlaying={isPlaying}
            />
            
            <ContactSection contactData={siteData.contact} />
            
            <Footer contactData={siteData.contact} />
          </main>
        </motion.div>
      )}
    </div>
  );
};

export default App;
