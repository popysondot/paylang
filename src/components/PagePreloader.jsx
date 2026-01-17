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
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ShieldCheck className="text-emerald-600" size={32} />
                    </div>
                </div>
                <div className="mt-6 flex flex-col items-center">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{companyName}</h2>
                    <p className="text-slate-400 text-sm mt-1 animate-pulse">Loading secure environment...</p>
                </div>
            </div>
        );
    }

    return children;
};

export default PagePreloader;
