import React, { useState, useEffect } from 'react';
import InfoLayout from '../components/InfoLayout';
import axios from 'axios';
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
                const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
                const res = await axios.get(`${baseUrl}/api/settings`);
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
        
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!backendUrl) {
            setStatus({ type: 'error', message: 'Backend configuration missing.' });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${backendUrl.replace(/\/$/, '')}/api/payments/${email}`);
            setPayments(response.data);
            if (response.data.length === 0) {
                setStatus({ type: 'error', message: 'No payments found for this email address.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to fetch payments.' });
        }
        setLoading(false);
    };

    const handleRefundRequest = async (e) => {
        e.preventDefault();
        if (!selectedPayment) return;
        setLoading(true);

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!backendUrl) {
            setStatus({ type: 'error', message: 'Backend configuration missing.' });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${backendUrl.replace(/\/$/, '')}/api/refund-request`, {
                reference: selectedPayment.reference,
                email: email,
                reason: reason
            });
            if (response.data.status === 'success') {
                setStatus({ type: 'success', message: 'Your refund appeal has been submitted successfully.' });
                setSelectedPayment(null);
                setReason('');
                setPayments([]);
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit refund appeal.' });
        }
        setLoading(false);
    };

    return (
        <InfoLayout title="Refund Portal & Consumer Protection">
            <div className="space-y-16">
                {/* Hero Policy Section */}
                <div className="bg-slate-900/50 rounded-[2rem] p-8 md:p-12 border border-slate-800 flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck size={40} className="text-[#0f172a]" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white tracking-tight">Our 100% Satisfaction Guarantee</h2>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                            At <span className="text-white font-bold">{settings.company_name}</span>, we stand by our quality. If you're not satisfied, our transparent refund process ensures fairness. Appeals are processed by our independent audit team.
                        </p>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        { icon: Search, title: 'Locate', desc: 'Find your transaction using email.' },
                        { icon: FileCheck, title: 'Appeal', desc: 'Describe the issue with the service.' },
                        { icon: LifeBuoy, title: 'Resolve', desc: 'Review and process in 48 hours.' }
                    ].map((step, i) => (
                        <div key={i} className="group p-8 bg-slate-900/30 border border-slate-800 rounded-[2rem] hover:border-emerald-500 transition-all">
                            <step.icon className="text-emerald-500 mb-6" size={32} />
                            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{step.title}</h4>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Search Form Container */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4">
                        <History className="text-emerald-500" />
                        <h3 className="text-xl font-black uppercase tracking-widest text-white">Search History</h3>
                    </div>
                    
                    <form onSubmit={fetchPayments} className="max-w-3xl space-y-6">
                        <div className="group relative">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-4 group-focus-within:text-emerald-400 transition-colors">Email Address</label>
                            <div className="flex flex-col md:flex-row gap-6">
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter the email used for payment"
                                    className="flex-1 bg-transparent border-b-2 border-slate-800 focus:border-emerald-500 py-4 outline-none text-2xl md:text-3xl font-black transition-all placeholder:text-slate-800"
                                    required
                                />
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="bg-emerald-500 text-[#0f172a] font-black px-10 py-4 rounded-full hover:bg-white transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"
                                >
                                    {loading ? 'Searching...' : 'Find Transactions'}
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>
                    </form>

                    {status.message && (
                        <div className={`p-8 rounded-[2rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                            {status.type === 'success' ? <CheckCircle size={24} className="flex-shrink-0" /> : <AlertCircle size={24} className="flex-shrink-0" />}
                            <div>
                                <p className="font-black uppercase tracking-widest text-xs mb-2">{status.type === 'success' ? 'Submission Received' : 'Attention Required'}</p>
                                <p className="text-lg font-medium">{status.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Transactions List */}
                    {payments.length > 0 && !selectedPayment && (
                        <div className="space-y-6 pt-10">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Found {payments.length} Transactions</p>
                            <div className="grid grid-cols-1 gap-4">
                                {payments.map((p) => (
                                    <div key={p.id} className="group flex flex-col md:flex-row items-center justify-between p-8 bg-slate-900/30 border border-slate-800 rounded-[2rem] hover:border-emerald-500 transition-all cursor-pointer" onClick={() => setSelectedPayment(p)}>
                                        <div className="flex items-center gap-8 mb-6 md:mb-0">
                                            <div className="text-4xl font-black text-white leading-none">
                                                ${p.amount}
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase tracking-tight">{settings.service_name}</p>
                                                <p className="text-xs text-slate-500 font-mono mt-1">{p.reference}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</p>
                                            <div className="bg-slate-900 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-emerald-500 group-hover:text-[#0f172a] transition-all flex items-center gap-2">
                                                Appeal <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Appeal Form Section */}
                    {selectedPayment && (
                        <div className="mt-12 bg-slate-900/50 rounded-[2rem] p-8 md:p-12 border border-emerald-500 animate-in zoom-in-95 duration-300">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-12 border-b border-slate-800">
                                <div className="space-y-2">
                                    <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Official Appeal</p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter">File a Request</h3>
                                    <p className="text-sm font-mono text-slate-500">Ref: {selectedPayment.reference}</p>
                                </div>
                                <button onClick={() => setSelectedPayment(null)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-red-400 transition-colors">Discard Request</button>
                            </div>

                            <form onSubmit={handleRefundRequest} className="space-y-12">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Transaction Value</p>
                                        <p className="text-4xl font-black text-white leading-none">${selectedPayment.amount}</p>
                                    </div>
                                    <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Settlement Date</p>
                                        <p className="text-4xl font-black text-white leading-none">{new Date(selectedPayment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Reason for Appeal</label>
                                    <textarea 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-emerald-500 rounded-3xl p-8 outline-none text-xl font-medium text-slate-300 h-48 resize-none transition-all placeholder:text-slate-800"
                                        placeholder="Detail the discrepancy or issue..."
                                        required
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="group w-full bg-emerald-500 text-[#0f172a] font-black py-8 rounded-full hover:bg-white transition-all duration-500 disabled:opacity-50 text-xl uppercase tracking-tighter flex items-center justify-between px-12"
                                >
                                    <span>{loading ? 'Processing...' : 'Submit Official Appeal'}</span>
                                    <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
                
                {/* Support Footer */}
                <div className="bg-slate-900/50 border border-slate-800 p-12 md:p-20 rounded-[3rem] text-center space-y-8 animate-in fade-in duration-1000">
                    <div className="space-y-4">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Need Assistance?</p>
                        <h4 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Talk to a Human.</h4>
                    </div>
                    <p className="text-xl font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">Our specialized billing team is available 24/7 to resolve complex service discrepancies and process manual overrides.</p>
                    <a href={`mailto:${settings.support_email}`} className="group inline-flex items-center gap-6 bg-white text-[#0f172a] font-black px-12 py-6 rounded-full hover:bg-emerald-500 transition-all duration-500 uppercase tracking-widest text-xs">
                        Open Support Ticket <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </a>
                </div>
            </div>
        </InfoLayout>
    );
};

export default RefundPage;
