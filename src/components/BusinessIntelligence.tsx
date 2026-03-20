import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Search, TrendingUp, Users, Target, Eye, Download, Lightbulb, AlertCircle, Zap, UserPlus, Loader2, Brain } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { generateMarketAnalysis, findNeuralProspects } from '@/lib/ai';

const BusinessIntelligence = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [researchData, setResearchData] = useState({
    business: '',
    industry: '',
    location: '',
    competitors: '',
    targetAudience: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [isProspecting, setIsProspecting] = useState(false);

  const researchCategories = [
    {
      id: 'market',
      title: 'Market Research',
      description: 'Industry trends, market size, and growth opportunities',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'competitor',
      title: 'Competitor Analysis',
      description: 'Detailed analysis of your competition and their strategies',
      icon: Target,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'audience',
      title: 'Audience Insights',
      description: 'Demographics, behaviors, and preferences of your target market',
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'niche',
      title: 'Niche Optimization',
      description: 'Find untapped opportunities and positioning strategies',
      icon: Lightbulb,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleAnalysis = async () => {
    if (!researchData.business || !researchData.industry) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and industry",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Primary: Edge Function
      let data, error;
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const res = await supabase.functions.invoke('analyze-market', {
          body: {
            business: researchData.business,
            industry: researchData.industry,
            location: researchData.location,
            targetAudience: researchData.targetAudience,
            competitors: researchData.competitors?.split(',').map(c => c.trim())
          }
        });
        data = res.data;
        error = res.error;
      } catch (e) {
        console.warn('Edge Function unreachable, falling back to local intelligence');
        error = true;
      }

      if (error) {
        // Fallback: Local Intelligence
        const analysis = await generateMarketAnalysis(
          researchData.business,
          researchData.industry,
          researchData.location || 'Global',
          researchData.targetAudience || 'General',
          researchData.competitors?.split(',').map(c => c.trim()) || []
        );
        setAnalysisResults(analysis);
      } else {
        setAnalysisResults(data.analysis);
      }
      setActiveTab('results');

      toast({
        title: "Analysis Complete",
        description: "Your market research report is ready",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProspecting = async () => {
    if (!researchData.business || !researchData.industry) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and industry",
        variant: "destructive",
      });
      return;
    }

    setIsProspecting(true);
    try {
      // Primary: Edge Function
      let data, error;
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const res = await supabase.functions.invoke('prospect-finder', {
          body: {
            business: researchData.business,
            industry: researchData.industry,
            targetAudience: researchData.targetAudience,
            niche: researchData.industry
          }
        });
        data = res.data;
        error = res.error;
      } catch (e) {
        console.warn('Edge Function unreachable, falling back to local prospecting');
        error = true;
      }

      if (error) {
        // Fallback: Local Intelligence
        const foundProspects = await findNeuralProspects(
          researchData.business,
          researchData.industry,
          researchData.targetAudience || 'General'
        );
        setProspects(foundProspects);
      } else {
        setProspects(data.prospects || []);
      }
      setActiveTab('prospecting');
      toast({
        title: "Intelligence Gathered",
        description: "10 high-intent prospects identified",
      });
    } catch (error) {
      console.error('Prospecting error:', error);
      toast({
        title: "Prospecting Failed",
        description: "Connectivity issue encountered",
        variant: "destructive",
      });
    } finally {
      setIsProspecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted border border-border grid w-full grid-cols-6">
          <TabsTrigger value="leads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif">Inbound Leads</TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif">Setup</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!researchData.business} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif">Analysis</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResults} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif">Results</TabsTrigger>
          <TabsTrigger value="prospecting" disabled={!analysisResults} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif">Prospecting</TabsTrigger>
          <TabsTrigger value="reports" disabled={!analysisResults} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <Card className="bg-card/30 border-primary/20 glass">
            <CardHeader>
              <CardTitle className="font-serif text-2xl flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Inbound Sales CRM
              </CardTitle>
              <CardDescription>Real-time leads routed from connected Headless CMS nodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Sarah Jenkins', company: 'TechFlow Inc.', intent: 92, source: 'WCCCS.global Form', date: '2 mins ago', summary: 'Requested enterprise consulting for Q3 planning.' },
                  { name: 'Marcus Adebayo', company: 'Lagos Dynamics', intent: 88, source: 'AfroISO Landing', date: '1 hour ago', summary: 'Downloaded the ISO readiness playbook.' },
                  { name: 'Elena Rostova', company: 'Global Ventures', intent: 45, source: 'StudioWorks Contact', date: '5 hours ago', summary: 'General inquiry about pricing.' }
                ].map((lead, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-accent/5 border border-border/50 hover:bg-accent/10 transition-colors">
                    <div className="space-y-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{lead.name}</span>
                        <span className="text-muted-foreground text-sm">@ {lead.company}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{lead.summary}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">{lead.source}</Badge>
                        <span className="text-xs text-muted-foreground">{lead.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${lead.intent > 80 ? 'bg-emerald-500/10 text-emerald-500 border-none' : 'bg-amber-500/10 text-amber-500 border-none'} flex gap-1 items-center`}>
                        <Brain className="w-3 h-3" />
                        AI Score: {lead.intent}
                      </Badge>
                      <Button size="sm" className="gradient-primary">Engage Lead</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {researchCategories.map(category => (
              <Card key={category.id} className="bg-card/50 border-border/50 glass hover:-translate-y-1 transition-all group">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-accent/5 border border-border group-hover:border-primary/50 transition-colors">
                    <category.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={researchData.business}
                    onChange={(e) => setResearchData(prev => ({ ...prev, business: e.target.value }))}
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input
                    value={researchData.industry}
                    onChange={(e) => setResearchData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalysis}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isAnalyzing || !researchData.business}
          >
            {isAnalyzing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
            Initiate Intelligence Analysis
          </Button>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardContent className="pt-20 pb-20 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h3 className="text-xl font-bold">Synchronizing Neural Channels...</h3>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisResults && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-card/50 border-border/50 glass text-center p-6">
                  <div className="text-2xl font-bold text-primary font-serif">{analysisResults.marketSize}</div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Market Size</p>
                </Card>
                <Card className="bg-card/50 border-border/50 glass text-center p-6">
                  <div className="text-2xl font-bold text-blue-400 font-serif">{analysisResults.growthRate}</div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Velocity</p>
                </Card>
                <Card className="bg-card/50 border-border/50 glass text-center p-6">
                  <div className="text-2xl font-bold text-primary font-serif">{analysisResults.competitorCount}</div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Competitors</p>
                </Card>
                <Card className="bg-card/50 border-border/50 glass text-center p-6">
                  <div className="text-2xl font-bold text-emerald-500 font-serif">{analysisResults.marketAttractiveness}/10</div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">BEAST Grade</p>
                </Card>
              </div>

              {analysisResults.automationHotspots && (
                <Card className="bg-primary/5 border-primary/20 glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                      <Zap className="h-4 w-4 text-primary animate-pulse" />
                      Automation Hotspots
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {analysisResults.automationHotspots.map((spot: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-primary/20 text-foreground">{spot}</Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/30 border-border/50 glass p-6 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Opportunities
                  </h3>
                  <div className="space-y-2">
                    {analysisResults.opportunities.map((opt: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full" /> {opt}
                      </p>
                    ))}
                  </div>
                </Card>
                <Card className="bg-card/30 border-border/50 glass p-6 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Threats
                  </h3>
                  <div className="space-y-2">
                    {analysisResults.threats.map((t: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full" /> {t}
                      </p>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="flex justify-center pt-8">
                <Button onClick={handleProspecting} disabled={isProspecting} className="h-14 px-12 gradient-primary border-none text-white font-bold hover:scale-105 transition-transform">
                  {isProspecting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <UserPlus className="w-5 h-5 mr-3" />}
                  Deploy Prospecting Agent
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="prospecting" className="space-y-6">
          <Card className="bg-card/30 border-primary/20 glass">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Neural Prospecting Results</CardTitle>
              <CardDescription>High-intent targets identified for autonomous outreach</CardDescription>
            </CardHeader>
            <CardContent>
              {prospects.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {prospects.map((prospect, i) => (
                    <Card key={i} className="bg-background/40 border-border/50 p-6 space-y-4 group hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold group-hover:text-primary transition-colors">{prospect.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{prospect.role}</p>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none">{prospect.intentScore}% Intent</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{prospect.whyHighIntent}"</p>
                      <div className="pt-4 border-t border-border/30">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Agentic Strategy</div>
                        <p className="text-xs font-semibold">{prospect.suggestedReachout}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center opacity-50 space-y-4">
                  <Brain className="w-12 h-12 mx-auto" />
                  <p className="uppercase tracking-[0.3em] text-[10px] font-bold">Awaiting Agent Deployment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-card/50 border-border/50 glass p-12 text-center space-y-6">
            <Download className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-bold font-serif">Export Commercial Intel</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Executive PDF', icon: Download },
                { label: 'Market XLSX', icon: BarChart3 },
                { label: 'Strategic Deck', icon: Target },
                { label: 'Raw JSON', icon: Brain }
              ].map((btn, i) => (
                <Button key={i} variant="outline" className="h-20 flex-col gap-2 border-border/50 hover:border-primary/50 text-[10px] uppercase tracking-widest font-bold">
                  <btn.icon className="w-4 h-4 text-primary" />
                  {btn.label}
                </Button>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default BusinessIntelligence;