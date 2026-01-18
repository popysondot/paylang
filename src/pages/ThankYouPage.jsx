import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { 
    CheckCircle, 
    Download, 
    Home, 
    ShieldCheck, 
    ArrowRight, 
    Mail, 
    HelpCircle,
    FileText,
    Clock
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
        doc.setTextColor(5, 150, 105); 
        doc.text(`${settings.company_name} Official Receipt`, 20, 30);
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); 
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
        doc.text(`Receipt No: ${reference}`, 20, 50);
        doc.setDrawColor(226, 232, 240); 
        doc.line(20, 60, 190, 60);
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59); 
        doc.text('Payment Details:', 20, 75);
        doc.setFontSize(12);
        doc.text(`Customer Name: ${name}`, 20, 90);
        doc.text(`Customer Email: ${email}`, 20, 100);
        doc.text(`Service: ${settings.service_name}`, 20, 110);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount Paid: $${amount}`, 20, 130);
        doc.save(`Receipt_${reference}.pdf`);
    };

    if (!reference) {
        return (
            <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl border border-white max-w-md w-full text-center">
                    <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                        <HelpCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4">No Transaction Found</h2>
                    <p className="text-slate-500 mb-8 font-medium">If you just completed a payment, please check your email for the receipt.</p>
                    <Link to="/" className="block w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                        Return to Hub
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-emerald-100">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]"></div>
            </div>

            <div className="relative w-full max-w-[500px]">
                {/* Success Header */}
                <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-16 h-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-200 mb-6 animate-bounce">
                        <CheckCircle className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Received!</h1>
                    <p className="text-slate-500 font-medium text-center mt-2 px-4">
                        Thank you, <span className="text-emerald-600 font-bold">{name.split(' ')[0]}</span>. Your transaction was successful.
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500 delay-150">
                    <div className="space-y-6">
                        {/* Transaction Detail */}
                        <div className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">${amount}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ref ID</p>
                                <p className="text-sm font-mono font-bold text-slate-600 mt-1">{reference.slice(-8)}</p>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Clock size={16} className="text-emerald-600" />
                                What's next?
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-slate-500 font-medium leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                    Confirmation sent to {email}
                                </li>
                                <li className="flex gap-3 text-sm text-slate-500 font-medium leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                    Expert will contact you within 2-4 hours
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 gap-3 pt-2">
                            <button 
                                onClick={downloadReceipt}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Download size={18} />
                                Download Receipt
                            </button>
                            <Link 
                                to="/"
                                className="w-full bg-white border border-slate-200 hover:border-emerald-600 text-slate-600 hover:text-emerald-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <Home size={18} />
                                Back to Hub
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Support */}
                <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-500 text-center">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <Mail size={14} />
                        Need help? <a href={`mailto:${settings.support_email}`} className="text-emerald-600 hover:underline">{settings.support_email}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
