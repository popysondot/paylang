import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

const InfoLayout = ({ title, children }) => {
    const [settings, setSettings] = useState({
        company_name: 'Direct Settlement'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_URL 
                    ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')
                    : (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
                const res = await axios.get(`${baseUrl}/api/settings`);
                if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col">
            {/* Background Atmosphere */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#10b981]/5 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#f59e0b]/5 blur-[120px] rounded-full"></div>
            </div>

            {/* Nav */}
            <nav className="w-full max-w-[1400px] mx-auto px-6 py-10 flex justify-between items-center relative z-10 faded-line-b">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="w-1.5 h-6 bg-[#10b981] group-hover:h-8 transition-all duration-500"></div>
                    <span className="text-[12px] font-black uppercase tracking-[0.4em]">{settings.company_name}</span>
                </Link>
                <Link to="/" className="modern-action-white opacity-40 hover:opacity-100 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> REVERT TO HUB
                </Link>
            </nav>

            <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="max-w-5xl">
                    <div className="mb-24 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-[1px] bg-[#f59e0b]"></div>
                            <p className="text-[#f59e0b] text-[10px] font-black uppercase tracking-[0.6em]">Protocol Specification</p>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-white uppercase">
                            {title}
                        </h1>
                    </div>

                    <div className="prose prose-invert max-w-none 
                        prose-h2:text-3xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:text-white prose-h2:uppercase prose-h2:mt-24 prose-h2:mb-10
                        prose-p:text-white/40 prose-p:leading-relaxed prose-p:text-lg prose-p:font-medium
                        prose-strong:text-white/80 prose-strong:font-black
                        prose-ul:list-none prose-ul:pl-0
                        prose-li:border-l prose-li:faded-line prose-li:pl-10 prose-li:py-4 prose-li:mb-4">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-[1400px] mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-end gap-12 faded-line-t mt-auto">
                <div className="flex flex-col md:flex-row gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/30">
                    <Link to="/terms-of-service" className="hover:text-[#10b981] transition-colors">Protocol Terms</Link>
                    <Link to="/privacy-policy" className="hover:text-[#10b981] transition-colors">Data Integrity</Link>
                    <Link to="/refund" className="hover:text-[#10b981] transition-colors">Adjustment Protocol</Link>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.5em]">
                        © {new Date().getFullYear()} {settings.company_name}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default InfoLayout;
