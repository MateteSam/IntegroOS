// ═══════════════════════════════════════════════════════════════
// Shared Template Data — Used by Gallery and Preview pages
// ═══════════════════════════════════════════════════════════════

import {
  LayoutGrid, Church, Briefcase, BookOpen, GraduationCap, Music, DollarSign,
  Network, Disc3, Shirt, Video, Package, ShoppingCart,
  Building2, Plane, PartyPopper, Mic2, Truck, Shield,
} from 'lucide-react';

export interface WebTemplate {
  id: string;
  name: string;
  category: string;
  scene: string;
  price: number;
  rating: number;
  downloads: number;
  tags: string[];
  featured?: boolean;
  description: string;
}

export const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: LayoutGrid },
  { id: 'church', label: 'Church', icon: Church },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'book-launch', label: 'Book Launches', icon: BookOpen },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'music-artist', label: 'Music Artists', icon: Music },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'network-marketing', label: 'Network Marketing', icon: Network },
  { id: 'music-studio', label: 'Music Studio', icon: Disc3 },
  { id: 'fashion', label: 'Fashion', icon: Shirt },
  { id: 'video-production', label: 'Video Production', icon: Video },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'online-store', label: 'Online Stores', icon: ShoppingCart },
  { id: 'agency', label: 'Agency', icon: Building2 },
  { id: 'travel', label: 'Travel / Tours', icon: Plane },
  { id: 'events', label: 'Events', icon: PartyPopper },
  { id: 'podcasts', label: 'Podcasts', icon: Mic2 },
  { id: 'transport', label: 'Transport', icon: Truck },
  { id: 'security', label: 'Security', icon: Shield },
];

export const TEMPLATES: WebTemplate[] = [
  // ── Church
  { id: 'church-1', name: 'Sanctuary Light', category: 'church', scene: 'scene-warm-church', price: 299, rating: 4.9, downloads: 1240, tags: ['Ministry', 'Community'], featured: true, description: 'A warm, welcoming design with stained glass warmth and elegant typography.' },
  { id: 'church-2', name: 'Gospel Grace', category: 'church', scene: 'scene-luxury-gold', price: 349, rating: 4.8, downloads: 890, tags: ['Worship', 'Sermons'], description: 'Premium black & gold design for established congregations.' },
  { id: 'church-3', name: 'Faith Forward', category: 'church', scene: 'scene-clean-saas', price: 249, rating: 4.7, downloads: 1560, tags: ['Modern', 'Youth'], description: 'Clean, contemporary layout for modern faith communities.' },
  // ── Business
  { id: 'biz-1', name: 'Enterprise Command', category: 'business', scene: 'scene-cosmic-dark', price: 499, rating: 4.9, downloads: 2340, tags: ['Corporate', 'Enterprise'], featured: true, description: 'AI-forward dark theme for innovative tech companies.' },
  { id: 'biz-2', name: 'Summit Pro', category: 'business', scene: 'scene-clean-saas', price: 399, rating: 4.8, downloads: 3100, tags: ['SaaS', 'Startup'], description: 'Clean management dashboard aesthetic for SaaS companies.' },
  { id: 'biz-3', name: 'Carbon Elite', category: 'business', scene: 'scene-steel-industrial', price: 449, rating: 4.7, downloads: 1890, tags: ['Consulting', 'B2B'], description: 'Steel-toned professional design for consulting firms.' },
  // ── Book Launches
  { id: 'book-1', name: 'Literary Opus', category: 'book-launch', scene: 'scene-book-editorial', price: 299, rating: 4.9, downloads: 980, tags: ['Author', 'Publishing'], featured: true, description: 'Editorial typography meets modern book launch design.' },
  { id: 'book-2', name: 'Bestseller Dark', category: 'book-launch', scene: 'scene-dark-futuristic', price: 349, rating: 4.7, downloads: 750, tags: ['SciFi', 'Thriller'], description: 'Dark futuristic template for genre fiction launches.' },
  // ── Education
  { id: 'edu-1', name: 'Campus Bright', category: 'education', scene: 'scene-pastel-soft', price: 299, rating: 4.8, downloads: 2100, tags: ['University', 'Courses'], featured: true, description: 'Warm, inviting design that makes learning feel accessible.' },
  { id: 'edu-2', name: 'Scholar Hub', category: 'education', scene: 'scene-clean-saas', price: 349, rating: 4.7, downloads: 1650, tags: ['LMS', 'Academy'], description: 'Clean platform design for online learning academies.' },
  // ── Music Artists
  { id: 'music-1', name: 'Resonance', category: 'music-artist', scene: 'scene-neon-cyber', price: 399, rating: 4.9, downloads: 1890, tags: ['HipHop', 'Electronic'], featured: true, description: 'Neon cyber aesthetic for electronic and hip-hop artists.' },
  { id: 'music-2', name: 'Acoustic Soul', category: 'music-artist', scene: 'scene-organic', price: 299, rating: 4.8, downloads: 1200, tags: ['Indie', 'Soul'], description: 'Warm organic vibes for indie and soul musicians.' },
  { id: 'music-3', name: 'Stadium Tour', category: 'music-artist', scene: 'scene-bold-gradient', price: 449, rating: 4.7, downloads: 890, tags: ['Pop', 'Tours'], description: 'Bold gradient energy for international touring artists.' },
  // ── Finance
  { id: 'fin-1', name: 'Vault Pro', category: 'finance', scene: 'scene-emerald-finance', price: 499, rating: 4.9, downloads: 1560, tags: ['Banking', 'Crypto'], featured: true, description: 'Dark emerald trust design for financial institutions.' },
  { id: 'fin-2', name: 'Capital Flow', category: 'finance', scene: 'scene-neon-data', price: 449, rating: 4.7, downloads: 1230, tags: ['Fintech', 'Trading'], description: 'Data-driven design for fintech and trading platforms.' },
  // ── Network Marketing
  { id: 'mlm-1', name: 'Empire Builder', category: 'network-marketing', scene: 'scene-network-geo', price: 399, rating: 4.8, downloads: 2340, tags: ['MLM', 'Referral'], featured: true, description: 'Geometric network visualization for team-building platforms.' },
  { id: 'mlm-2', name: 'Growth Chain', category: 'network-marketing', scene: 'scene-bold-gradient', price: 349, rating: 4.7, downloads: 1890, tags: ['Affiliate', 'Direct Sales'], description: 'Bold gradient energy that screams opportunity and ambition.' },
  // ── Music Studio
  { id: 'studio-1', name: 'Frequency Lab', category: 'music-studio', scene: 'scene-glassmorphism', price: 449, rating: 4.9, downloads: 980, tags: ['Recording', 'Production'], featured: true, description: 'Glassmorphism design capturing the studio atmosphere.' },
  { id: 'studio-2', name: 'Waveform Pro', category: 'music-studio', scene: 'scene-neon-cyber', price: 399, rating: 4.8, downloads: 750, tags: ['Mixing', 'Mastering'], description: 'Dark neon aesthetic for professional audio engineers.' },
  // ── Fashion
  { id: 'fashion-1', name: 'Haute Digital', category: 'fashion', scene: 'scene-fashion-runway', price: 499, rating: 4.9, downloads: 1450, tags: ['Luxury', 'Couture'], featured: true, description: 'High-contrast runway editorial for luxury fashion brands.' },
  { id: 'fashion-2', name: 'Street Pulse', category: 'fashion', scene: 'scene-dark-futuristic', price: 399, rating: 4.8, downloads: 2100, tags: ['Streetwear', 'Urban'], description: 'Futuristic dark theme for streetwear and urban fashion.' },
  { id: 'fashion-3', name: 'Minimalist Atelier', category: 'fashion', scene: 'scene-brutalist', price: 349, rating: 4.7, downloads: 890, tags: ['Minimal', 'Editorial'], description: 'Raw brutalist design for avant-garde fashion labels.' },
  // ── Video Production
  { id: 'vid-1', name: 'Director\'s Cut', category: 'video-production', scene: 'scene-video-cinematic', price: 449, rating: 4.9, downloads: 1340, tags: ['Film', 'Documentary'], featured: true, description: 'Cinematic film strip aesthetic for production houses.' },
  { id: 'vid-2', name: 'Reel Factory', category: 'video-production', scene: 'scene-dark-futuristic', price: 399, rating: 4.7, downloads: 980, tags: ['YouTube', 'Content'], description: 'Futuristic design for content creators and YouTubers.' },
  // ── Products
  { id: 'prod-1', name: 'Launch Pad', category: 'products', scene: 'scene-product-showcase', price: 349, rating: 4.8, downloads: 2560, tags: ['SaaS', 'App'], featured: true, description: 'Clean minimal showcase for product and app launches.' },
  { id: 'prod-2', name: 'Unbox', category: 'products', scene: 'scene-dark-futuristic', price: 399, rating: 4.7, downloads: 1890, tags: ['Physical', 'Tech'], description: 'Dark futuristic unboxing experience for tech products.' },
  // ── Online Stores
  { id: 'store-1', name: 'Boutique Pro', category: 'online-store', scene: 'scene-ecommerce-vibrant', price: 499, rating: 4.9, downloads: 3400, tags: ['E-Commerce', 'Shopify'], featured: true, description: 'Vibrant e-commerce design with product showcase focus.' },
  { id: 'store-2', name: 'Market Fresh', category: 'online-store', scene: 'scene-pastel-soft', price: 349, rating: 4.8, downloads: 2100, tags: ['Food', 'Organic'], description: 'Warm pastel design for food and organic product stores.' },
  // ── Agency
  { id: 'agency-1', name: 'Viral Studio', category: 'agency', scene: 'scene-organic', price: 449, rating: 4.9, downloads: 1780, tags: ['Creative', 'Digital'], featured: true, description: 'Organic creativity for digital marketing agencies.' },
  { id: 'agency-2', name: 'Pixel Empire', category: 'agency', scene: 'scene-glassmorphism', price: 499, rating: 4.8, downloads: 1340, tags: ['Design', 'Branding'], description: 'Glassmorphism design for premium design agencies.' },
  // ── Travel
  { id: 'travel-1', name: 'Wanderlust', category: 'travel', scene: 'scene-sunset-warm', price: 399, rating: 4.9, downloads: 2890, tags: ['Adventures', 'Tours'], featured: true, description: 'Sunset warm gradients that inspire wanderlust.' },
  { id: 'travel-2', name: 'Atlas Explorer', category: 'travel', scene: 'scene-neon-data', price: 349, rating: 4.7, downloads: 1560, tags: ['Booking', 'Flights'], description: 'Data-driven globe design for travel booking platforms.' },
  // ── Events
  { id: 'event-1', name: 'Glow Festival', category: 'events', scene: 'scene-event-glow', price: 399, rating: 4.9, downloads: 2100, tags: ['Festival', 'Conference'], featured: true, description: 'Electric glow aesthetic for unforgettable events.' },
  { id: 'event-2', name: 'Grand Gala', category: 'events', scene: 'scene-luxury-gold', price: 449, rating: 4.8, downloads: 1450, tags: ['Wedding', 'Corporate'], description: 'Luxury gold design for premium galas and weddings.' },
  // ── Podcasts
  { id: 'pod-1', name: 'Sound Waves', category: 'podcasts', scene: 'scene-podcast-dark', price: 299, rating: 4.9, downloads: 3200, tags: ['Interview', 'Talk Show'], featured: true, description: 'Waveform aesthetic designed for podcast brands.' },
  { id: 'pod-2', name: 'Mic Check', category: 'podcasts', scene: 'scene-brutalist', price: 249, rating: 4.7, downloads: 1890, tags: ['Comedy', 'News'], description: 'Raw brutalist design for bold podcast personalities.' },
  // ── Transport
  { id: 'trans-1', name: 'Fleet Command', category: 'transport', scene: 'scene-transport-bold', price: 399, rating: 4.8, downloads: 980, tags: ['Logistics', 'Fleet'], featured: true, description: 'Bold geometric motion design for transport companies.' },
  { id: 'trans-2', name: 'Express Lane', category: 'transport', scene: 'scene-steel-industrial', price: 349, rating: 4.7, downloads: 750, tags: ['Delivery', 'Courier'], description: 'Industrial steel design for courier and delivery brands.' },
  // ── Security
  { id: 'sec-1', name: 'Sentinel Shield', category: 'security', scene: 'scene-steel-industrial', price: 449, rating: 4.9, downloads: 1230, tags: ['Cyber', 'Defense'], featured: true, description: 'Industrial authority design for security companies.' },
  { id: 'sec-2', name: 'Guardian Pro', category: 'security', scene: 'scene-cosmic-dark', price: 399, rating: 4.7, downloads: 890, tags: ['CCTV', 'Access Control'], description: 'Cosmic dark aesthetic for surveillance and tech security.' },
];
