import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';

const TermsOfService = () => {
    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        service_name: 'Professional Services',
        refund_policy_days: '14'
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
        <InfoLayout title="Terms of Service">
            <div className="space-y-12">
                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">1. Acceptance of Terms</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        By accessing and using <span className="text-white font-bold">{settings.company_name}</span>, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">2. Service Description</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        <span className="text-white font-bold">{settings.company_name}</span> provides {settings.service_name.toLowerCase()} and related support services. The work provided is intended to be used according to applicable laws and regulations.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">3. Refund Policy</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        We guarantee high-quality results. If the delivered service does not meet the initial specifications provided, you are entitled to revisions. Refund requests can be filed through our portal within <span className="text-emerald-400 font-black">{settings.refund_policy_days} days</span> of transaction.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">4. Payment Terms</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Payments are processed securely via our integrated payment gateways. Service begins only after the initial payment has been confirmed. All prices are in USD unless otherwise specified.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">5. User Responsibility</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        You are responsible for ensuring that your use of our services complies with all applicable local and international laws. <span className="text-white font-bold">{settings.company_name}</span> is not liable for any misuse of the services provided.
                    </p>
                </section>
            </div>
        </InfoLayout>
    );
};

export default TermsOfService;
