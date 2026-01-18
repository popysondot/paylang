import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, CreditCard, Mail, User, DollarSign, AlertCircle, Lock, ChevronRight } from 'lucide-react';

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
        const params = new URLSearchParams(location.search);
        if (params.get('email')) setEmail(params.get('email'));
        if (params.get('name')) setName(params.get('name'));
        if (params.get('amount')) setAmount(params.get('amount'));

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

        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        if (!paystackKey || !backendUrl) {
            setEnvError('Configuration missing. Please set VITE_PAYSTACK_PUBLIC_KEY and VITE_BACKEND_URL.');
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
            alert('Verification pending. Please check your email.');
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
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-2 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Encrypting Transaction</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col">
            {/* Nav */}
            <nav className="w-full max-w-[1400px] mx-auto px-6 py-8 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-[#0f172a]" size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{settings.company_name}</span>
                </div>
                <Link to="/orders" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
                    Dashboard
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center py-12 md:py-20">
                {/* Text Content */}
                <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="space-y-4">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Secure Gateway</p>
                        <h1 className="text-6xl md:text-8xl xl:text-[120px] font-black tracking-tighter leading-[0.85] text-white">
                            Pay for <br />
                            <span className="text-slate-800 outline-text">{settings.service_name.split(' ')[0]}</span> <br />
                            Services.
                        </h1>
                    </div>
                    
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
                        The minimal hub for <span className="text-slate-300">{settings.company_name}</span> clients. Encrypted, fast, and secure.
                    </p>

                    <div className="hidden md:flex items-center gap-12 pt-4">
                        <div className="space-y-1">
                            <p className="text-sm font-black text-white">Level 1</p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">PCI Compliance</p>
                        </div>
                        <div className="w-px h-8 bg-slate-800"></div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-white">AES-256</p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">SSL Encryption</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-5 w-full animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                    <form onSubmit={handlePayment} className="space-y-10 md:space-y-14">
                        <div className="space-y-8 md:space-y-12">
                            <div className="group relative">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-emerald-400">Client Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-slate-800 focus:border-emerald-500 py-3 outline-none text-2xl md:text-3xl font-black transition-all placeholder:text-slate-800"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="group relative">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-emerald-400">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-slate-800 focus:border-emerald-500 py-3 outline-none text-2xl md:text-3xl font-black transition-all placeholder:text-slate-800"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div className="group relative">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-emerald-400">Amount (USD)</label>
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl md:text-5xl font-black text-slate-800 group-focus-within:text-emerald-500 transition-colors mb-2">$</span>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="flex-1 bg-transparent border-b-2 border-slate-800 focus:border-emerald-500 py-3 outline-none text-5xl md:text-7xl font-black transition-all placeholder:text-slate-800"
                                        placeholder="00"
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="group w-full flex items-center justify-between bg-emerald-500 hover:bg-white text-[#0f172a] px-8 py-6 md:py-8 rounded-full transition-all duration-500 shadow-2xl shadow-emerald-500/20"
                        >
                            <span className="text-xl md:text-2xl font-black uppercase tracking-tighter">Initiate Payment</span>
                            <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform duration-500" />
                        </button>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-900/50 mt-auto">
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    <a href="/terms-of-service" className="hover:text-slate-400">Terms</a>
                    <a href="/privacy-policy" className="hover:text-slate-400">Privacy</a>
                    <a href="/refund" className="hover:text-slate-400">Refunds</a>
                </div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                    © {new Date().getFullYear()} {settings.company_name}. Secure Checkout.
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

export default PaymentPage;
