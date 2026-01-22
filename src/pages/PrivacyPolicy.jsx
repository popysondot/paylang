import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';

const PrivacyPolicy = () => {
    const getBaseUrl = () => {
        return window.location.hostname === 'localhost' 
            ? (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
            : '';
    };

    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        support_email: 'support@moonderiv.com'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${getBaseUrl()}/api/settings`);
                if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <InfoLayout title="Data Integrity Policy">
            <div className="space-y-16 md:space-y-32">
                <section className="space-y-8 py-8 md:py-12 faded-line-b">
                    <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">01. Protocol Scope</h2>
                    <p className="text-xl md:text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        At <span className="text-white">{settings.company_name}</span>, we operate under strict data isolation protocols. This specification defines our methodology for handling entity data and maintaining the integrity of our settlement network.
                    </p>
                </section>

                <section className="space-y-10 md:space-y-12 py-8 md:py-12 faded-line-b">
                    <div className="flex items-center gap-4 mb-10 md:mb-16">
                        <div className="w-12 h-[2px] bg-[#f59e0b]"></div>
                        <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">02. Data Classification</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-12 md:gap-16">
                        <div className="space-y-4">
                            <strong className="text-white text-2xl md:text-3xl font-black block uppercase tracking-tighter">Identity Signature</strong>
                            <p className="text-white/40 font-black text-base md:text-lg uppercase tracking-tighter">Encrypted identifiers used for entity verification and session management.</p>
                        </div>
                        <div className="space-y-4 sm:faded-line-l sm:pl-12 md:pl-16">
                            <strong className="text-white text-2xl md:text-3xl font-black block uppercase tracking-tighter">Network Contact</strong>
                            <p className="text-white/40 font-black text-base md:text-lg uppercase tracking-tighter">Secure routing addresses for protocol notifications and settlement alerts.</p>
                        </div>
                        <div className="space-y-4 pt-12 md:pt-16 faded-line-t">
                            <strong className="text-white text-2xl md:text-3xl font-black block uppercase tracking-tighter">Financial Hash</strong>
                            <p className="text-white/40 font-black text-base md:text-lg uppercase tracking-tighter">Transaction metadata handled via L1 payment processors. We do not store raw card assets.</p>
                        </div>
                        <div className="space-y-4 pt-12 md:pt-16 faded-line-t sm:faded-line-l sm:pl-12 md:pl-16">
                            <strong className="text-white text-2xl md:text-3xl font-black block uppercase tracking-tighter">Ledger Entries</strong>
                            <p className="text-white/40 font-black text-base md:text-lg uppercase tracking-tighter">Immutable records of settlement history and administrative adjustments.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-8 py-8 md:py-12 faded-line-b">
                    <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">03. Confidentiality Matrix</h2>
                    <p className="text-xl md:text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        Your association with <span className="text-white">{settings.company_name}</span> is protected by multi-layer encryption. We maintain a zero-sharing policy with external marketing entities. All internal communication is routed through encrypted tunnels.
                    </p>
                </section>

                <section className="space-y-8 py-8 md:py-12">
                    <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">04. Infrastructure Security</h2>
                    <p className="text-xl md:text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        Our infrastructure utilizes automated intrusion detection and continuous monitoring. Access to sensitive data is restricted to authorized administrative nodes with verifiable credentials.
                    </p>
                </section>

                <div className="pt-12 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white/10 flex flex-col sm:flex-row justify-between gap-6">
                    <span>Last Protocol Update: {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()} {new Date().getFullYear()}</span>
                    <span className="text-[#10b981]">Admin: {settings.support_email}</span>
                </div>
            </div>
        </InfoLayout>
    );
};

export default PrivacyPolicy;
