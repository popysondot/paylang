import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';

const TermsOfService = () => {
    const getBaseUrl = () => {
        return window.location.hostname === 'localhost' 
            ? (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
            : '';
    };

    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        service_name: 'Professional Services',
        refund_policy_days: '14'
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
        <InfoLayout title="Protocol Terms">
            <div className="space-y-32">
                <section className="space-y-8 py-12 faded-line-b">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#10b981]">01. Acceptance of Protocol</h2>
                    <p className="text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        By initiating a transaction through the <span className="text-white">{settings.company_name}</span> network, you agree to adhere to these Protocol Terms and all governing financial regulations.
                    </p>
                </section>

                <section className="space-y-8 py-12 faded-line-b">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#10b981]">02. Service Specification</h2>
                    <p className="text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        <span className="text-white">{settings.company_name}</span> facilitates high-performance {settings.service_name.toLowerCase()} through dedicated settlement channels. All deliverables are executed according to technical specifications provided at initiation.
                    </p>
                </section>

                <section className="space-y-8 py-12 border-l-4 border-[#f59e0b] pl-16">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">03. Adjustment Protocol</h2>
                    <p className="text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        We maintain a commitment to operational excellence. If a settlement does not align with initial parameters, entities are entitled to technical revisions. Adjustment appeals must be logged via the portal within <span className="text-white">{settings.refund_policy_days} DAYS</span> of the primary transaction.
                    </p>
                </section>

                <section className="space-y-8 py-12 faded-line-b">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#10b981]">04. Settlement Terms</h2>
                    <p className="text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        Transactions are processed via secure cryptographic gateways. Service execution is triggered upon confirmation of initial settlement. All denominations are in USD unless otherwise specified in the project manifest.
                    </p>
                </section>

                <section className="space-y-8 py-12 faded-line-b">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#10b981]">05. Entity Responsibility</h2>
                    <p className="text-2xl text-white/50 leading-tight font-black uppercase tracking-tighter">
                        Entities are responsible for ensuring that their utilization of our infrastructure complies with jurisdictional legal frameworks. <span className="text-white">{settings.company_name}</span> assumes no liability for external protocol misuse.
                    </p>
                </section>

                <div className="pt-12 text-[11px] font-black uppercase tracking-[0.4em] text-white/10 flex justify-between">
                    <span>Protocol Version: 4.2.0</span>
                    <span>© {new Date().getFullYear()} {settings.company_name}</span>
                </div>
            </div>
        </InfoLayout>
    );
};

export default TermsOfService;
