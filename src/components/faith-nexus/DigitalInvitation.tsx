import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Send, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export const DigitalInvitation = () => {
    const [email, setEmail] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'success'>('idle');
    const cardRef = useRef<HTMLDivElement>(null);

    const handleRsvp = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => setRsvpStatus('success'), 1000);
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#080808', // Match card background
                scale: 2, // Retina quality
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = 'Faith_Nexus_Invitation_2026.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to generate image:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1a237e]/10 rounded-full blur-[120px]" />
            </div>

            {/* Actions Bar */}
            <div className="relative z-20 mb-8 flex gap-4">
                <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10"
                >
                    <Download className="mr-2 h-4 w-4" /> Download for Email
                </Button>
            </div>

            {/* Main Invitation Card */}
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-2xl w-full"
            >
                {/* Art Deco Border Container */}
                <div className="relative bg-[#080808] border border-[#C5A059]/30 p-1 md:p-2 shadow-2xl shadow-black/50">
                    {/* Inner Decorative Border */}
                    <div className="border border-[#C5A059]/20 p-6 md:p-12 relative overflow-hidden">

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#C5A059] opacity-60" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#C5A059] opacity-60" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#C5A059] opacity-60" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#C5A059] opacity-60" />

                        {/* Content */}
                        <div className="text-center space-y-6 relative z-10 flex flex-col items-center">

                            {/* Logo/Branding - Maximized Impact */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="mb-2 relative"
                            >
                                <div className="absolute inset-0 bg-[#C5A059]/20 blur-[50px] rounded-full scale-110 animate-pulse" />
                                <img
                                    src="/images/branding/summit/faith_nexus_2026_logo_3d.png"
                                    alt="Faith Nexus 2026"
                                    className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl relative z-10"
                                />
                            </motion.div>

                            {/* Invitation Text */}
                            <div className="space-y-4 max-w-lg">
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-5xl md:text-7xl text-[#C5A059] font-playfair italic tracking-wide"
                                    style={{ textShadow: '0 4px 20px rgba(197, 160, 89, 0.4)' }}
                                >
                                    You're Invited
                                </motion.h2>

                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                    className="h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto opacity-60 w-32"
                                />

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-2xl md:text-3xl font-bold text-white uppercase tracking-[0.2em] leading-relaxed"
                                >
                                    VIP Virtual Launch
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="text-slate-300 font-light text-lg tracking-wider"
                                >
                                    Join the studio audience for the historic unveiling.
                                </motion.p>
                            </div>

                            {/* Details Grid - Premium Box */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="w-full grid md:grid-cols-2 gap-4 py-8 relative"
                            >
                                <div className="absolute inset-0 bg-white/5 border-y border-white/10 -mx-6 md:-mx-12" />

                                <div className="relative z-10 flex flex-col items-center p-4">
                                    <div className="text-[#C5A059] mb-2">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <p className="text-white font-playfair font-bold text-2xl">May 02</p>
                                    <p className="text-slate-400 text-sm uppercase tracking-widest mt-1">2026 • Saturday</p>
                                </div>
                                <div className="relative z-10 flex flex-col items-center p-4 border-l border-white/10">
                                    <div className="text-[#C5A059] mb-2">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <p className="text-white font-playfair font-bold text-2xl">7:00 PM</p>
                                    <p className="text-slate-400 text-sm uppercase tracking-widest mt-1">GMT • Live</p>
                                </div>
                            </motion.div>

                            {/* Website Link Footer (Visible in Export) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="pt-2 pb-4"
                            >
                                <div className="inline-flex items-center gap-2 px-6 py-2 border border-[#C5A059]/30 rounded-full bg-[#C5A059]/5 backdrop-blur-sm">
                                    <span className="text-[#C5A059] uppercase text-xs font-bold tracking-[0.2em]">RSVP & Info</span>
                                    <span className="text-white font-playfair italic pr-1">at</span>
                                    <span className="text-white font-bold tracking-wider">faithnexus.digital</span>
                                </div>
                            </motion.div>

                            {/* Interactive RSVP (Hidden in Capture if needed, but keeping for visual completeness) */}
                            <div className="pt-2 max-w-md w-full mx-auto" data-html2canvas-ignore>
                                {rsvpStatus === 'success' ? (
                                    <div className="text-center p-4 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-lg">
                                        <p className="text-[#C5A059] font-medium">RSVP Confirmed</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRsvp} className="flex gap-2">
                                        <Input
                                            type="email"
                                            placeholder="Your Email Address"
                                            className="bg-white/5 border-white/10 text-white h-10 text-sm"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Button type="submit" className="bg-[#C5A059] text-black hover:bg-[#d4af37] font-bold h-10 px-6 text-xs uppercase tracking-widest">
                                            Confirm
                                        </Button>
                                    </form>
                                )}
                            </div>

                        </div>

                        {/* Decorative Background Texture */}
                        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #C5A059 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
