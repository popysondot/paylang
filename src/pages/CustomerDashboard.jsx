import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, DollarSign, Clock, AlertCircle, CheckCircle, Eye, ArrowLeft, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const getBaseUrl = () => {
        return window.location.hostname === 'localhost' 
            ? (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
            : '';
    };

    const [email, setEmail] = useState('');
    const [orders, setOrders] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [settings, setSettings] = useState({ company_name: 'Secure Portal' });
    const navigate = useNavigate();

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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Account email required');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const res = await axios.get(`${getBaseUrl()}/api/customer/orders/${email}`);
            setOrders(res.data.payments || []);
            setRefunds(res.data.refunds || []);
            setLoading(false);
        } catch (err) {
            setError('No records found for the provided identity.');
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
                return 'text-[#10b981]';
            case 'pending':
                return 'text-[#f59e0b]';
            case 'approved':
                return 'text-white';
            case 'rejected':
                return 'text-red-600';
            default:
                return 'text-zinc-500';
        }
    };

    if (selectedOrder) {
        const orderRefunds = getRefundsForOrder(selectedOrder.id);
        return (
            <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col font-sans relative">
            {/* Atmospheric Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981]/3 blur-[120px] rounded-full"></div>
            </div>

            <nav className="w-full max-w-[1400px] mx-auto px-8 py-10 flex justify-between items-center relative z-10 faded-line-b">
                <button onClick={() => setSelectedOrder(null)} className="modern-action-white opacity-40 hover:opacity-100 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> REVERT TO LIST
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#10b981] rounded-full"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{settings.company_name}</span>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                <div className="space-y-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-[1px] bg-[#10b981] rounded-full"></div>
                            <p className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.4em]">Transaction Manifest</p>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none text-white uppercase">
                            {selectedOrder.reference.slice(0, 8)}<span className="text-white/20">{selectedOrder.reference.slice(8)}</span>
                        </h1>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16 py-16 faded-line-y">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Settlement Value</span>
                            <p className="text-5xl font-black text-white leading-none tracking-tighter">${Number(selectedOrder.amount).toFixed(2)}</p>
                        </div>
                        <div className="space-y-4 md:faded-line-l md:pl-16">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Protocol Status</span>
                            <div className="inline-block">
                                <p className={`text-xl font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</p>
                            </div>
                        </div>
                        <div className="space-y-4 md:faded-line-l md:pl-16">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Timestamp</span>
                            <p className="text-2xl font-black text-white uppercase tracking-tighter">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                        {orderRefunds.length > 0 && (
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-[1px] bg-[#f59e0b] rounded-full"></div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b]">Adjustment History</h2>
                                </div>
                                <div className="space-y-1">
                                    {orderRefunds.map((refund) => (
                                        <div key={refund.id} className="py-10 faded-line-b flex flex-col md:flex-row justify-between gap-12 group">
                                            <div className="space-y-4 flex-1">
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Requested: {new Date(refund.createdAt).toLocaleDateString()}</p>
                                                <p className="text-3xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-[#f59e0b] transition-colors">{refund.reason}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`text-xl font-black uppercase tracking-widest ${getStatusColor(refund.status)}`}>{refund.status}</span>
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
                                    className="modern-action-orange text-xl hover:gap-8"
                                >
                                    Initiate Adjustment Appeal
                                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col font-sans">
            <nav className="w-full max-w-[1400px] mx-auto px-8 py-10 flex justify-between items-center relative z-10 faded-line-b">
                <Link to="/" className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-[#10b981] rounded-full"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{settings.company_name}</span>
                </Link>
                <Link to="/" className="modern-action-white opacity-40 hover:opacity-100 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> REVERT TO HUB
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                <div className="max-w-5xl space-y-24">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-[1px] bg-[#10b981] rounded-full"></div>
                            <p className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.5em]">ENTITY PORTAL</p>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white uppercase">
                            Order <br />
                            <span className="text-white/20">Tracking.</span>
                        </h1>
                        <p className="text-lg text-white/40 font-black uppercase tracking-tighter pt-4 max-w-xl">Search transaction ledger by registered digital signature.</p>
                    </div>

                    {!searched ? (
                        <div className="relative group max-w-2xl">
                            <form onSubmit={handleSearch} className="relative py-6 flex flex-col md:flex-row gap-8 items-center faded-line-b focus-within:border-[#10b981]/50 transition-colors">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ENTER REGISTERED EMAIL"
                                    className="flex-1 bg-transparent py-5 outline-none text-2xl md:text-3xl font-black transition-all placeholder:text-white/10 text-white uppercase tracking-tighter"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="modern-action-green text-lg whitespace-nowrap"
                                >
                                    Execute Query
                                    <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end py-10 faded-line-b gap-8">
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Query Results For</p>
                                    <p className="text-3xl font-black text-white uppercase tracking-tighter">{email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSearched(false);
                                        setEmail('');
                                        setOrders([]);
                                        setRefunds([]);
                                    }}
                                    className="modern-action-white opacity-40 hover:opacity-100"
                                >
                                    Reset Query
                                </button>
                            </div>

                            {loading && (
                                <div className="py-24 flex flex-col items-center space-y-8">
                                    <div className="w-16 h-16 border-2 border-white/10 border-t-[#10b981] rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Syncing Ledger</p>
                                </div>
                            )}

                            {error && (
                                <div className="py-12 space-y-4">
                                    <p className="font-black uppercase tracking-[0.3em] text-[10px] text-red-500/60">Query Fault</p>
                                    <p className="text-3xl font-black tracking-tighter uppercase text-red-500">{error}</p>
                                </div>
                            )}

                            {!loading && orders.length === 0 && !error && (
                                <div className="py-24 text-center space-y-4">
                                    <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[10px]">Zero Records Retained</p>
                                </div>
                            )}

                            {!loading && orders.length > 0 && (
                                <div className="space-y-1">
                                    {orders.map((order) => {
                                        return (
                                            <div
                                                key={order.id}
                                                onClick={() => setSelectedOrder(order)}
                                                className="group py-12 faded-line-b flex flex-col md:flex-row justify-between items-center hover:bg-white/[0.01] transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-10 mb-8 md:mb-0">
                                                    <div className="text-4xl font-black text-white/10 group-hover:text-[#10b981] leading-none tracking-tighter transition-colors w-20">
                                                        {new Date(order.createdAt).getDate().toString().padStart(2, '0')}
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 transition-colors">Reference</p>
                                                        <p className="font-black text-white uppercase tracking-tighter text-2xl transition-all group-hover:translate-x-2">{order.reference}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-16 w-full md:w-auto justify-between md:justify-end">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] transition-colors mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-3xl font-black text-white tracking-tighter">${Number(order.amount).toFixed(2)}</p>
                                                    </div>
                                                    <div className="transition-all group-hover:translate-x-2 text-white/20 group-hover:text-[#10b981]">
                                                        <ArrowRight size={24} />
                                                    </div>
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

            <footer className="w-full max-w-[1400px] mx-auto px-8 py-16 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/[0.03] mt-auto relative z-10">
                <div className="flex items-center gap-6">
                    <ShieldCheck size={18} className="text-[#10b981]" />
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">SECURE LEDGER ACCESS PROTOCOL // {new Date().getFullYear()}</p>
                </div>
                <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                    <Link to="/terms-of-service" className="hover:text-[#10b981] transition-colors">Protocol Terms</Link>
                    <Link to="/privacy-policy" className="hover:text-[#10b981] transition-colors">Data Privacy</Link>
                </div>
            </footer>
        </div>
    );
};

export default CustomerDashboard;
