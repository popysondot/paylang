import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, DollarSign, Clock, AlertCircle, CheckCircle, Eye, ArrowLeft, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const [email, setEmail] = useState('');
    const [orders, setOrders] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [settings, setSettings] = useState({ company_name: 'Payment Hub' });
    const navigate = useNavigate();

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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
            const res = await axios.get(`${baseUrl}/api/customer/orders/${email}`);
            setOrders(res.data.payments || []);
            setRefunds(res.data.refunds || []);
            setLoading(false);
        } catch (err) {
            setError('No orders found for this email. Please check and try again.');
            setOrders([]);
            setRefunds([]);
            setLoading(false);
        }
    };

    const getRefundsForOrder = (paymentId) => {
        return refunds.filter(r => r.paymentId === paymentId);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return 'text-emerald-400';
            case 'pending':
                return 'text-amber-400';
            case 'approved':
                return 'text-blue-400';
            case 'rejected':
                return 'text-red-400';
            default:
                return 'text-slate-500';
        }
    };

    if (selectedOrder) {
        const orderRefunds = getRefundsForOrder(selectedOrder.id);
        return (
            <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col">
                <nav className="w-full max-w-[1400px] mx-auto px-6 py-8 flex justify-between items-center">
                    <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
                        <ArrowLeft size={14} /> Back to List
                    </button>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{settings.company_name}</span>
                </nav>

                <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Transaction Detail</p>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] text-white break-all">
                                {selectedOrder.reference.slice(0, 8)}<span className="text-slate-800 outline-text">{selectedOrder.reference.slice(8)}</span>
                            </h1>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 pt-12 border-t border-slate-900">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Amount Paid</span>
                                <p className="text-5xl font-black text-white leading-none">${Number(selectedOrder.amount).toFixed(2)}</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Status</span>
                                <p className={`text-xl font-black uppercase tracking-tighter ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Date</span>
                                <p className="text-xl font-black text-white">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {orderRefunds.length > 0 && (
                            <div className="space-y-8 pt-12">
                                <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">Refund History</h2>
                                <div className="space-y-4">
                                    {orderRefunds.map((refund) => (
                                        <div key={refund.id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-2">
                                                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Requested on {new Date(refund.createdAt).toLocaleDateString()}</p>
                                                <p className="text-lg font-medium text-slate-300">{refund.reason}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`text-sm font-black uppercase tracking-widest ${getStatusColor(refund.status)}`}>{refund.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {orderRefunds.length === 0 && selectedOrder.status === 'success' && (
                            <div className="pt-12">
                                <button 
                                    onClick={() => navigate('/refund')}
                                    className="group flex items-center gap-4 bg-emerald-500 text-[#0f172a] px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-all duration-500"
                                >
                                    Request Refund <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                <style jsx>{`
                    .outline-text {
                        -webkit-text-stroke: 1px #334155;
                        color: transparent;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col">
            <nav className="w-full max-w-[1400px] mx-auto px-6 py-8 flex justify-between items-center relative z-10">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-[#0f172a]" size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{settings.company_name}</span>
                </Link>
                <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
                    Back to Hub
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="max-w-4xl space-y-12">
                    <div className="space-y-4">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Client Portal</p>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                            Order <br />
                            <span className="text-slate-800 outline-text">Tracking.</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium pt-4">Search your transaction history by email.</p>
                    </div>

                    {!searched ? (
                        <div className="pt-12">
                            <form onSubmit={handleSearch} className="relative group max-w-xl">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-4 group-focus-within:text-emerald-400">Email Address</label>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="flex-1 bg-transparent border-b-2 border-slate-800 focus:border-emerald-500 py-4 outline-none text-2xl md:text-4xl font-black transition-all placeholder:text-slate-800"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="bg-emerald-500 text-[#0f172a] px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-all duration-500 flex items-center justify-center gap-2"
                                    >
                                        Search <Search size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-12 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex justify-between items-end border-b border-slate-900 pb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Showing results for</p>
                                    <p className="text-xl font-black text-white">{email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSearched(false);
                                        setEmail('');
                                        setOrders([]);
                                        setRefunds([]);
                                    }}
                                    className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Change Email
                                </button>
                            </div>

                            {loading && (
                                <div className="py-20 flex flex-col items-center">
                                    <div className="w-12 h-12 border-2 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Querying Ledger</p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-[2rem] flex items-center gap-4">
                                    <AlertCircle size={24} />
                                    <p className="font-bold">{error}</p>
                                </div>
                            )}

                            {!loading && orders.length === 0 && !error && (
                                <div className="py-20 text-center space-y-4">
                                    <Package size={48} className="text-slate-800 mx-auto" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No records found</p>
                                </div>
                            )}

                            {!loading && orders.length > 0 && (
                                <div className="grid grid-cols-1 gap-4">
                                    {orders.map((order) => {
                                        const orderRefunds = getRefundsForOrder(order.id);
                                        return (
                                            <div
                                                key={order.id}
                                                onClick={() => setSelectedOrder(order)}
                                                className="group bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] hover:border-emerald-500 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
                                            >
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                                            <Package className="text-slate-600 group-hover:text-[#0f172a]" size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Reference</p>
                                                            <p className="font-mono font-bold text-slate-300 break-all">{order.reference}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Amount</p>
                                                            <p className="text-2xl font-black text-white">${Number(order.amount).toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                                                            <p className={`text-sm font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>{order.status}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Date</p>
                                                            <p className="text-sm font-black text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        {orderRefunds.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Refunds</p>
                                                                <p className="text-sm font-black text-amber-500">{orderRefunds.length} Actioned</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bg-slate-900 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-white group-hover:text-[#0f172a] transition-all flex items-center gap-2">
                                                    Details <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="w-full max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-900/50 mt-auto">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                    © {new Date().getFullYear()} {settings.company_name}. End-to-End Encryption Enabled.
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

export default CustomerDashboard;
