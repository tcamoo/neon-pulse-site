
import React from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  plays: number;
  audioUrl?: string; // For native/uploaded audio
  neteaseId?: string; // For Netease Cloud Music iframe
  lyrics?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  coverUrl: string;
  // Optional linked track ID for background music
  linkedTrackId?: string; 
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  status: 'active' | 'guest';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'audio' | 'video' | 'project' | 'archive' | 'other';
  provider: 'aliyun' | 'baidu' | 'quark' | 'google' | 'other';
  link: string;
  accessCode?: string;
  size?: string;
  date: string;
}

export interface HeroData {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  marqueeText: string;
  buttonText: string;
  heroImage: string;
}

export interface FeaturedAlbum {
  title: string;
  type: string;
  description: string;
  coverUrl: string;
}

export interface NavItem {
  id: string;
  label: string;
  targetId: string; // e.g., "music", "live", "contact"
}

export interface ContactConfig {
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  footerText: string;
}

export interface SiteData {
  adminPassword?: string; 
  navigation: NavItem[];
  hero: HeroData;
  featuredAlbum: FeaturedAlbum;
  tracks: Track[];
  articles: Article[];
  artists: Artist[];
  resources: Resource[];
  contact: ContactConfig;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}
