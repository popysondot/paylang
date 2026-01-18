import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, CreditCard, Mail, User, DollarSign, AlertCircle } from 'lucide-react';

const PaymentPage = () => {
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [envError, setEnvError] = useState('');
    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        service_name: 'Professional Services',
    });
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Handle URL Parameters
        const params = new URLSearchParams(location.search);
        if (params.get('email')) setEmail(params.get('email'));
        if (params.get('name')) setName(params.get('name'));
        if (params.get('amount')) setAmount(params.get('amount'));

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

        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        if (!paystackKey || !backendUrl) {
            setEnvError('System configuration in progress. Please check back shortly.');
        }
    }, [location]);

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: parseFloat(amount) * 100,
        publicKey: paystackKey,
        currency: 'USD',
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference) => {
        setIsProcessing(true);
        axios.post(`${backendUrl.replace(/\/$/, '')}/api/verify-payment`, {
            reference: reference.reference,
            email: email,
            amount: amount,
            name: name
        }).then(res => {
            if (res.data.status === 'success') {
                navigate('/thank-you', { state: { reference: reference.reference, amount, email, name } });
            }
        }).catch(err => {
            setIsProcessing(false);
            alert('Payment successful, but verification pending. Please contact support.');
        });
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (!paystackKey || !backendUrl) return;
        if (!email || !amount || !name) {
            alert('Please fill in all fields');
            return;
        }
        initializePayment(onSuccess, () => setIsProcessing(false));
    };

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-slate-800">Securing Transaction...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-emerald-100">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]"></div>
            </div>

            <div className="relative w-full max-w-[440px]">
                {/* Logo/Brand Area */}
                <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-4 transition-transform hover:scale-110 duration-300">
                        <ShieldCheck className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{settings.company_name}</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">{settings.service_name}</p>
                </div>

                {/* Main Payment Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500 delay-150">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Payment Details</h2>
                    </div>

                    {envError ? (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium leading-relaxed">{envError}</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePayment} className="space-y-5">
                            <div className="space-y-1.5 group">
                                <label className="text-[13px] font-bold text-slate-500 ml-1 group-focus-within:text-emerald-600 transition-colors">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[13px] font-bold text-slate-500 ml-1 group-focus-within:text-emerald-600 transition-colors">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                                        placeholder="client@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[13px] font-bold text-slate-500 ml-1 group-focus-within:text-emerald-600 transition-colors">Amount (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                                        placeholder="0.00"
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 group"
                            >
                                Pay Now
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    )}
                </div>

                {/* Secure Footer */}
                <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-500">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> Secure SSL</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <span>PCI Compliant</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                        <a href="/terms-of-service" className="hover:text-emerald-600 transition-colors">Terms</a>
                        <a href="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy</a>
                        <a href="/refund" className="hover:text-emerald-600 transition-colors">Refunds</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
