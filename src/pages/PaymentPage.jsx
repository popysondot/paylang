import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, CreditCard, Mail, User, DollarSign, AlertCircle, Lock, ChevronRight } from 'lucide-react';
import { useToast } from '../components/Toast';

const PaymentPage = () => {
    const { addToast } = useToast();
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [envError, setEnvError] = useState('');
    const [settings, setSettings] = useState({
        company_name: 'Direct Settlement',
        service_name: 'System Protocol',
    });
    
    const getBaseUrl = () => {
        return window.location.hostname === 'localhost' 
            ? (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
            : '';
    };

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('email')) setEmail(params.get('email'));
        if (params.get('name')) setName(params.get('name'));
        if (params.get('amount')) setAmount(params.get('amount'));

        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${getBaseUrl()}/api/settings`);
                if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();

        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        const isLocal = window.location.hostname === 'localhost';
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        if (!paystackKey || (isLocal && !backendUrl)) {
            setEnvError('Configuration missing.');
        }
    }, [location]);

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: parseFloat(amount) * 100,
        publicKey: paystackKey,
        currency: 'USD',
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: name
                }
            ]
        }
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference) => {
        setIsProcessing(true);
        navigate('/thank-you', { state: { reference: reference.reference, amount, email, name } });

        axios.post(`${getBaseUrl()}/api/verify-payment`, {
            reference: reference.reference,
            email: email,
            amount: amount,
            name: name
        }).catch(err => {
            console.error('Verification failed:', err.message);
        });
    };

    const handlePayment = (e) => {
        e.preventDefault();
        const isLocal = window.location.hostname === 'localhost';
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        if (!paystackKey || (isLocal && !backendUrl)) {
            addToast('System configuration incomplete', 'error');
            return;
        }
        if (!email || !amount || !name) {
            addToast('Missing identity or amount', 'error');
            return;
        }
        initializePayment(onSuccess, () => setIsProcessing(false));
    };

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 border-[2px] border-white/5 border-t-[#10b981] rounded-full animate-spin mb-8"></div>
                <p className="text-[11px] font-black text-white uppercase tracking-[0.8em] ml-[0.8em]">VALIDATING_SESSION</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col font-sans relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f59e0b]/3 blur-[120px] rounded-full"></div>
            </div>

            {/* Nav */}
            <nav className="w-full max-w-[1400px] mx-auto px-8 py-10 flex justify-between items-center relative z-10 faded-line-b">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#10b981] rounded-full"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{settings.company_name}</span>
                </div>
                <div className="flex items-center gap-8">
                    {envError && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#f59e0b]">{envError}</span>
                    )}
                    <Link to="/orders" className="modern-action-white hover:opacity-100">
                        DASHBOARD
                    </Link>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 grid lg:grid-cols-2 gap-24 items-center py-20 relative z-10">
                {/* Hero Section */}
                <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-[1px] bg-[#f59e0b] rounded-full"></div>
                            <p className="text-[#f59e0b] text-[10px] font-black uppercase tracking-[0.5em]">SETTLEMENT PROTOCOL</p>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                            Secure <br />
                            <span className="text-white/50">Settlement.</span>
                        </h1>
                    </div>

                    <p className="text-xl text-green-700 font-black max-w-sm leading-tight border-l-2 border-[#10b981] pl-8 uppercase tracking-tighter">
                        Authorized payment gateway for <span className="text-yellow-600">{settings.company_name}</span> institutional transactions.
                    </p>
                </div>

                {/* Interaction Section */}
                <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                    <div className="relative group">
                        <form onSubmit={handlePayment} className="relative space-y-12">
                            <div className="space-y-12">
                                <div className="group relative">
                                    <label className="text-[9px] font-black text-white uppercase tracking-[0.4em] block mb-2 group-focus-within:text-[#10b981] transition-all">Entity Identity</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent faded-line-b py-6 outline-none text-xl font-black transition-all placeholder:text-white/20 uppercase text-white focus:border-[#10b981]"
                                        placeholder="Name"
                                        required
                                    />
                                </div>

                                <div className="group relative">
                                    <label className="text-[9px] font-black textwhite/20 uppercase tracking-[0.4em] block mb-2 group-focus-within:text-[#10b981] transition-all">Email Address</label> 
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent faded-line-b py-6 outline-none text-xl font-black transition-all placeholder:text-white/20 text-white focus:border-[#10b981]"
                                        placeholder="company@domain.com"
                                        required
                                    />
                                </div>

                                <div className="group relative">
                                    <label className="text-[9px] font-black text-white uppercase tracking-[0.4em] block mb-2">Settlement Value (USD)</label>
                                    <div className="flex items-center gap-6 faded-line-b focus-within:border-[#f59e0b] transition-all pb-2">
                                        <span className="text-4xl font-black text-green-500">$</span>
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="flex-1 bg-transparent border-none outline-none text-5xl md:text-5xl font-black transition-all placeholder:text-green-500 text-green-500 tracking-tighter"
                                            placeholder="0.00"
                                            required
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="modern-action-green text-3xl hover:gap-10 w-full justify-center gap-4 py-4 underline"
                            >
                                <span>Initialize Payment</span>
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-[1400px] mx-auto px-8 py-16 flex flex-col md:flex-row justify-between items-end gap-12 faded-line-t mt-auto relative z-10">
                <div className="flex flex-col md:flex-row gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                    <Link to="/terms-of-service" className="hover:text-white transition-colors">TERMS</Link>
                    <Link to="/privacy-policy" className="hover:text-white transition-colors">INTEGRITY</Link>
                    <Link to="/refund" className="hover:text-[#f59e0b] transition-colors">ADJUSTMENT</Link>
                </div>
                <div className="text-right space-y-4">
                    <p className="text-[9px] font-black text-orange-300 uppercase tracking-[0.6em]">
                        © {new Date().getFullYear()} {settings.company_name} // NODE_{config.reference.slice(-4)}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">SYSTEM_NOMINAL</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PaymentPage;
