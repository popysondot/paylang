import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';

const TermsOfService = () => {
    const [settings, setSettings] = useState({
        company_name: 'Service Platform',
        service_name: 'Professional Services',
        refund_policy_days: '14'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
                const res = await axios.get(`${baseUrl}/api/settings`);
                setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <InfoLayout title="Terms of Service">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing and using {settings.company_name}, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Service Description</h2>
                    <p>{settings.company_name} provides {settings.service_name.toLowerCase()} and related support services. The work provided is intended to be used according to applicable laws and regulations.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Refund Policy</h2>
                    <p>We guarantee high-quality results. If the delivered service does not meet the initial specifications provided, you are entitled to revisions. Refund requests can be filed through our portal within {settings.refund_policy_days} days of transaction.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Payment Terms</h2>
                    <p>Payments are processed securely via our integrated payment gateways. Service begins only after the initial payment has been confirmed. All prices are in USD unless otherwise specified.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">5. User Responsibility</h2>
                    <p>You are responsible for ensuring that your use of our services complies with all applicable local and international laws. {settings.company_name} is not liable for any misuse of the services provided.</p>
                </section>
            </div>
        </InfoLayout>
    );
};

export default TermsOfService;
