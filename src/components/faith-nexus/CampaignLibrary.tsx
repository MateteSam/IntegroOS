import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Eye, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const CampaignLibrary = () => {
    const assets = [
        {
            id: 'poster',
            name: 'Launch Poster',
            type: 'Print / Digital',
            size: '2048x2048',
            url: '/marketing/launch-2026/launch_poster.png',
            description: 'High-fidelity cinematic poster for print or large displays.'
        },
        {
            id: 'banner',
            name: 'Social Banner',
            type: 'Facebook / Twitter',
            size: '1500x500',
            url: '/marketing/launch-2026/social_banner.png',
            description: 'Universal banner for social media profiles.'
        },
        {
            id: 'instagram',
            name: 'Instagram Post',
            type: 'Social Content',
            size: '1080x1080',
            url: '/marketing/launch-2026/instagram_post.png',
            description: 'Square marketing asset for Instagram and Facebook feeds.'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn Banner',
            type: 'Professional',
            size: '1584x396',
            url: '/marketing/launch-2026/linkedin_banner.png',
            description: 'Refined professional banner for LinkedIn profiles.'
        }
    ];

    const handleDownload = (url: string, name: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name.toLowerCase().replace(/\s+/g, '_')}_faith_nexus.png`;
        link.click();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-playfair font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                        Campaign Asset Library
                    </h2>
                    <p className="text-slate-400 text-sm">Synchronized marketing collateral for the May 2nd Virtual Launch.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Press Kit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {assets.map((asset, index) => (
                    <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="glass-sovereign overflow-hidden border-white/10 hover:border-amber-500/40 transition-all group flex flex-col h-full bg-slate-900/40 backdrop-blur-xl">
                            <div className="aspect-square relative overflow-hidden bg-slate-950">
                                <img
                                    src={asset.url}
                                    alt={asset.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0 rounded-full border-white/20 bg-black/40"
                                        onClick={() => window.open(asset.url, '_blank')}
                                    >
                                        <Eye className="h-4 w-4 text-white" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-9 w-9 p-0 rounded-full bg-amber-500 hover:bg-amber-600 text-black border-none"
                                        onClick={() => handleDownload(asset.url, asset.name)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-[10px] uppercase tracking-widest px-2">
                                        {asset.size}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-1 mb-4">
                                    <h4 className="font-playfair font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">{asset.name}</h4>
                                    <p className="text-[10px] text-amber-500/80 uppercase tracking-widest font-bold">{asset.type}</p>
                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-2">{asset.description}</p>
                                </div>
                                <Button
                                    variant="secondary"
                                    className="w-full text-xs h-9 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                    onClick={() => handleDownload(asset.url, asset.name)}
                                >
                                    Download Asset
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Campaign Guidelines Section */}
            <Card className="glass-sovereign border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                    <CardTitle className="text-lg font-playfair text-amber-400">Launch Identity Protocol</CardTitle>
                    <CardDescription className="text-slate-400">Strategic guidelines for May 2nd orchestration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Core Narrative</h5>
                            <p className="text-sm text-white font-medium">Roots. Revelation. Renaissance.</p>
                            <p className="text-xs text-slate-400 italic">Restore excellence as the hallmark of Kingdom creativity.</p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Visual Foundation</h5>
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded bg-[#020617] border border-white/10" title="Sovereign Blue" />
                                <div className="w-6 h-6 rounded bg-[#C5A059] border border-white/10" title="Kingdom Gold" />
                                <div className="w-6 h-6 rounded bg-[#0EA5E9] border border-white/10" title="Sky Blue" />
                            </div>
                            <p className="text-xs text-slate-400">Sovereign Luxury & Art Deco Geometric Precision.</p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Digital Hub</h5>
                            <p className="text-sm text-white font-bold tracking-tight">faithnexus.digital</p>
                            <p className="text-xs text-slate-400 italic">Primary gateway for all launch registrations.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CampaignLibrary;
