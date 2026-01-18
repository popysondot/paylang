import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';

const PagePreloader = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [companyName, setCompanyName] = useState('Service Platform');

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
                const res = await axios.get(`${baseUrl}/api/settings`);
                if (res.data.company_name) setCompanyName(res.data.company_name);
            } catch (err) {
                // Keep default
            }
        };
        fetchBranding();

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200); // Standard loading time for a premium feel
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-[1px] border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ShieldCheck className="text-emerald-500" size={32} />
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">{companyName}</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Secure Connection Active</p>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default PagePreloader;
