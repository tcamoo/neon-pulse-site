
import React from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  plays: number;
  audioUrl?: string; // For native/uploaded audio (R2 Direct Link)
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

// For Downloadable Resources (Netdisk Links)
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

// For Object Storage Configuration (R2/S3)
export interface CloudConfig {
  enabled: boolean;
  provider: 'r2' | 's3';
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string; // Critical for generating direct audio links
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
  targetId: string;
}

export interface ContactConfig {
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  footerText: string;
}

export type ThemeMode = 'cyberpunk' | 'acid' | 'vaporwave';

export interface SiteData {
  theme?: ThemeMode; // NEW: UI Theme
  adminPassword?: string; 
  navigation: NavItem[];
  hero: HeroData;
  featuredAlbum: FeaturedAlbum;
  tracks: Track[];
  articles: Article[];
  artists: Artist[];
  resources: Resource[]; // Netdisk Links
  storage: CloudConfig;  // R2/S3 Config
  contact: ContactConfig;
}
