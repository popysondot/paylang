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
        company_name: 'Direct Settlement',
        support_email: 'support@moonderiv.com',
        service_name: 'System Protocol'
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
        
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text(settings.company_name.toUpperCase(), 20, 25);
        
        doc.setTextColor(16, 185, 129); // #10b981
        doc.setFontSize(10);
        doc.text('SETTLEMENT VERIFICATION', 140, 25);
        
        doc.setTextColor(82, 82, 91);
        doc.setFontSize(10);
        doc.text('ENTITY IDENTIFIER:', 20, 60);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(name, 20, 70);
        doc.text(email, 20, 77);
        
        doc.setTextColor(82, 82, 91);
        doc.setFontSize(10);
        doc.text('PROTOCOL REF:', 120, 60);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Timestamp: ${new Date().toLocaleDateString()}`, 120, 70);
        doc.text(`Reference: ${reference}`, 120, 77);
        
        doc.setFillColor(244, 244, 245);
        doc.rect(20, 100, 170, 10, 'F');
        doc.setTextColor(113, 113, 122);
        doc.text('SERVICE DEFINITION', 25, 106.5);
        doc.text('VALUE', 160, 106.5);
        
        doc.setTextColor(0, 0, 0);
        doc.text(settings.service_name, 25, 120);
        doc.text(`$${Number(amount).toFixed(2)}`, 160, 120);
        
        doc.setDrawColor(228, 228, 231);
        doc.line(20, 140, 190, 140);
        doc.setFontSize(14);
        doc.text('FINAL SETTLEMENT', 25, 155);
        doc.setTextColor(16, 185, 129); // #10b981
        doc.text(`$${Number(amount).toFixed(2)} USD`, 160, 155);
        
        doc.setTextColor(161, 161, 170);
        doc.setFontSize(8);
        doc.text('Authenticated Transaction Record.', 105, 280, { align: 'center' });
        
        doc.save(`Receipt_${reference}.pdf`);
    };

    if (!reference) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
                <div className="space-y-8 max-w-sm">
                    <h2 className="text-5xl font-black tracking-tighter text-white uppercase">No data.</h2>
                    <p className="text-white/20 font-medium text-[11px] uppercase tracking-[0.6em]">Protocol sequence incomplete</p>
                    <Link to="/" className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-full text-[#10b981] font-black uppercase tracking-widest text-xs hover:bg-[#10b981] hover:text-white transition-all">
                        Back to Hub <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col font-sans">
            <nav className="w-full max-w-[1400px] mx-auto px-8 py-10 flex justify-between items-center relative z-10 faded-line-b">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#10b981]"></div>
                    <span className="text-[12px] font-black uppercase tracking-[0.4em]">{settings.company_name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">SECURE_NOMINAL</span>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-24">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-[2px] bg-[#f59e0b]"></div>
                            <p className="text-[#f59e0b] text-[11px] font-black uppercase tracking-[0.5em]">TRANSACTION COMPLETE</p>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white uppercase">
                            Payment <br />
                            <span className="text-white/20">Successful.</span>
                        </h1>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16 py-20 faded-line-y">
                        <div className="space-y-6">
                            <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] block">Value (USD)</span>
                            <p className="text-7xl font-black text-white leading-none tracking-tighter">${amount}</p>
                        </div>
                        <div className="space-y-6 md:faded-line-l md:pl-16">
                            <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] block">Reference ID</span>
                            <p className="text-lg font-black text-[#10b981] break-all tracking-tighter uppercase leading-none">{reference}</p>
                        </div>
                        <div className="space-y-6 md:faded-line-l md:pl-16">
                            <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] block">Status</span>
                            <div className="inline-flex items-center gap-4">
                                <div className="w-3 h-3 bg-[#10b981] rounded-full shadow-[0_0_15px_#10b981]"></div>
                                <p className="text-2xl font-black text-[#10b981] uppercase tracking-tighter leading-none">VERIFIED</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-16">
                        <button 
                            onClick={downloadReceipt}
                            className="modern-action-white text-xl hover:gap-8"
                        >
                            <span>Download Protocol</span>
                            <Download size={24} />
                        </button>
                        <Link 
                            to="/"
                            className="modern-action-green text-xl hover:gap-8"
                        >
                            <span>Return to Hub</span>
                            <Home size={24} />
                        </Link>
                    </div>

                    <div className="pt-24 max-w-5xl border-l-4 border-white/[0.03] pl-16">
                        <div className="flex items-start gap-16">
                            <div className="space-y-8">
                                <p className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                                    Administrative <br /> update pending.
                                </p>
                                <p className="text-xl font-black leading-tight uppercase tracking-tighter text-white/30 max-w-2xl">
                                    Confirmation details for <span className="text-white">{settings.service_name}</span> will be dispatched to <span className="text-white">{email}</span> shortly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full max-w-[1400px] mx-auto px-8 py-16 flex flex-col md:flex-row justify-between items-center gap-8 faded-line-t mt-auto">
                <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.4em]">
                    SUPPORT_ENDPOINT: {settings.support_email}
                </p>
                <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.6em]">
                    © {new Date().getFullYear()} // CORE_PROTOCOL_V1
                </p>
            </footer>
        </div>
    );
};

export default ThankYouPage;
