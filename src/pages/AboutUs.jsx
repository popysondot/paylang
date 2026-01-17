import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';
import { UserCheck, Globe, Shield } from 'lucide-react';

const AboutUs = () => {
    const [settings, setSettings] = useState({
        company_name: 'Service Platform'
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
        <InfoLayout title={`About Our Elite Experts`}>
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <p className="text-lg">
                    At {settings.company_name}, we believe that excellence starts with exceptional partnership. Our network of experts is composed of some of the most qualified professionals in the world.
                </p>

                <div className="grid md:grid-cols-3 gap-8 my-12">
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <UserCheck className="mx-auto text-emerald-600 mb-4" size={32} />
                        <h3 className="font-bold text-slate-900 mb-2">Vetted Experts</h3>
                        <p className="text-sm">Every expert undergoes a rigorous multi-stage verification process including background checks and professional testing.</p>
                    </div>
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Globe className="mx-auto text-emerald-600 mb-4" size={32} />
                        <h3 className="font-bold text-slate-900 mb-2">Global Presence</h3>
                        <p className="text-sm">Our experts are located in top professional hubs worldwide, ensuring mastery of local standards and requirements.</p>
                    </div>
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Shield className="mx-auto text-emerald-600 mb-4" size={32} />
                        <h3 className="font-bold text-slate-900 mb-2">Top Tier</h3>
                        <p className="text-sm">Over 85% of our experts hold advanced professional certifications and degrees from world-renowned institutions.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Our Selection Process</h2>
                <p>
                    We only select the top 3% of applicants. Our criteria focus on subject matter expertise, communication skills, and a passion for success. When you work with a {settings.company_name} expert, you're working with a proven leader in their field.
                </p>

                <h2 className="text-2xl font-bold text-slate-900">Commitment to Integrity</h2>
                <p>
                    Integrity is the cornerstone of our service. Our experts provide original research, guidance, and high-quality deliverables that serve as powerful tools to help you master your goals.
                </p>
            </div>
        </InfoLayout>
    );
};

export default AboutUs;
