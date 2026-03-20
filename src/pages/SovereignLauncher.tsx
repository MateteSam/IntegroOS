import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Camera,
    Mic,
    Video as VideoIcon,
    Globe,
    ChevronDown,
    Zap,
    MessageSquare,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Magnetic Button Component
const MagneticButton = ({ children, className, ...props }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const x = clientX - centerX;
        const y = clientY - centerY;
        setPosition({ x: x * 0.4, y: y * 0.4 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={cn("inline-block", className)}
        >
            {children}
        </motion.div>
    );
};

const SovereignLauncher = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // 3D Morphing Transforms
    const cameraScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
    const cameraOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
    const fragmentsScale = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
    const fragmentsOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.4], [0, 1, 1]);

    const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // Spring-smoothed scroll for fragments
    const fragmentY = useSpring(useTransform(scrollYProgress, [0.2, 0.8], [200, -200]), {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div ref={containerRef} className="relative min-h-[400vh] bg-[#0A0F1A] text-white">
            {/* Phase 1: The Cinematic Hero (0-20% Scroll) */}
            <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/branding/summit/creator_portal_hero_v1.png"
                        alt="Creator Portal"
                        className="w-full h-full object-cover opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1A]/80 via-transparent to-[#0A0F1A]" />

                    {/* Floating Light Particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0.2, 0.5, 0.2],
                                    scale: [1, 1.2, 1],
                                    x: [0, Math.random() * 100 - 50, 0],
                                    y: [0, Math.random() * 100 - 50, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 5 + 5,
                                    repeat: Infinity,
                                    delay: Math.random() * 5
                                }}
                                className="absolute w-1 h-1 bg-primary rounded-full blur-[2px]"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content Layer */}
                <div className="container relative z-20 flex flex-col items-center text-center">
                    <motion.div style={{ scale: cameraScale, opacity: cameraOpacity }} className="mb-12">
                        {/* Circular Nexus Globe Anchor */}
                        <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8">
                            <motion.img
                                src="/images/branding/summit/nexus-globe-v3.png"
                                alt="Faith Nexus Globe"
                                className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.4)]"
                                animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    </motion.div>

                    <motion.div style={{ y: titleY, opacity: titleOpacity }} className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md mb-4">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">The Global Virtual Activation</span>
                        </div>

                        <h1 className="text-6xl md:text-9xl font-serif font-black leading-none tracking-tighter text-white">
                            ROOTS. <br />
                            <span className="text-gold">REVELATION.</span> <br />
                            RENAISSANCE.
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed mt-8">
                            Join Africa's elite creators for a cinematic synthesis of Faith, Media, and Sovereign Intelligence.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-12">
                            <MagneticButton>
                                <Button size="lg" className="h-16 px-12 text-lg bg-primary hover:bg-gold-600 transition-all font-bold rounded-full shadow-[0_20px_50px_rgba(212,175,55,0.3)]">
                                    Initialize Launch
                                </Button>
                            </MagneticButton>
                            <MagneticButton>
                                <Button size="lg" variant="outline" className="h-16 px-12 text-lg border-white/20 text-white hover:bg-white/5 font-bold rounded-full backdrop-blur-sm">
                                    View The Blueprint
                                </Button>
                            </MagneticButton>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
                >
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Scroll to Evolve</span>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ChevronDown className="w-6 h-6" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Phase 2: The Evolved Fragments (20-60% Scroll) */}
            <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none">
                <motion.div
                    style={{ scale: fragmentsScale, opacity: fragmentsOpacity }}
                    className="container relative z-30"
                >
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Fragment 1: The Visionary (Camera) */}
                        <motion.div style={{ y: fragmentY }} className="group relative">
                            <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="p-8 glass-sovereign border-white/10 rounded-3xl space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Camera className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold">The Visionary</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Orchestrating high-fidelity visual narratives that define the new Digital Renaissance in Africa.
                                </p>
                            </div>
                        </motion.div>

                        {/* Fragment 2: The Voice (Mic) */}
                        <motion.div style={{ y: useTransform(scrollYProgress, [0.2, 0.8], [300, -300]) }} className="group relative">
                            <div className="p-8 glass-sovereign border-white/10 rounded-3xl space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Mic className="w-8 h-8 text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-gold">The Voice</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Amplifying the sovereign message across digital waves with clarity and uncompromising authority.
                                </p>
                            </div>
                        </motion.div>

                        {/* Fragment 3: The Architect (Studio) */}
                        <motion.div style={{ y: useTransform(scrollYProgress, [0.2, 0.8], [150, -150]) }} className="group relative">
                            <div className="p-8 glass-sovereign border-white/10 rounded-3xl space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <VideoIcon className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold">The Architect</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Building the neural infrastructure for the future of world Christian content creation.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Phase 3: The Summit Pillars (60-100% Scroll) */}
            <section className="relative z-40 py-40 border-t border-white/10 bg-background/50 backdrop-blur-md">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mb-24">
                        <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-[0.4em] px-4 py-1 mb-6">Strategic Matrix</Badge>
                        <h2 className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight">A Multi-Dimensional <br /> Gathering of Purpose.</h2>
                        <p className="text-xl text-slate-400 font-light max-w-xl">
                            The Faith Nexus 2026 Summit is where Sovereignty meets Scalability. Explore our core pillars.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Column 1: Covenant Conversations */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass-sovereign border-white/10 relative group">
                                <img src="/images/branding/summit/faith_nexus_covenant_conversations_poster.png" alt="Covenant" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-background via-background/80 to-transparent">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <MessageSquare className="w-5 h-5 text-primary" />
                                        </div>
                                        <h4 className="text-2xl font-bold font-serif">Covenant Conversations</h4>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Exploring the Hebraic foundations of the faith. A deep dive into the roots of our creative mandate.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: FaithNexus100 */}
                        <div className="space-y-8 pt-12 lg:pt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass-sovereign border-white/10 relative group">
                                <img src="/images/branding/summit/faith_nexus_100_honours_poster.png" alt="Covenant" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-background via-background/80 to-transparent">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                                            <Shield className="w-5 h-5 text-gold" />
                                        </div>
                                        <h4 className="text-2xl font-bold font-serif">FaithNexus100</h4>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Honouring 100 voices shaping Africa's future. A celebration of sovereign influence and impact.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Industry Exhibition */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass-sovereign border-white/10 relative group">
                                <img src="/images/branding/summit/faith_nexus_industry_exhibition_poster.png" alt="Covenant" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-background via-background/80 to-transparent">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                            <Zap className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <h4 className="text-2xl font-bold font-serif">Industry Exhibition</h4>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Where Faith, Media & Innovation meet. Showcasing the latest in Kingdom-tech and creative tools.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="h-[60vh] flex items-center justify-center bg-[#050811] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/images/branding/summit/creator_portal_hero_v1.png')] bg-cover bg-center mix-blend-overlay" />
                <div className="container px-6 relative z-10 text-center space-y-12">
                    <h2 className="text-5xl md:text-8xl font-serif font-black leading-tight text-white">
                        Enter the <span className="text-gold">Nexus Awakening.</span>
                    </h2>
                    <MagneticButton>
                        <Button size="lg" className="h-20 px-16 text-2xl bg-primary hover:bg-gold-600 transition-all font-bold rounded-full shadow-[0_30px_60px_rgba(212,175,55,0.4)]">
                            Finalize Registration
                        </Button>
                    </MagneticButton>
                    <p className="text-slate-500 font-bold tracking-[0.5em] uppercase text-xs pt-12">Integro AI Agent OS • Phase 25 Deployment</p>
                </div>
            </section>
        </div>
    );
};

export default SovereignLauncher;
