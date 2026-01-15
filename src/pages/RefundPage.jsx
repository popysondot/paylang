import React, { useState } from 'react';
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

    const fetchPayments = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!backendUrl) {
            setStatus({ type: 'error', message: 'Backend configuration missing. Please set VITE_BACKEND_URL.' });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${backendUrl.replace(/\/$/, '')}/api/payments/${email}`);
            setPayments(response.data);
            if (response.data.length === 0) {
                setStatus({ type: 'error', message: 'No payments found for this email address. Please check the spelling.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to fetch payments. Please check your connection and try again.' });
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
                paymentId: selectedPayment.id,
                email: email,
                reason: reason
            });
            if (response.data.status === 'success') {
                setStatus({ type: 'success', message: 'Your refund appeal has been submitted successfully. Our compliance team will review it within 48 hours.' });
                setSelectedPayment(null);
                setReason('');
                setPayments([]);
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit refund appeal. Please try again or contact support.' });
        }
        setLoading(false);
    };

    return (
        <InfoLayout title="Refund Portal & Consumer Protection">
            <div className="space-y-12">
                {/* Hero Policy Section */}
                <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 flex flex-col md:flex-row gap-8 items-center">
                    <div className="bg-white p-6 rounded-3xl shadow-sm text-emerald-600">
                        <ShieldCheck size={48} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Our 100% Satisfaction Guarantee</h2>
                        <p className="text-slate-600 leading-relaxed max-w-2xl">
                            At TutorFlow, we stand by the quality of our tutors. If you're not satisfied, our transparent refund process ensures you get your money back. Appeals are processed fairly by our independent audit team.
                        </p>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { icon: Search, title: 'Locate', desc: 'Find your transaction using your email.' },
                        { icon: FileCheck, title: 'Appeal', desc: 'Describe the issue with the service.' },
                        { icon: LifeBuoy, title: 'Resolve', desc: 'We review and process in 48 hours.' }
                    ].map((step, i) => (
                        <div key={i} className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <step.icon className="mx-auto text-emerald-600 mb-4" size={28} />
                            <h4 className="font-black text-slate-800 mb-1">{step.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Search Form Container */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <History className="text-emerald-600" />
                        Search Your History
                    </h3>
                    
                    <form onSubmit={fetchPayments} className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-grow">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter the email used for payment"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-lg font-medium"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl"
                        >
                            <Search size={20} />
                            {loading ? 'Processing...' : 'Find Transactions'}
                        </button>
                    </form>

                    {status.message && (
                        <div className={`p-6 rounded-2xl flex items-start gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-100' : 'bg-red-50 text-red-800 border-2 border-red-100'}`}>
                            {status.type === 'success' ? <CheckCircle size={24} className="flex-shrink-0" /> : <AlertCircle size={24} className="flex-shrink-0" />}
                            <div>
                                <p className="font-black text-lg mb-1">{status.type === 'success' ? 'Submission Received' : 'Attention Required'}</p>
                                <p className="text-sm font-medium opacity-90">{status.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Transactions List */}
                    {payments.length > 0 && !selectedPayment && (
                        <div className="space-y-4">
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Found {payments.length} Transactions</p>
                            <div className="grid grid-cols-1 gap-4">
                                {payments.map((p) => (
                                    <div key={p.id} className="group flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-emerald-200 hover:bg-white transition-all shadow-hover cursor-pointer" onClick={() => setSelectedPayment(p)}>
                                        <div className="flex items-center gap-6 mb-4 sm:mb-0">
                                            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl font-black">
                                                ${p.amount}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800">Academic Support</p>
                                                <p className="text-xs text-slate-400 font-mono">{p.reference}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-bold text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                                            <button 
                                                className="bg-white text-emerald-600 font-black px-6 py-3 rounded-xl border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center gap-2"
                                            >
                                                Appeal
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Appeal Form Section */}
                    {selectedPayment && (
                        <div className="mt-8 bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border-2 border-emerald-500 shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">File an Appeal</h3>
                                    <p className="text-slate-500 font-medium">Reference: <span className="font-mono text-emerald-600 font-bold">{selectedPayment.reference}</span></p>
                                </div>
                                <button onClick={() => setSelectedPayment(null)} className="bg-white text-slate-400 hover:text-red-500 font-black px-6 py-2 rounded-full border border-slate-100 transition-all text-sm uppercase tracking-tighter">Cancel Request</button>
                            </div>

                            <form onSubmit={handleRefundRequest} className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <p className="text-slate-400 text-xs font-black uppercase mb-1">Total Paid</p>
                                        <p className="text-3xl font-black text-emerald-600">${selectedPayment.amount}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <p className="text-slate-400 text-xs font-black uppercase mb-1">Payment Date</p>
                                        <p className="text-3xl font-black text-slate-800">{new Date(selectedPayment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-lg font-black text-slate-800 ml-2">Reason for Appeal</label>
                                    <textarea 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-8 py-6 rounded-[2rem] border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 outline-none transition-all h-48 resize-none text-slate-700 font-medium"
                                        placeholder="Please provide details about why you are requesting a refund. The more information you provide, the faster we can process your request."
                                        required
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-emerald-600 text-white font-black py-6 rounded-[2rem] hover:bg-emerald-700 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] disabled:opacity-50 text-xl flex items-center justify-center gap-3"
                                >
                                    {loading ? 'Submitting...' : 'Submit Official Appeal'}
                                    <ArrowRight size={24} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
                
                {/* Support Footer */}
                <div className="text-center bg-slate-900 text-white p-12 rounded-[3rem] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                         <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <h4 className="text-xl font-black mb-4 relative z-10">Still need help?</h4>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto relative z-10">Our customer support team is available 24/7 to assist you with any payment or service related issues.</p>
                    <a href="mailto:support@tutorflow.edu" className="inline-flex items-center gap-3 bg-white text-slate-900 font-black px-10 py-4 rounded-2xl hover:bg-emerald-400 transition-all relative z-10 shadow-xl">
                        Email Support
                    </a>
                </div>
            </div>
        </InfoLayout>
    );
};

export default RefundPage;

