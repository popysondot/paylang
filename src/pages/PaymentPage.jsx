import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, CreditCard, Mail, User, DollarSign, AlertCircle, Lock } from 'lucide-react';

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
            alert('Payment successful, but verification pending.');
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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-2 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Processing Transaction</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 overflow-x-hidden">
            <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                
                {/* Left Side: Brand & Message */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="inline-flex items-center gap-2 text-emerald-600">
                        <ShieldCheck size={24} />
                        <span className="text-sm font-black uppercase tracking-widest">{settings.company_name}</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                        Secure <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Payment</span> <br />
                        Portal
                    </h1>
                    
                    <p className="text-lg text-slate-400 font-medium max-w-md leading-relaxed">
                        Complete your transaction for <span className="text-slate-900">{settings.service_name}</span> using our encrypted payment system.
                    </p>

                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black">256-bit</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SSL Encryption</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black">PCI DSS</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Level 1</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Simple Form */}
                <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                    {envError ? (
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <p className="text-slate-500 font-bold leading-relaxed italic">{envError}</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePayment} className="space-y-12">
                            <div className="space-y-8">
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-6 left-0 transition-all group-focus-within:text-emerald-600">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-slate-100 focus:border-emerald-600 py-4 outline-none text-2xl font-black transition-all placeholder:text-slate-100"
                                        placeholder="Type your name"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-6 left-0 transition-all group-focus-within:text-emerald-600">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-slate-100 focus:border-emerald-600 py-4 outline-none text-2xl font-black transition-all placeholder:text-slate-100"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-6 left-0 transition-all group-focus-within:text-emerald-600">Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-200 group-focus-within:text-emerald-600 transition-colors">$</span>
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-slate-100 focus:border-emerald-600 py-4 pl-6 outline-none text-5xl font-black transition-all placeholder:text-slate-100"
                                            placeholder="0.00"
                                            required
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <button 
                                    type="submit"
                                    className="group relative flex items-center justify-between w-full bg-emerald-600 hover:bg-black text-white px-8 py-6 rounded-full transition-all duration-500 overflow-hidden"
                                >
                                    <span className="text-xl font-black uppercase tracking-tighter relative z-10">Confirm & Pay</span>
                                    <ArrowRight size={28} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </button>
                                
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                        <Lock size={12} />
                                        <span>Secure Checkout</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-5 bg-slate-50 rounded sm"></div>
                                        <div className="w-8 h-5 bg-slate-50 rounded sm"></div>
                                        <div className="w-8 h-5 bg-slate-50 rounded sm"></div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Floating Footer */}
            <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full px-6 flex justify-center pointer-events-none">
                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 pointer-events-auto">
                    <a href="/terms-of-service" className="hover:text-emerald-600 transition-colors">Terms</a>
                    <a href="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy</a>
                    <a href="/refund" className="hover:text-emerald-600 transition-colors">Refunds</a>
                </div>
            </footer>
        </div>
    );
};

export default PaymentPage;
