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
        <InfoLayout title={`About Our Elite Experts`}>
            <div className="space-y-12">
                <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl">
                    At <span className="text-white font-black">{settings.company_name}</span>, we believe that excellence starts with exceptional partnership. Our network is composed of world-class professionals.
                </p>

                <div className="grid md:grid-cols-3 gap-8 my-16">
                    <div className="group p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] hover:border-emerald-500 transition-all duration-500">
                        <UserCheck className="text-emerald-500 mb-6" size={40} />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Vetted Experts</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Every expert undergoes a rigorous multi-stage verification process including background checks and professional testing.
                        </p>
                    </div>
                    <div className="group p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] hover:border-emerald-500 transition-all duration-500">
                        <Globe className="text-emerald-500 mb-6" size={40} />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Global Presence</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Our experts are located in top professional hubs worldwide, ensuring mastery of local standards and requirements.
                        </p>
                    </div>
                    <div className="group p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] hover:border-emerald-500 transition-all duration-500">
                        <Shield className="text-emerald-500 mb-6" size={40} />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Top Tier</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Over 85% of our experts hold advanced professional certifications and degrees from world-renowned institutions.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-slate-900">
                    <div className="space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">Selection Process</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            We only select the top 3% of applicants. Our criteria focus on subject matter expertise, communication skills, and a passion for success. When you work with a <span className="text-white font-bold">{settings.company_name}</span> expert, you're working with a proven leader in their field.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">Our Commitment</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Integrity is the cornerstone of our service. Our experts provide original research, guidance, and high-quality deliverables that serve as powerful tools to help you master your goals.
                        </p>
                    </div>
                </div>

                <div className="pt-12">
                    <button className="group flex items-center gap-4 bg-emerald-500 text-[#0f172a] px-10 py-6 rounded-full font-black uppercase tracking-widest text-sm hover:bg-white transition-all duration-500">
                        Join Our Network <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </InfoLayout>
    );
};

export default AboutUs;
