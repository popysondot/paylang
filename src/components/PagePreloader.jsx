import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';

const PagePreloader = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [companyName, setCompanyName] = useState('Service Platform');

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_URL 
                    ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')
                    : (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
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
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
                <div className="relative mb-12">
                    <div className="w-24 h-24 border-2 border-[#10b981] animate-spin shadow-[0_0_40px_rgba(16,185,129,0.2)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#10b981]/10 blur-xl animate-pulse"></div>
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-6">
                    <h2 className="text-[13px] font-black text-white uppercase tracking-[0.8em] ml-[0.8em]">{companyName}</h2>
                    <div className="flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/10">
                        <div className="w-2 h-2 bg-[#10b981] shadow-[0_0_10px_#10b981]"></div>
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Protocol Active</p>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default PagePreloader;
