import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen, Sparkles, PenTool, Layout, Download, ChevronRight,
    FileText, Palette, Printer, Globe, Image, Layers, BookMarked,
    Package, Eye, Wand2, ArrowRight, Rocket, BookCopy, ExternalLink,
    MonitorPlay, LayoutGrid, File
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// ONIXONE AI STUDIO — Publishing & Design Command Centre
// Integrated into Integro OS as the professional publishing node
// ═══════════════════════════════════════════════════════════════

const CAPABILITIES = [
  { icon: PenTool, title: 'Rich Text Editor', desc: 'Professional typesetting with InDesign-level control — margins, bleeds, columns, DPI settings', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: BookMarked, title: 'Jacket Designer', desc: 'Full book jacket editor — front cover, spine, back cover with ISBN barcode generation', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Palette, title: 'Theme Engine', desc: '30+ interior layout themes with custom typography, spacing, and decorative elements', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Sparkles, title: 'AI Content Intelligence', desc: 'Gemini-powered synopsis generator, blurb writer, keyword extractor, and audience analyzer', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: MonitorPlay, title: '3D Mockup Preview', desc: 'Real-time hardback and paperback book mockups for marketing and social media', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Package, title: 'KDP Export Engine', desc: 'Amazon KDP-ready PDF export with trim sizes, bleed marks, and spine calculator', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Globe, title: 'Distribution Panel', desc: 'One-click distribution to Amazon, IngramSpark, Apple Books, Kobo, and Google Play', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Layers, title: 'Page Architecture', desc: 'Drag-and-drop page management — insert, reorder, delete with grid/list views', color: 'text-teal-400', bg: 'bg-teal-500/10' },
];

const QUICK_ACTIONS = [
  { label: 'New Book Project', icon: BookOpen, desc: 'Start from blank or import a manuscript', primary: true },
  { label: 'Import PDF', icon: File, desc: 'Upload an existing PDF to edit and enhance' },
  { label: 'Import Text', icon: FileText, desc: 'Paste or upload plain text or Word docs' },
  { label: 'Cover Templates', icon: Image, desc: 'Browse professional cover designs' },
];

const RECENT_TEMPLATES = [
  { title: 'Novel (6x9)', pages: 300, style: 'Classic Serif', icon: '📖' },
  { title: 'Business Book', pages: 200, style: 'Modern Clean', icon: '📊' },
  { title: "Children's Picture", pages: 32, style: 'Illustrated', icon: '🎨' },
  { title: 'Poetry Collection', pages: 80, style: 'Elegant Minimal', icon: '✍️' },
  { title: 'Cookbook', pages: 150, style: 'Magazine Grid', icon: '🍳' },
  { title: 'Technical Manual', pages: 400, style: 'Documentation', icon: '⚙️' },
];

const BookArchitectStudio = () => {
  const [hoveredCapability, setHoveredCapability] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-900/10">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-serif font-bold text-foreground">
                  ONIX<span className="text-cyan-400">one</span>
                </h2>
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] uppercase tracking-widest font-bold">
                  AI Studio
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Professional Publishing & Book Design Engine — From manuscript to global distribution
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border hover:bg-accent/5 gap-2">
            <ExternalLink className="w-4 h-4" />
            Launch Full Studio
          </Button>
          <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] gap-2">
            <Rocket className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Engine Status', value: 'ONLINE', color: 'text-emerald-400', dot: 'bg-emerald-400' },
          { label: 'Supported Formats', value: 'PDF · EPUB · KDP', color: 'text-cyan-400' },
          { label: 'Distribution', value: '5 Platforms', color: 'text-purple-400' },
          { label: 'AI Model', value: 'Gemini Pro', color: 'text-amber-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card/30 border border-border/50 backdrop-blur-sm p-5 rounded-xl"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">{s.label}</div>
            <div className={cn("text-lg font-bold flex items-center gap-2", s.color)}>
              {s.dot && <span className={cn("w-2 h-2 rounded-full animate-pulse", s.dot)} />}
              {s.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action, i) => (
          <motion.button key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
            className={cn(
              "text-left p-5 rounded-xl border transition-all group",
              action.primary
                ? "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-900/10"
                : "bg-card/20 border-border/50 hover:bg-card/40 hover:border-border"
            )}
          >
            <action.icon className={cn("w-6 h-6 mb-3", action.primary ? "text-cyan-400" : "text-muted-foreground group-hover:text-foreground")} />
            <div className={cn("font-bold text-sm mb-1", action.primary ? "text-cyan-300" : "text-foreground")}>{action.label}</div>
            <div className="text-xs text-muted-foreground">{action.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* ── Capabilities Grid ───────────────────────────── */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 px-1">Studio Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((cap, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
              onMouseEnter={() => setHoveredCapability(i)}
              onMouseLeave={() => setHoveredCapability(null)}
              className={cn(
                "p-5 rounded-xl border border-border/50 transition-all cursor-default group",
                hoveredCapability === i ? "bg-card/50 border-border shadow-lg" : "bg-card/20"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110", cap.bg)}>
                <cap.icon className={cn("w-5 h-5", cap.color)} />
              </div>
              <h4 className="font-bold text-sm text-foreground mb-1">{cap.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Project Templates ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Quick Start Templates</h3>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 hover:text-foreground">
            View All <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {RECENT_TEMPLATES.map((tmpl, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + i * 0.05 }}
              className="p-4 rounded-xl bg-card/20 border border-border/50 hover:bg-card/40 hover:border-border transition-all cursor-pointer group text-center"
            >
              <div className="text-3xl mb-2">{tmpl.icon}</div>
              <div className="font-bold text-xs text-foreground mb-0.5">{tmpl.title}</div>
              <div className="text-[10px] text-muted-foreground">{tmpl.pages} pages</div>
              <div className="text-[10px] text-muted-foreground/50">{tmpl.style}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Integration Banner ──────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="relative overflow-hidden rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5 p-8">
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/5 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-serif font-bold text-foreground mb-2">
              Ecosystem Integration
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ONIXone connects with <strong className="text-foreground">IntegroMail</strong> for bulk marketing, 
              <strong className="text-foreground"> WebStudio</strong> for author landing pages, and 
              <strong className="text-foreground"> StudioWorks</strong> for book trailer production. 
              Your entire publishing pipeline — from manuscript to market — in one ecosystem.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button variant="outline" className="text-xs border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 gap-1.5">
              <BookCopy className="w-3.5 h-3.5" /> Publishing Pipeline
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookArchitectStudio;
