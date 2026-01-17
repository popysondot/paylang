import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, ShieldCheck, Clock, Award, CheckCircle2, Star, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight, BookOpen, PenTool, BrainCircuit } from 'lucide-react';

const PaymentPage = () => {
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [envError, setEnvError] = useState('');
    const [settings, setSettings] = useState({
        company_name: 'Service Platform',
        service_name: 'Professional Services',
        service_description: 'High-quality professional support from industry experts.',
        support_email: 'support@yourdomain.com',
        support_phone: '',
        landing_services: '[]',
        landing_testimonials: '[]'
    });
    const navigate = useNavigate();

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

        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        console.log('Environment Variables Check:');
        console.log('VITE_PAYSTACK_PUBLIC_KEY:', paystackKey ? 'SET' : 'MISSING');
        console.log('VITE_BACKEND_URL:', backendUrl ? 'SET' : 'MISSING');

        if (!paystackKey || !backendUrl) {
            const missingVars = [];
            if (!paystackKey) missingVars.push('VITE_PAYSTACK_PUBLIC_KEY');
            if (!backendUrl) missingVars.push('VITE_BACKEND_URL');
            
            const errorMsg = `Missing environment variables: ${missingVars.join(', ')}. Please set them in your hosting provider's dashboard and redeploy.`;
            setEnvError(errorMsg);
            console.error(errorMsg);
        }
    }, []);

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount * 100,
        publicKey: paystackKey,
        currency: 'USD',
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference) => {
        setIsProcessing(true);
        
        if (!backendUrl) {
            setIsProcessing(false);
            alert('Backend URL is not configured. Please contact support.');
            return;
        }

        axios.post(`${backendUrl.replace(/\/$/, '')}/api/verify-payment`, {
            reference: reference.reference,
            email: email,
            amount: amount,
            name: name
        }).then(res => {
            if (res.data.status === 'success') {
                setTimeout(() => {
                    navigate('/thank-you', { state: { reference: reference.reference, amount, email, name } });
                    setIsProcessing(false);
                }, 2000);
            }
        }).catch(err => {
            setIsProcessing(false);
            console.error('Verification error:', err);
            alert('Payment successful, but verification failed. Please check if your server is running.');
        });
    };

    const onClose = () => {
        setIsProcessing(false);
        console.log('Payment closed');
    };

    const handlePayment = (e) => {
        e.preventDefault();

        if (!paystackKey) {
            alert('Paystack Public Key is not configured. Please contact support.');
            return;
        }

        if (!backendUrl) {
            alert('Backend URL is not configured. Please contact support.');
            return;
        }

        if (!email || !amount || !name) {
            alert('Please fill in all fields');
            return;
        }

        if (amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        initializePayment(onSuccess, onClose);
    };

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ShieldCheck className="text-emerald-600" size={40} />
                    </div>
                </div>
                <h2 className="mt-8 text-2xl font-bold text-slate-800">Securing Your Transaction</h2>
                <p className="text-slate-500 mt-2">Processing with Paystack's bank-grade security...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-lg text-white">
                            <ShieldCheck size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">{settings.company_name}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#services" className="hover:text-emerald-600 transition-colors">Services</a>
                        <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</a>
                        <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Testimonials</a>
                        <a href="#checkout" className="bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200">Get Started</a>
                    </div>
                </div>
            </nav>

            {/* Environment Error Alert */}
            {envError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4">
                    <div className="max-w-7xl mx-auto">
                        <p className="font-bold">⚠️ Configuration Error</p>
                        <p className="text-sm mt-1">{envError}</p>
                    </div>
                </div>
            )}

            {/* Hero & Payment Section */}
            <section id="checkout" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={14} />
                            Professional Business Excellence
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1]">
                            The Secure Hub for <span className="text-emerald-600">{settings.service_name} Payments</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                            {settings.service_description}
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-6 pt-4">
                            {[
                                { icon: <ShieldCheck className="text-emerald-600" />, title: "Secure Checkout", desc: "Encrypted payments" },
                                { icon: <Clock className="text-emerald-600" />, title: "24/7 Support", desc: "Always here to help" },
                                { icon: <Award className="text-emerald-600" />, title: "Premium Service", desc: "Quality guaranteed" },
                                { icon: <BrainCircuit className="text-emerald-600" />, title: "Industry Experts", desc: "Subject specialists" }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="bg-white p-2 rounded-lg shadow-sm h-fit">{feature.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{feature.title}</h4>
                                        <p className="text-sm text-slate-500">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-emerald-600/5 rounded-3xl blur-2xl"></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-slate-900">Payment Details</h3>
                                <p className="text-slate-500 mt-1">Submit your info to initiate secure payment</p>
                            </div>

                            {envError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">
                                        <strong>Payment unavailable:</strong> The system is not properly configured. Please contact support.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handlePayment} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Enter your legal name"
                                        required
                                        disabled={!!envError}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                        placeholder="client@example.com"
                                        required
                                        disabled={!!envError}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Service Reference / ID</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                        placeholder="e.g. REF-1002"
                                        disabled={!!envError}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-slate-400 font-bold">$</span>
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full pl-8 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                            placeholder="0.00"
                                            required
                                            disabled={!!envError}
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={!!envError}
                                    className={`w-full font-black py-5 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 group ${
                                        envError 
                                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:-translate-y-1 active:scale-[0.98]'
                                    }`}
                                >
                                    {envError ? 'Configuration Required' : 'Proceed to Paystack'}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
                                <div className="flex items-center gap-1"><ShieldCheck size={14} /> PCI-DSS Compliant</div>
                                <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                <div>256-bit SSL</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">{settings.service_name} Solutions</h2>
                        <p className="text-lg text-slate-500 leading-relaxed">Expert solutions tailored to your professional and operational requirements.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {(() => {
                            try {
                                const services = JSON.parse(settings.landing_services || '[]');
                                return services.map((s, i) => (
                                    <div key={i} className="group p-8 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300">
                                        <div className="bg-emerald-50 p-4 rounded-2xl w-fit mb-6 group-hover:bg-white group-hover:shadow-md transition-all">
                                            <ShieldCheck className="text-emerald-600" size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                                        <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                                    </div>
                                ));
                            } catch (e) {
                                return <p className="text-slate-400 italic">Configure services in Admin Settings</p>;
                            }
                        })()}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-bold mb-4">Trusted by 5,000+ Clients Worldwide</h2>
                            <p className="text-emerald-100/60 text-lg">See why clients from leading organizations choose {settings.company_name} for their professional needs.</p>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="#10b981" className="text-emerald-500" />)}
                            <span className="ml-2 font-bold">4.9/5 Rating</span>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(() => {
                            try {
                                const testimonials = JSON.parse(settings.landing_testimonials || '[]');
                                return testimonials.map((t, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <p className="text-lg text-emerald-50 italic mb-6">"{t.quote}"</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-lg">
                                                {t.name ? t.name[0] : 'C'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{t.name}</h4>
                                                <p className="text-xs text-emerald-100/50">{t.uni}</p>
                                            </div>
                                        </div>
                                    </div>
                                ));
                            } catch (e) {
                                return <p className="text-slate-400 italic">Configure testimonials in Admin Settings</p>;
                            }
                        })()}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-xl font-bold text-slate-800">{settings.company_name}</span>
                            </div>
                            <p className="text-slate-500 leading-relaxed">{settings.service_description} Available globally.</p>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-slate-900 mb-8">Quick Links</h4>
                            <ul className="space-y-4 text-slate-500">
                                <li><Link to="/about-us" className="hover:text-emerald-600 transition-colors">About Our Experts</Link></li>
                                <li><Link to="/pricing" className="hover:text-emerald-600 transition-colors">Service Pricing</Link></li>
                                <li><Link to="/refund" className="hover:text-emerald-600 transition-colors">Refund Portal</Link></li>
                                <li><Link to="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms-of-service" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-8">Our Services</h4>
                            <ul className="space-y-4 text-slate-500">
                                <li><Link to="/consulting" className="hover:text-emerald-600 transition-colors">Business Consulting</Link></li>
                                <li><Link to="/research" className="hover:text-emerald-600 transition-colors">Specialized Research</Link></li>
                                <li><Link to="/support" className="hover:text-emerald-600 transition-colors">Operational Support</Link></li>
                                <li><Link to="/solutions" className="hover:text-emerald-600 transition-colors">Industry Solutions</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-8">Contact Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-slate-500">
                                    <MapPin size={20} className="text-emerald-600 flex-shrink-0" />
                                    <span>Level 24, Professional Plaza, Business District</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Phone size={20} className="text-emerald-600 flex-shrink-0" />
                                    <span>{settings.support_phone || '+1 (555) 000-1234'}</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Mail size={20} className="text-emerald-600 flex-shrink-0" />
                                    <span>{settings.support_email}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-400">
                        <p>© {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
                        <div className="flex gap-8">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PaymentPage;
