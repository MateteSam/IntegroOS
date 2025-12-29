import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, BarChart3, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  const [stats, setStats] = useState([
    {
      label: 'Strategic Assets',
      value: '...',
      change: '+0%',
      icon: ShieldCheck,
      color: 'text-primary',
      description: 'Verified brand deployments'
    },
    {
      label: 'Intelligence Score',
      value: '...',
      change: '+0%',
      icon: Zap,
      color: 'text-blue-400',
      description: 'Market alignment depth'
    },
    {
      label: 'Market Reach',
      value: '...',
      change: '+0%',
      icon: Users,
      color: 'text-success',
      description: 'Unique neural connections'
    },
    {
      label: 'Strategy Depth',
      value: '...',
      change: '+0%',
      icon: BarChart3,
      color: 'text-amber-500',
      description: 'Active 2026 playbooks'
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch Real Data from Supabase
        const { count: assetsCount } = await supabase
          .from('ai_generations')
          .select('*', { count: 'exact', head: true })
          .eq('generation_type', 'brand_assets');

        const { count: strategyCount } = await supabase
          .from('ai_generations')
          .select('*', { count: 'exact', head: true })
          .eq('generation_type', 'strategy');

        const { data: analyticsData } = await supabase
          .from('ai_generations')
          .select('result')
          .eq('generation_type', 'market_analysis')
          .order('created_at', { ascending: false })
          .limit(1);

        const marketAnalysis = analyticsData?.[0]?.result as any;
        const marketReach = marketAnalysis?.marketSize || '1.2M';
        const intelligenceScore = marketAnalysis?.marketAttractiveness
          ? (marketAnalysis.marketAttractiveness * 10).toFixed(1)
          : '98.2';

        setStats(prev => [
          { ...prev[0], value: String(assetsCount || 0) },
          { ...prev[1], value: intelligenceScore },
          { ...prev[2], value: marketReach },
          { ...prev[3], value: String(strategyCount || 0) }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="bg-card border-border/50 glass hover-lift group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-accent/5 border border-border group-hover:border-primary/30 transition-colors ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-success flex items-center gap-1">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><TrendingUp className="w-3 h-3" /> {stat.change}</>}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">{stat.label}</p>
                <p className="text-3xl font-serif font-bold text-foreground tracking-tight">
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-medium">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
