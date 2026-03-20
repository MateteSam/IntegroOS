import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (userName: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [ready, setReady] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setReady(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalName = name.trim() || 'Creator';
        onLogin(finalName);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a] overflow-hidden">
            {/* Subtle ambient glow */}
            <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[80px]" />

            <div className={`relative z-10 w-full max-w-md p-8 flex flex-col items-center transition-all duration-700 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Logo */}
                <div className="mb-10 relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                        <span className="text-white font-black text-3xl tracking-tight">O</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">ONIXone</h1>
                <p className="text-slate-400 text-sm mb-10 tracking-wide">Publishing Studio</p>

                {/* Name Input */}
                <form onSubmit={handleSubmit} className="w-full mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name (optional)"
                            className="w-full bg-slate-800/50 border border-slate-700/50 text-center text-white placeholder-slate-500 rounded-xl py-3.5 px-6 pr-14 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30 transition-all backdrop-blur-sm text-sm"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-cyan-500 hover:bg-cyan-400 rounded-lg flex items-center justify-center text-white transition-all active:scale-90"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </form>

                <button
                    onClick={() => onLogin('Creator')}
                    className="text-slate-500 hover:text-cyan-400 text-xs font-medium transition-colors"
                >
                    Skip — enter as Creator
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-center w-full text-slate-600 text-[10px] tracking-[0.2em] uppercase font-medium">
                ONIXone Publishing Suite
            </div>
        </div>
    );
};

export default LoginScreen;
