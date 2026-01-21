import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';
import { Check, ArrowRight, Mail } from 'lucide-react';

const Pricing = () => {
    const [settings, setSettings] = useState({
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
        <InfoLayout title="Service Fee Structure">
            <div className="space-y-32 relative z-10">
                <p className="text-3xl md:text-5xl text-white/40 font-black leading-tight max-w-5xl tracking-tighter uppercase">
                    Our fees are calculated based on specialized requirements and technical complexity. <span className="text-[#10b981]">Fixed rate transparency.</span>
                </p>

                <div className="grid md:grid-cols-2 gap-16 py-20 faded-line-y">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.6em]">Base Protocol</p>
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase">Tier I</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black text-white">$15</span>
                            <span className="text-xs text-white/20 font-black uppercase tracking-[0.2em]">/ Unit</span>
                        </div>
                        <ul className="space-y-6 pt-12 faded-line-t">
                            {['Standard Processing', 'Technical Verification', 'Automated Receipts', 'L1 Support'].map(item => (
                                <li key={item} className="flex items-center gap-4 text-[13px] font-black text-white/30 uppercase tracking-tight hover:text-white transition-colors">
                                    <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></div> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="space-y-12 md:faded-line-l md:pl-16">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.6em]">Advanced Protocol</p>
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase">Tier II</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black text-white">$25</span>
                            <span className="text-xs text-white/20 font-black uppercase tracking-[0.2em]">/ Unit</span>
                        </div>
                        <ul className="space-y-6 pt-12 faded-line-t">
                            {['Priority Ledger Entry', 'Complex Logic Verification', 'Extended Audit Logs', 'Expedited Settlement'].map(item => (
                                <li key={item} className="flex items-center gap-4 text-[13px] font-black text-white/30 uppercase tracking-tight hover:text-white transition-colors">
                                    <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></div> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 py-20 faded-line-b">
                    <div className="max-w-xl space-y-4">
                        <p className="text-4xl font-black uppercase tracking-tighter text-white leading-none">High-Volume Settlement</p>
                        <p className="text-white/30 font-black uppercase text-lg tracking-tighter">Customized fee structures for enterprise-scale transaction cycles requiring dedicated infrastructure.</p>
                    </div>
                    <a 
                        href={`mailto:${settings.support_email}?subject=Enterprise Settlement Inquiry`}
                        className="modern-action-white text-xl hover:gap-8"
                    >
                        Initiate Inquiry
                        <ArrowRight size={24} />
                    </a>
                </div>
            </div>
        </InfoLayout>
    );
};

export default Pricing;
