import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';
import { useToast } from '../components/Toast';
import { 
    Search, 
    AlertCircle, 
    CheckCircle, 
    ArrowRight, 
    ShieldCheck, 
    History, 
    LifeBuoy,
    FileCheck
} from 'lucide-react';

const RefundPage = () => {
    const { addToast } = useToast();

    const getBaseUrl = () => {
        if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:5000'
            : '';
    };

    const [email, setEmail] = useState('');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        support_email: 'support@moonderiv.com',
        refund_policy_days: '14',
        service_name: 'Professional Services'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${getBaseUrl()}/api/settings`);
                if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, []);

    const fetchPayments = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        
        try {
            const response = await axios.get(`${getBaseUrl()}/api/payments/${email}`);
            setPayments(response.data);
            if (response.data.length === 0) {
                addToast('No payments found for this email', 'error');
            }
        } catch (error) {
            addToast('Failed to fetch payments', 'error');
        }
        setLoading(false);
    };

    const handleRefundRequest = async (e) => {
        e.preventDefault();
        if (!selectedPayment) return;
        setLoading(true);

        try {
            const response = await axios.post(`${getBaseUrl()}/api/refund-request`, {
                reference: selectedPayment.reference,
                email: email,
                reason: reason
            });
            if (response.data.status === 'success') {
                addToast('Refund appeal submitted successfully', 'success');
                setSelectedPayment(null);
                setReason('');
                setPayments([]);
            }
        } catch (error) {
            addToast('Failed to submit refund appeal', 'error');
        }
        setLoading(false);
    };

    return (
        <InfoLayout title="Settlement Adjustments">
            <div className="space-y-32 relative z-10">
                {/* Hero Policy Section */}
                <div className="py-20 flex flex-col md:flex-row gap-16 faded-line-y">
                    <div className="w-1.5 h-20 bg-gradient-to-b from-[#f59e0b] to-transparent shrink-0 relative z-10"></div>
                    <div className="space-y-8 relative z-10">
                        <h2 className="text-[10px] font-black text-[#f59e0b] tracking-[0.6em] uppercase">Financial Adjustment Policy</h2>
                        <p className="text-3xl md:text-5xl text-white/40 font-black leading-tight max-w-5xl tracking-tighter uppercase">
                            <span className="text-white">{settings.company_name}</span> maintains a structured protocol for transaction adjustments. Requests are evaluated based on <span className="text-[#10b981]">service delivery</span> logs.
                        </p>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 py-20 faded-line-b">
                    {[
                        { title: 'Identification', desc: 'Locate the specific transaction reference.' },
                        { title: 'Submission', desc: 'Submit a detailed adjustment request.' },
                        { title: 'Verification', desc: 'Administrative review and processing.' }
                    ].map((step, i) => (
                        <div key={i} className={`space-y-8 relative ${i > 0 ? 'md:faded-line-l md:pl-16' : ''}`}>
                            <div className="text-[10px] font-black text-white/20 tracking-[0.6em] uppercase relative z-10">Phase 0{i+1}</div>
                            <h4 className="text-3xl font-black text-white uppercase tracking-tighter group-hover:text-[#10b981] transition-colors relative z-10">{step.title}</h4>
                            <p className="text-white/30 text-lg font-black uppercase tracking-tighter relative z-10">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Search Form Container */}
                <div className="space-y-24 py-20">
                    <div className="space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-[1px] bg-[#10b981]"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/60">Transaction History Query</h3>
                        </div>
                        
                        <form onSubmit={fetchPayments} className="max-w-4xl space-y-12">
                            <div className="space-y-8">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block">Entity Email Signature</label>
                                <div className="flex flex-col md:flex-row gap-12 items-center faded-line-b py-4">
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ENTER REGISTERED EMAIL"
                                        className="flex-1 bg-transparent py-6 outline-none text-2xl md:text-3xl font-black transition-all placeholder:text-white/10 text-white uppercase tracking-tighter"
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="modern-action-green text-xl whitespace-nowrap"
                                    >
                                        {loading ? 'Processing...' : 'Execute Search'}
                                        <ArrowRight size={24} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {status.message && (
                        <div className="py-12 faded-line-b animate-in fade-in slide-in-from-top-4 duration-300">
                            <p className={`font-black uppercase tracking-[0.6em] text-[10px] mb-4 ${status.type === 'success' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                                {status.type === 'success' ? 'Submission Received' : 'Attention Required'}
                            </p>
                            <p className="text-3xl font-black tracking-tighter text-white uppercase">{status.message}</p>
                        </div>
                    )}

                    {/* Transactions List */}
                    {payments.length > 0 && !selectedPayment && (
                        <div className="space-y-12 animate-in fade-in duration-700">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Found {payments.length} Registered Transactions</p>
                            <div className="space-y-1">
                                {payments.map((p) => (
                                    <div key={p.id} className="group py-12 faded-line-b flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.01] transition-all cursor-pointer" onClick={() => setSelectedPayment(p)}>
                                        <div className="flex items-center gap-12 mb-8 md:mb-0">
                                            <div className="text-5xl font-black text-white leading-none tracking-tighter group-hover:text-[#10b981] transition-colors">
                                                ${p.amount}
                                            </div>
                                            <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                                            <div>
                                                <p className="font-black text-white uppercase tracking-tighter text-2xl group-hover:translate-x-2 transition-all">{settings.service_name}</p>
                                                <p className="text-[10px] text-white/20 font-black tracking-[0.4em] mt-2 uppercase">{p.reference}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-16 w-full md:w-auto justify-between md:justify-end">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{new Date(p.createdAt).toLocaleDateString()}</p>
                                            <div className="modern-action-green opacity-40 group-hover:opacity-100 whitespace-nowrap">
                                                Initiate Appeal
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Appeal Form Section */}
                    {selectedPayment && (
                        <div className="py-20 animate-in zoom-in-95 duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 faded-line-b pb-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-[1px] bg-[#10b981]"></div>
                                        <p className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.6em]">Official Appeal Interface</p>
                                    </div>
                                    <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">Adjustment <br /> Request</h3>
                                    <p className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase">Ref: {selectedPayment.reference}</p>
                                </div>
                                <button onClick={() => setSelectedPayment(null)} className="modern-action-white opacity-40 hover:opacity-100">Discard Request</button>
                            </div>

                            <form onSubmit={handleRefundRequest} className="space-y-20">
                                <div className="grid md:grid-cols-2 gap-16 py-12 faded-line-y">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Transaction Value</p>
                                        <p className="text-6xl font-black text-white leading-none tracking-tighter">${selectedPayment.amount}</p>
                                    </div>
                                    <div className="space-y-4 md:faded-line-l md:pl-16">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Settlement Date</p>
                                        <p className="text-6xl font-black text-white leading-none tracking-tighter">{new Date(selectedPayment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block">Reason for Adjustment Appeal</label>
                                    <textarea 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-transparent faded-line-b py-6 outline-none text-2xl font-black text-white h-48 resize-none transition-all placeholder:text-white/5 uppercase tracking-tighter focus:border-[#10b981]"
                                        placeholder="PROVIDE DETAILED LOG DISCREPANCIES..."
                                        required
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="modern-action-green text-3xl w-full justify-between py-6"
                                >
                                    <span>{loading ? 'Transmitting...' : 'Submit Official Appeal'}</span>
                                    <ArrowRight size={40} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
                
                {/* Support Footer */}
                <div className="py-32 faded-line-t space-y-16 animate-in fade-in duration-1000">
                    <div className="space-y-8">
                        <p className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.6em]">Support Interface</p>
                        <h4 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">Direct <br /> Resolution.</h4>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-16">
                        <p className="text-2xl font-black uppercase tracking-tighter text-white/30 max-w-2xl leading-tight">Our administrative team is available to resolve complex settlement discrepancies and process manual adjustments.</p>
                        <a href={`mailto:${settings.support_email}`} className="modern-action-white text-xl hover:gap-8 whitespace-nowrap">
                            Contact Support
                            <ArrowRight size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </InfoLayout>
    );
};

export default RefundPage;
