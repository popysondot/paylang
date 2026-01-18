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
                setSettings(prev => ({ ...prev, ...res.data }));
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
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div className="space-y-6 max-w-sm">
                    <h2 className="text-4xl font-black tracking-tighter">Oops.</h2>
                    <p className="text-slate-400 font-medium">We couldn't find that transaction. Please check your email for confirmation.</p>
                    <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                        Back to Home <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 overflow-x-hidden">
            <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    
                    {/* Left Side: Large Success Text */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 text-emerald-600">
                            <CheckCircle size={24} />
                            <span className="text-sm font-black uppercase tracking-widest">Success</span>
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                            Payment <br />
                            Confirmed <br />
                            <span className="text-slate-200">Thanks.</span>
                        </h1>
                        
                        <p className="text-lg text-slate-400 font-medium max-w-md leading-relaxed">
                            Hello {name.split(' ')[0]}, your payment for <span className="text-slate-900">{settings.service_name}</span> was received. A specialist will reach out to you within 2-4 hours.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={downloadReceipt}
                                className="inline-flex items-center gap-3 bg-black text-white px-8 py-5 rounded-full font-black uppercase tracking-tighter text-sm hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                <Download size={20} />
                                Receipt PDF
                            </button>
                            <Link 
                                to="/"
                                className="inline-flex items-center gap-3 bg-slate-50 text-slate-900 px-8 py-5 rounded-full font-black uppercase tracking-tighter text-sm hover:bg-slate-100 transition-all active:scale-95"
                            >
                                <Home size={20} />
                                Home
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Simple Details */}
                    <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 lg:pt-32">
                        <div className="space-y-12">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Amount Paid</span>
                                <p className="text-7xl font-black tracking-tighter leading-none">${amount}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-12">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Transaction ID</span>
                                    <p className="text-sm font-black truncate font-mono">{reference}</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Confirmation</span>
                                    <p className="text-sm font-black flex items-center gap-2">
                                        <Mail size={14} className="text-emerald-500" />
                                        Sent to Email
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Next Step</span>
                                    <p className="text-sm font-black flex items-center gap-2">
                                        <Clock size={14} className="text-emerald-500" />
                                        Wait 2-4 Hours
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Minimal Help Footer */}
            <div className="fixed bottom-8 right-8 animate-in fade-in duration-1000 delay-500">
                <a 
                    href={`mailto:${settings.support_email}`}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-emerald-600 transition-colors"
                >
                    <Mail size={14} />
                    Support: {settings.support_email}
                </a>
            </div>
        </div>
    );
};

export default ThankYouPage;
