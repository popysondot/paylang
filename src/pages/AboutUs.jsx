import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';
import { UserCheck, Globe, Shield, ArrowRight } from 'lucide-react';

const AboutUs = () => {
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
        <InfoLayout title={`Service Infrastructure`}>
            <div className="space-y-32">
                <p className="text-3xl md:text-6xl text-white/40 font-black leading-tight max-w-5xl tracking-tighter uppercase">
                    <span className="text-white">{settings.company_name}</span> operates a high-availability direct settlement network designed for <span className="text-[#10b981]">professional service</span> transactions.
                </p>

                <div className="grid md:grid-cols-3 gap-16 py-20 faded-line-y">
                    <div className="space-y-8">
                        <div className="w-12 h-1 bg-[#10b981]"></div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Ledger</h3>
                        <p className="text-white/40 text-lg font-medium leading-relaxed uppercase tracking-tight">
                            Every transaction is recorded on an encrypted, immutable ledger ensuring complete auditability and financial transparency.
                        </p>
                    </div>
                    <div className="space-y-8 md:faded-line-l md:pl-16">
                        <div className="w-12 h-1 bg-[#10b981]"></div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Global Settlement</h3>
                        <p className="text-white/40 text-lg font-medium leading-relaxed uppercase tracking-tight">
                            Our cross-border payment infrastructure supports multi-currency settlements with localized compliance verification.
                        </p>
                    </div>
                    <div className="space-y-8 md:faded-line-l md:pl-16">
                        <div className="w-12 h-1 bg-[#10b981]"></div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Verified Entities</h3>
                        <p className="text-white/40 text-lg font-medium leading-relaxed uppercase tracking-tight">
                            All transacting parties undergo rigorous KYC/KYB screening to maintain the integrity of the professional network.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-16 py-20">
                    <div className="space-y-8">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">Compliance Framework</h2>
                        <p className="text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                            We adhere to international financial standards and data protection regulations. Our systems are monitored 24/7 to ensure continuous uptime and operational security.
                        </p>
                    </div>
                    <div className="space-y-8 md:faded-line-l md:pl-16">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">Operational Integrity</h2>
                        <p className="text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                            Integrity is the core of our infrastructure. We provide the technical tools necessary for transparent financial interactions between specialized service providers and their clients.
                        </p>
                    </div>
                </div>
            </div>
        </InfoLayout>
    );
};

export default AboutUs;
