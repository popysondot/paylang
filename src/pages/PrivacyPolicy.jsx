import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';

const PrivacyPolicy = () => {
    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        support_email: 'support@moonderiv.com'
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
        <InfoLayout title="Privacy Policy">
            <div className="space-y-12">
                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">1. Introduction</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        At <span className="text-white font-bold">{settings.company_name}</span>, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">2. The Data We Collect</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-4 mt-6">
                        <li className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <strong className="text-white block mb-2">Identity Data</strong>
                            <span className="text-sm text-slate-500">Includes first name, last name.</span>
                        </li>
                        <li className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <strong className="text-white block mb-2">Contact Data</strong>
                            <span className="text-sm text-slate-500">Includes email address and telephone numbers.</span>
                        </li>
                        <li className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <strong className="text-white block mb-2">Financial Data</strong>
                            <span className="text-sm text-slate-500">Handled securely by our payment processors; we do not store full card details.</span>
                        </li>
                        <li className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <strong className="text-white block mb-2">Transaction Data</strong>
                            <span className="text-sm text-slate-500">Includes details about payments to and from you.</span>
                        </li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">3. Confidentiality</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Your association with <span className="text-white font-bold">{settings.company_name}</span> is strictly confidential. We never share your details with third parties or marketing agencies. All communication within our platform is secured.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">4. Data Security</h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way. We limit access to your personal data to those employees and authorized personnel who have a business need to know.
                    </p>
                </section>

                <div className="pt-8 border-t border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-800">
                    Last updated: {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}. Support: {settings.support_email}
                </div>
            </div>
        </InfoLayout>
    );
};

export default PrivacyPolicy;
