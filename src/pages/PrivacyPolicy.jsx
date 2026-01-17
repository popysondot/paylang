import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';

const PrivacyPolicy = () => {
    const [settings, setSettings] = useState({
        company_name: 'Service Platform',
        support_email: 'support@yourdomain.com'
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
        <InfoLayout title="Privacy Policy">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                    <p>At {settings.company_name}, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">2. The Data We Collect</h2>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li><strong>Identity Data:</strong> Includes first name, last name.</li>
                        <li><strong>Contact Data:</strong> Includes email address and telephone numbers.</li>
                        <li><strong>Financial Data:</strong> Handled securely by our payment processors; we do not store full card details on our servers.</li>
                        <li><strong>Transaction Data:</strong> Includes details about payments to and from you.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Confidentiality</h2>
                    <p>Your association with {settings.company_name} is strictly confidential. We never share your details with third parties or marketing agencies. All communication within our platform is secured.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way. We limit access to your personal data to those employees and authorized personnel who have a business need to know.</p>
                </section>

                <div className="text-xs text-slate-400 pt-8 border-t border-slate-100">
                    Last updated: {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}. For more information, contact {settings.support_email}
                </div>
            </div>
        </InfoLayout>
    );
};

export default PrivacyPolicy;
