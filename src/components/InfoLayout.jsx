import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ChevronRight } from 'lucide-react';

const InfoLayout = ({ title, children }) => {
    const [settings, setSettings] = useState({
        company_name: 'Payment Hub'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
                const res = await axios.get(`${baseUrl}/api/settings`);
                if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col">
            {/* Nav */}
            <nav className="w-full max-w-[1400px] mx-auto px-6 py-8 flex justify-between items-center relative z-10">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-[#0f172a]" size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{settings.company_name}</span>
                </Link>
                <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
                    <ArrowLeft size={14} /> Back to Hub
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="max-w-4xl">
                    <div className="mb-12 md:mb-20 space-y-4">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Information</p>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                            {title.split(' ').map((word, i) => (
                                <React.Fragment key={i}>
                                    {i % 2 === 1 ? (
                                        <span className="text-slate-800 outline-text">{word}</span>
                                    ) : (
                                        word
                                    )}
                                    {' '}
                                </React.Fragment>
                            ))}
                        </h1>
                    </div>

                    <div className="prose prose-invert max-w-none 
                        prose-h2:text-2xl prose-h2:font-black prose-h2:tracking-tight prose-h2:text-white prose-h2:uppercase prose-h2:tracking-widest prose-h2:text-sm
                        prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg
                        prose-strong:text-emerald-400 prose-strong:font-black">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-900/50 mt-auto">
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    <Link to="/terms-of-service" className="hover:text-slate-400">Terms</Link>
                    <Link to="/privacy-policy" className="hover:text-slate-400">Privacy</Link>
                    <Link to="/refund" className="hover:text-slate-400">Refunds</Link>
                </div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                    © {new Date().getFullYear()} {settings.company_name}. Secure Gateway.
                </p>
            </footer>

            <style jsx>{`
                .outline-text {
                    -webkit-text-stroke: 1px #334155;
                    color: transparent;
                }
                @media (min-width: 1024px) {
                    .outline-text {
                        -webkit-text-stroke: 2px #334155;
                    }
                }
            `}</style>
        </div>
    );
};

export default InfoLayout;
