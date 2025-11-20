
import React from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  plays: number;
  audioUrl?: string;
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

export interface CloudConfig {
  enabled: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
  endpoint: string;
}

export interface CloudIntegrations {
  aliDrive: CloudConfig;
  oneDrive: CloudConfig;
  cloudflare: CloudConfig;
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
  navigation: NavItem[];
  hero: HeroData;
  featuredAlbum: FeaturedAlbum;
  tracks: Track[];
  articles: Article[];
  artists: Artist[];
  contact: ContactConfig;
  integrations: CloudIntegrations;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}
