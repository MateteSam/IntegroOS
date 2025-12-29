import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap, TrendingUp, Sparkles, Wand2, LayoutGrid, PenTool, Image as ImageIcon, LineChart, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { saveGoogleKeyToLocalStorage } from "@/lib/aiClient";
import { DashboardStats } from '@/components/DashboardStats';

const StrategicInsights = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('ai_generations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (data && data.length > 0) {
          const formatted = data.map(gen => {
            const res = (gen.result as any) || {};
            if (gen.generation_type === 'market_analysis') {
              return {
                title: 'Market Intelligence Update',
                desc: res.keyTrends?.[0] || `Velocity: ${res.growthRate || 'Stable'}`,
                type: 'positive'
              };
            }
            if (gen.generation_type === 'strategy') {
              return {
                title: 'Strategic Playbook Synchronized',
                desc: (res.overview?.substring(0, 60) || 'Deployment overview synchronized') + '...',
                type: 'neutral'
              };
            }
            return {
              title: 'Neural Asset Generated',
              desc: `New ${gen.generation_type} deployment successful`,
              type: 'neutral'
            };
          });
          setInsights(formatted);
        } else {
          setInsights([
            { title: 'Neural Initialization', desc: 'Awaiting first strategic deployment...', type: 'neutral' },
            { title: 'Command Center Ready', desc: 'Secure connection established', type: 'positive' }
          ]);
        }
      } catch (e) {
        console.error('Failed to fetch insights:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      {insights.map((insight, i) => (
        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/20 transition-all group cursor-default">
          <div className={`w-2 h-2 rounded-full ${insight.type === 'positive' ? 'bg-success' :
            insight.type === 'alert' ? 'bg-destructive' : 'bg-primary'
            } glow`} />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{insight.title}</p>
            <p className="text-xs text-muted-foreground">{insight.desc}</p>
          </div>
          <TrendingUp className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
        </div>
      ))}
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSettingsClick = () => {
    const existing = localStorage.getItem('GOOGLE_API_KEY') || '';
    const key = window.prompt('Enter your Google API key for Gemini (stored locally in your browser):', existing);
    if (!key) return;
    saveGoogleKeyToLocalStorage(key.trim());
    toast({
      title: 'AI key saved',
      description: 'Your Google API key was saved in this browser. You can change it anytime from Settings.',
    });
  };

  const modules = [
    {
      id: 'media-foundry',
      title: 'Media Foundry',
      description: 'Visual synthesis, high-fidelity asset generation, and cinematic motion lab.',
      icon: ImageIcon,
      path: '/os/media',
      color: 'from-violet-500 via-purple-500 to-pink-500',
    },
    {
      id: 'content-nexus',
      title: 'Content Nexus',
      description: 'Book creation protocol, marketing asset forge, and digital presence deployment.',
      icon: PenTool,
      path: '/os/content',
      color: 'from-indigo-500 via-blue-500 to-cyan-500',
    },
    {
      id: 'strategic-intelligence',
      title: 'Strategic Intel',
      description: 'Market research, competitor analysis, and automated business strategy.',
      icon: LineChart,
      path: '/os/intelligence',
      color: 'from-emerald-500 to-blue-500',
    },
    {
      id: 'automation-suite',
      title: 'Automation Suite',
      description: 'Intelligent business processes: CRM, lead gen, and campaign orchestration.',
      icon: Zap,
      path: '/os/automation',
      color: 'from-orange-500 to-red-500',
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" />

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20 relative z-10">
        <div className="space-y-24">
          <section className="relative py-12 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-bold mb-8">
              <Sparkles className="w-3 h-3" />
              Intelligence Orchestration
            </div>
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-foreground mb-8 leading-[1.1]">
              Master Your <br />
              <span className="text-gold">Commercial Identity</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12">
              Harness elite AI modeling to analyze, strategize, and execute
              market-dominating campaigns with clinical precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground font-bold px-8 h-14 hover-lift glow-gold border-none"
                onClick={() => navigate('/os/media')}
              >
                <Wand2 className="w-5 h-5 mr-3" />
                Initialize Studio
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border bg-card text-foreground h-14 px-8 hover:bg-accent/10 hover-glow transition-all"
                onClick={handleSettingsClick}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Button>
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground">Live Infrastructure Status</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <DashboardStats />
          </section>

          <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-serif font-bold text-foreground">Capability Portfolio</h3>
                <p className="text-muted-foreground">Select an execution vector to begin orchestration</p>
              </div>
              <div className="flex gap-2">
                {['Standard', 'Advanced', 'Elite'].map(view => (
                  <Button
                    key={view}
                    variant="ghost"
                    size="sm"
                    className={`text-[10px] uppercase tracking-widest font-bold ${view === 'Elite' ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {view}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card
                    key={module.id}
                    className="group bg-card/30 border-border/50 hover:border-primary/40 transition-all duration-500 cursor-pointer overflow-hidden relative glass flex flex-col"
                    onClick={() => navigate(module.path)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <CardHeader className="p-8 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-accent/5 border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
                        <IconComponent className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardTitle className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors transition-opacity">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <div className="px-8 pb-8 mt-auto relative z-10">
                      <div className="h-1 w-full bg-accent/10 rounded-full overflow-hidden">
                        <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-primary to-primary/40 transition-all duration-700" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-accent/5 to-transparent p-1">
            <div className="bg-card rounded-[calc(1.5rem-1px)] p-8 lg:p-12 relative overflow-hidden">
              <span className="ghost-text -right-20 -bottom-10">INTEL</span>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
                      <Brain className="w-8 h-8 text-primary" />
                      Strategic Intelligence
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Continuous neural analysis of global market trends, sentiment patterns,
                      and competitive maneuvers to refine your tactical positioning.
                    </p>
                  </div>
                  <StrategicInsights />
                </div>
                <div className="hidden lg:block relative">
                  <div className="aspect-square rounded-full border-[16px] border-muted flex items-center justify-center p-12">
                    <div className="w-full h-full rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center relative glow-gold">
                      <div className="absolute inset-4 rounded-full border border-primary/30 animate-spin" style={{ animationDuration: '10s' }} />
                      <Brain className="w-20 h-20 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-sm font-serif font-bold text-foreground tracking-widest uppercase">Sovereign Intel v2.0.4</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Distributed Neural Orchestration Layer</p>
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Protocol</a>
            <a href="#" className="hover:text-primary transition-colors">Encryption</a>
            <a href="#" className="hover:text-primary transition-colors">Nodes</a>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            © 2024 Sovereign Marketing Group
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
