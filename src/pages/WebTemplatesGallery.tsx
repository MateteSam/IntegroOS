import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, Rocket, Star, Filter, LayoutGrid,
  ArrowRight, Sparkles, TrendingUp, Users, Globe, Zap
} from 'lucide-react';
import { TEMPLATES, CATEGORIES, type WebTemplate } from './webTemplateData';
import './WebTemplatesGallery.css';

// ═══════════════════════════════════════════════════════════════
// HERO IMAGE MAP — match category to hero image
// ═══════════════════════════════════════════════════════════════
const HERO_IMAGES: Record<string, string> = {
  church: '/template-heroes/hero-church.png',
  business: '/template-heroes/hero-business.png',
  'book-launch': '/template-heroes/hero-book-launch.png',
  education: '/template-heroes/hero-education.png',
  'music-artist': '/template-heroes/hero-music.png',
  finance: '/template-heroes/hero-finance.png',
  'network-marketing': '/template-heroes/hero-network-marketing.png',
  'music-studio': '/template-heroes/hero-music-studio.png',
  fashion: '/template-heroes/hero-fashion.png',
  'video-production': '/template-heroes/hero-video-prod.png',
  products: '/template-heroes/hero-products.png',
  'online-store': '/template-heroes/hero-online-store.png',
  agency: '/template-heroes/hero-agency.png',
  travel: '/template-heroes/hero-travel.png',
  events: '/template-heroes/hero-events.png',
  podcasts: '/template-heroes/hero-podcasts.png',
  transport: '/template-heroes/hero-transport.png',
  security: '/template-heroes/hero-security.png',
};

// Per-template accent colors for the mini-preview
const TEMPLATE_COLORS: Record<string, { primary: string; accent: string }> = {
  'church-1': { primary: '#D4AF37', accent: '#FFD700' },
  'church-2': { primary: '#D4AF37', accent: '#B8860B' },
  'church-3': { primary: '#8B5CF6', accent: '#A78BFA' },
  'biz-1': { primary: '#8B5CF6', accent: '#A78BFA' },
  'biz-2': { primary: '#3B82F6', accent: '#60A5FA' },
  'biz-3': { primary: '#64748B', accent: '#94A3B8' },
  'book-1': { primary: '#B8860B', accent: '#DAA520' },
  'book-2': { primary: '#EC4899', accent: '#F472B6' },
  'edu-1': { primary: '#F59E0B', accent: '#FBBF24' },
  'edu-2': { primary: '#3B82F6', accent: '#60A5FA' },
  'music-1': { primary: '#EC4899', accent: '#00FFFF' },
  'music-2': { primary: '#F59E0B', accent: '#A78BFA' },
  'music-3': { primary: '#EF4444', accent: '#F97316' },
  'fin-1': { primary: '#10B981', accent: '#34D399' },
  'fin-2': { primary: '#8B5CF6', accent: '#06B6D4' },
  'mlm-1': { primary: '#3B82F6', accent: '#8B5CF6' },
  'mlm-2': { primary: '#F59E0B', accent: '#EF4444' },
  'studio-1': { primary: '#8B5CF6', accent: '#EC4899' },
  'studio-2': { primary: '#06B6D4', accent: '#EC4899' },
  'fashion-1': { primary: '#FFFFFF', accent: '#D4AF37' },
  'fashion-2': { primary: '#EF4444', accent: '#EC4899' },
  'fashion-3': { primary: '#1A1A1A', accent: '#6B7280' },
  'vid-1': { primary: '#EF4444', accent: '#F97316' },
  'vid-2': { primary: '#06B6D4', accent: '#8B5CF6' },
  'prod-1': { primary: '#3B82F6', accent: '#8B5CF6' },
  'prod-2': { primary: '#06B6D4', accent: '#10B981' },
  'store-1': { primary: '#EF4444', accent: '#F59E0B' },
  'store-2': { primary: '#F59E0B', accent: '#10B981' },
  'agency-1': { primary: '#10B981', accent: '#34D399' },
  'agency-2': { primary: '#8B5CF6', accent: '#EC4899' },
  'travel-1': { primary: '#F97316', accent: '#EC4899' },
  'travel-2': { primary: '#06B6D4', accent: '#3B82F6' },
  'event-1': { primary: '#EC4899', accent: '#8B5CF6' },
  'event-2': { primary: '#D4AF37', accent: '#F59E0B' },
  'pod-1': { primary: '#8B5CF6', accent: '#06B6D4' },
  'pod-2': { primary: '#EF4444', accent: '#F59E0B' },
  'trans-1': { primary: '#3B82F6', accent: '#06B6D4' },
  'trans-2': { primary: '#64748B', accent: '#94A3B8' },
  'sec-1': { primary: '#3B82F6', accent: '#1E40AF' },
  'sec-2': { primary: '#06B6D4', accent: '#8B5CF6' },
};

// Mini preview component that renders a tiny website inside the card
const MiniPreview = ({ template }: { template: WebTemplate }) => {
  const heroImg = HERO_IMAGES[template.category];
  const colors = TEMPLATE_COLORS[template.id] || { primary: '#D4AF37', accent: '#8B5CF6' };
  const isDark = !['scene-clean-saas', 'scene-pastel-soft', 'scene-book-editorial', 'scene-product-showcase', 'scene-brutalist'].includes(template.scene);

  return (
    <div className="mini-preview" style={{ background: isDark ? '#0a0a14' : '#ffffff' }}>
      {/* Mini Nav */}
      <div className="mini-nav" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
        <div className="mini-nav-logo" style={{ color: colors.primary }}>{template.name.split(' ')[0]}</div>
        <div className="mini-nav-links">
          {['Home', 'About', 'Services'].map(l => (
            <span key={l} className="mini-nav-link" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          ))}
          <span className="mini-nav-cta" style={{ background: colors.primary }} />
        </div>
      </div>
      {/* Mini Hero with real image */}
      <div className="mini-hero">
        {heroImg && <img src={heroImg} alt="" className="mini-hero-img" />}
        <div className="mini-hero-overlay" style={{ background: `linear-gradient(135deg, ${isDark ? 'rgba(10,10,20,0.7)' : 'rgba(255,255,255,0.5)'} 0%, transparent 100%)` }} />
        <div className="mini-hero-content">
          <div className="mini-hero-badge" style={{ background: colors.primary + '20', color: colors.primary }}>{CATEGORIES.find(c => c.id === template.category)?.label}</div>
          <div className="mini-hero-title" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>{template.name}</div>
          <div className="mini-hero-subtitle" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>{template.description.substring(0, 40)}...</div>
          <div className="mini-hero-btns">
            <span className="mini-btn-primary" style={{ background: colors.primary }} />
            <span className="mini-btn-secondary" style={{ borderColor: colors.primary + '40' }} />
          </div>
        </div>
      </div>
      {/* Mini sections */}
      <div className="mini-sections">
        <div className="mini-cards-row">
          {[1, 2, 3].map(i => (
            <div key={i} className="mini-card" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <div className="mini-card-icon" style={{ background: colors.primary + '15' }} />
              <div className="mini-card-lines">
                <span style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', width: '60%' }} />
                <span style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

const WebTemplatesGallery = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const matchesSearch = !searchQuery || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const stats = useMemo(() => ({
    totalTemplates: TEMPLATES.length,
    categories: CATEGORIES.length - 1,
    avgRating: (TEMPLATES.reduce((sum, t) => sum + t.rating, 0) / TEMPLATES.length).toFixed(1),
    totalDownloads: TEMPLATES.reduce((sum, t) => sum + t.downloads, 0),
  }), []);

  const openTemplate = (templateId: string) => {
    navigate(`/os/web-templates/${templateId}`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Hero Section ──────────────────────────────────── */}
      <div className="templates-hero relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Integro Web Templates
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Breathtaking Templates
            <br />
            <span className="text-gold">Built to Convert</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Premium website templates across {stats.categories} categories. Each one uniquely designed, 
            mobile-responsive, and ready to launch — powered by StudioWorks.
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { label: 'Templates', value: stats.totalTemplates, icon: LayoutGrid },
              { label: 'Categories', value: stats.categories, icon: Filter },
              { label: 'Avg Rating', value: `${stats.avgRating}★`, icon: Star },
              { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="stat-card flex items-center gap-3 px-5 py-3">
                <stat.icon className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <div className="text-sm font-bold">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Search Bar ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-xl mx-auto"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search templates by name, category, or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </motion.div>

      {/* ── Category Filter ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`category-pill flex items-center gap-2 ${activeCategory === cat.id ? 'active' : 'bg-card text-muted-foreground hover:text-foreground hover:border-primary/20'}`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── Results Count ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredTemplates.length}</span> templates
          {activeCategory !== 'all' && (
            <> in <span className="font-bold text-primary">{CATEGORIES.find(c => c.id === activeCategory)?.label}</span></>
          )}
        </p>
      </div>

      {/* ── Templates Grid ────────────────────────────────── */}
      <div className="templates-grid">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="template-card group"
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              {/* Preview Scene */}
              <div className="template-preview-wrapper">
                {/* Featured Badge */}
                {template.featured && (
                  <div className="featured-badge">★ Featured</div>
                )}
                {/* Price Badge */}
                <div className="price-badge">R{template.price}</div>

                {/* Mini Website Preview */}
                <MiniPreview template={template} />

                {/* Hover Overlay */}
                <div className="template-overlay">
                  <div className="template-actions">
                    <button
                      onClick={() => openTemplate(template.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all"
                    >
                      <Rocket className="w-4 h-4" />
                      Use Template
                    </button>
                    <button
                      onClick={() => openTemplate(template.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all backdrop-blur-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="template-info">
                <h3 className="text-foreground">{template.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="template-category-tag text-muted-foreground">
                    {CATEGORIES.find(c => c.id === template.category)?.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-xs font-bold text-foreground">{template.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">({template.downloads.toLocaleString()})</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{template.description}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/70 font-medium border border-primary/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Empty State ───────────────────────────────────── */}
      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">No templates found</h3>
          <p className="text-muted-foreground text-sm">
            Try adjusting your search or category filter.
          </p>
        </motion.div>
      )}

      {/* ── CTA Section ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 glass-sovereign-card rounded-2xl p-10 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative z-10">
          <h2 className="font-serif text-2xl font-bold mb-3">
            Need a Custom Template?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Our StudioWorks team can design a fully bespoke website template tailored to your brand,
            industry, and vision. Premium quality, built by WCCCS.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Zap className="w-4 h-4" />
              Request Custom Design
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:border-primary/30 transition-all">
              <Globe className="w-4 h-4" />
              View Portfolio
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WebTemplatesGallery;

