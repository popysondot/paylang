import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, ShieldCheck, Clock, Award, CheckCircle2, Star, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight, BookOpen, PenTool, BrainCircuit } from 'lucide-react';

const PaymentPage = () => {
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo/cents
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        currency: 'USD',
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference) => {
        setIsProcessing(true);
        // Verify payment on the backend
        axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/verify-payment`, {
            reference: reference.reference,
            email: email,
            amount: amount,
            name: name
        }).then(res => {
            if (res.data.status === 'success') {
                setTimeout(() => {
                    setIsProcessing(false);
                    navigate('/thank-you', { state: { reference: reference.reference, amount, email, name } });
                }, 2000); // Small delay to show the cool preloader
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
        if (!email || !amount || !name) {
            alert('Please fill in all fields');
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
                            <GraduationCap size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">TutorFlow</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#services" className="hover:text-emerald-600 transition-colors">Services</a>
                        <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</a>
                        <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Testimonials</a>
                        <a href="#checkout" className="bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200">Get Started</a>
                    </div>
                </div>
            </nav>

            {/* Hero & Payment Section */}
            <section id="checkout" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={14} />
                            Verified Academic Excellence
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1]">
                            The Secure Hub for <span className="text-emerald-600">Assignment Payments</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                            Fast, encrypted, and reliable. Complete your payment to initiate high-quality academic support from our PhD experts.
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-6 pt-4">
                            {[
                                { icon: <ShieldCheck className="text-emerald-600" />, title: "Secure Checkout", desc: "Paystack encrypted" },
                                { icon: <Clock className="text-emerald-600" />, title: "24/7 Support", desc: "Always here to help" },
                                { icon: <Award className="text-emerald-600" />, title: "Quality Work", desc: "Plagiarism free" },
                                { icon: <BrainCircuit className="text-emerald-600" />, title: "Expert Tutors", desc: "Subject specialists" }
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                        placeholder="university@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Assignment Reference / ID</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                        placeholder="e.g. ASGN-9921"
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
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 group"
                                >
                                    Proceed to Paystack
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
                        <h2 className="text-4xl font-bold text-slate-900 mb-4 font-serif">Tailored Academic Support</h2>
                        <p className="text-lg text-slate-500 leading-relaxed">We specialize in various fields to ensure you get the specific help you need for your academic journey.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <BookOpen className="text-emerald-600" size={32} />, title: "Dissertation Help", desc: "Full research support from proposal to final defense chapters." },
                            { icon: <PenTool className="text-emerald-600" size={32} />, title: "Essay Writing", desc: "Custom, well-researched essays written to your specific university standards." },
                            { icon: <BrainCircuit className="text-emerald-600" size={32} />, title: "STEM Assignments", desc: "Expert solutions for complex Mathematics, Coding, and Engineering tasks." }
                        ].map((s, i) => (
                            <div key={i} className="group p-8 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300">
                                <div className="bg-emerald-50 p-4 rounded-2xl w-fit mb-6 group-hover:bg-white group-hover:shadow-md transition-all">
                                    {s.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-bold mb-4">Trusted by 5,000+ Students Worldwide</h2>
                            <p className="text-emerald-100/60 text-lg">See why students from top universities choose TutorFlow for their academic needs.</p>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="#10b981" className="text-emerald-500" />)}
                            <span className="ml-2 font-bold">4.9/5 Rating</span>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah J.", uni: "Stanford University", quote: "The level of detail in my statistics project was incredible. Got an A!" },
                            { name: "Michael L.", uni: "LSE London", quote: "Fast turnaround and very professional communication. Highly recommended." },
                            { name: "Elena R.", uni: "University of Toronto", quote: "Helped me structure my entire thesis. The research was top-notch." }
                        ].map((t, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                                <p className="text-lg text-emerald-50 italic mb-6">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-lg">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{t.name}</h4>
                                        <p className="text-xs text-emerald-100/50">{t.uni}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                    <GraduationCap size={20} />
                                </div>
                                <span className="text-xl font-bold text-slate-800">TutorFlow</span>
                            </div>
                            <p className="text-slate-500 leading-relaxed">Empowering students through premium academic mentorship and support services. Available globally.</p>
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
                                <li><Link to="/about-tutors" className="hover:text-emerald-600 transition-colors">About Our Tutors</Link></li>
                                <li><Link to="/pricing" className="hover:text-emerald-600 transition-colors">Pricing Guide</Link></li>
                                <li><Link to="/refund" className="hover:text-emerald-600 transition-colors">Refund Portal</Link></li>
                                <li><Link to="/admin" className="hover:text-emerald-600 transition-colors">Admin Dashboard</Link></li>
                                <li><Link to="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms-of-service" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-8">Our Services</h4>
                            <ul className="space-y-4 text-slate-500">
                                <li><Link to="/law-assignments" className="hover:text-emerald-600 transition-colors">Law Assignments</Link></li>
                                <li><Link to="/medical-research" className="hover:text-emerald-600 transition-colors">Medical Research</Link></li>
                                <li><Link to="/business-case-studies" className="hover:text-emerald-600 transition-colors">Business Case Studies</Link></li>
                                <li><Link to="/phd-consultation" className="hover:text-emerald-600 transition-colors">PhD Consultation</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-8">Contact Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-slate-500">
                                    <MapPin size={20} className="text-emerald-600 flex-shrink-0" />
                                    <span>Level 24, Academic Tower, Education District</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Phone size={20} className="text-emerald-600 flex-shrink-0" />
                                    <span>+1 (555) 000-1234</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Mail size={20} className="text-emerald-600 flex-shrink-0" />
                                    <span>support@tutorflow.edu</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-400">
                        <p>© 2024 TutorFlow Academic Services. All rights reserved.</p>
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
