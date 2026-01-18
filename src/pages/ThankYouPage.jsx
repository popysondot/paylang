import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { 
    CheckCircle, 
    Download, 
    Home, 
    Mail, 
    Clock,
    ArrowRight
} from 'lucide-react';

const ThankYouPage = () => {
    const location = useLocation();
    const { reference, amount, email, name } = location.state || {};
    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        support_email: 'support@moonderiv.com',
        service_name: 'Professional Services'
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

    const downloadReceipt = () => {
        if (!reference || !name) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(`${settings.company_name} Receipt`, 20, 30);
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
        doc.text(`Ref: ${reference}`, 20, 50);
        doc.text(`Customer: ${name}`, 20, 70);
        doc.text(`Service: ${settings.service_name}`, 20, 80);
        doc.setFontSize(16);
        doc.text(`Total: $${amount}`, 20, 100);
        doc.save(`Receipt_${reference}.pdf`);
    };

    if (!reference) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center">
                <div className="space-y-6 max-w-sm">
                    <h2 className="text-4xl font-black tracking-tighter text-white">No data.</h2>
                    <p className="text-slate-500 font-medium text-sm uppercase tracking-widest">Transaction not found in session</p>
                    <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                        Back to Home <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col">
            <nav className="w-full max-w-[1400px] mx-auto px-6 py-8 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-[#0f172a]" size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{settings.company_name}</span>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Transaction Complete</p>
                        <h1 className="text-6xl md:text-8xl xl:text-[120px] font-black tracking-tighter leading-[0.85] text-white">
                            Thank You, <br />
                            <span className="text-slate-800 outline-text">{name.split(' ')[0]}.</span>
                        </h1>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 pt-12 border-t border-slate-900">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Amount Paid</span>
                            <p className="text-5xl font-black text-white leading-none">${amount}</p>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Reference ID</span>
                            <p className="text-sm font-mono font-bold text-slate-400 break-all">{reference}</p>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Confirmation</span>
                            <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Email Sent to {email}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-12">
                        <button 
                            onClick={downloadReceipt}
                            className="group flex items-center justify-between bg-white text-[#0f172a] px-8 py-6 rounded-full transition-all duration-500 sm:w-80"
                        >
                            <span className="text-sm font-black uppercase tracking-widest">Save Receipt</span>
                            <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                        </button>
                        <Link 
                            to="/"
                            className="group flex items-center justify-between bg-slate-900 text-white px-8 py-6 rounded-full transition-all duration-500 sm:w-80 border border-slate-800"
                        >
                            <span className="text-sm font-black uppercase tracking-widest">Back to Hub</span>
                            <Home size={20} className="group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="pt-20 max-w-xl">
                        <div className="flex items-start gap-4 text-slate-500">
                            <Clock size={20} className="text-emerald-500 shrink-0" />
                            <p className="text-sm font-medium leading-relaxed">
                                Our team has been notified. A specialist will review your {settings.service_name.toLowerCase()} request and contact you within 2-4 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full max-w-[1400px] mx-auto px-6 py-12 flex justify-between items-center border-t border-slate-900/50">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                    Need Help? contact {settings.support_email}
                </p>
            </footer>

            <style jsx>{`
                .outline-text {
                    -webkit-text-stroke: 1px #334155;
                    color: transparent;
                }
                @media (min-width: 1024px) {
                    .outline-text {
                        -webkit-text-stroke: 2px #334155;
                    }
                }
            `}</style>
        </div>
    );
};

export default ThankYouPage;
