import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, DollarSign, Clock, AlertCircle, CheckCircle, Eye, ArrowLeft, ArrowRight, ShieldCheck, Search, Download, Mail, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const CustomerDashboard = () => {
    const getBaseUrl = () => {
        const envUrl = import.meta.env.VITE_BACKEND_URL;
        if (envUrl && !envUrl.includes('localhost')) return envUrl.replace(/\/$/, '');
        
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:5000'
            : ''; // Relative to current domain in production
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

    const downloadReceipt = (order) => {
        if (!order || !order.reference) return;
        const doc = new jsPDF();
        
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text(settings.company_name.toUpperCase(), 20, 25);
        
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(10);
        doc.text('SETTLEMENT VERIFICATION', 140, 25);
        
        doc.setTextColor(82, 82, 91);
        doc.setFontSize(10);
        doc.text('ENTITY IDENTIFIER:', 20, 60);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(order.name || 'N/A', 20, 70);
        doc.text(order.email, 20, 77);
        
        doc.setTextColor(82, 82, 91);
        doc.setFontSize(10);
        doc.text('PROTOCOL REF:', 120, 60);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Timestamp: ${new Date(order.createdAt).toLocaleDateString()}`, 120, 70);
        doc.text(`Reference: ${order.reference}`, 120, 77);
        
        doc.setFillColor(244, 244, 245);
        doc.rect(20, 100, 170, 10, 'F');
        doc.setTextColor(113, 113, 122);
        doc.text('SERVICE DEFINITION', 25, 106.5);
        doc.text('VALUE', 160, 106.5);
        
        doc.setTextColor(0, 0, 0);
        doc.text(settings.service_name || 'System Protocol', 25, 120);
        doc.text(`$${Number(order.amount).toFixed(2)}`, 160, 120);
        
        doc.setDrawColor(228, 228, 231);
        doc.line(20, 140, 190, 140);
        doc.setFontSize(14);
        doc.text('FINAL SETTLEMENT', 25, 155);
        doc.setTextColor(16, 185, 129);
        doc.text(`$${Number(order.amount).toFixed(2)} USD`, 160, 155);
        
        doc.setTextColor(161, 161, 170);
        doc.setFontSize(8);
        doc.text('Authenticated Transaction Record.', 105, 280, { align: 'center' });
        
        doc.save(`Receipt_${order.reference}.pdf`);
    };

    if (selectedOrder) {
        const orderRefunds = getRefundsForOrder(selectedOrder.id);
        return (
            <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col font-sans relative">
                {/* Background Atmosphere */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f59e0b]/3 blur-[120px]"></div>
                </div>

                <nav className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-row justify-between items-center relative z-10 faded-line-b gap-4">
                    <button 
                        onClick={() => setSelectedOrder(null)} 
                        className="flex items-center gap-3 text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                        REVERT TO LIST
                    </button>
                    <div className="flex items-center gap-6 md:gap-10">
                        {selectedOrder.status === 'success' && (
                            <button 
                                onClick={() => downloadReceipt(selectedOrder)}
                                className="flex items-center gap-3 text-[#10b981] text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] hover:text-white transition-all"
                            >
                                <Download size={14} /> DOWNLOAD
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-[#10b981]"></div>
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] hidden sm:block">{settings.company_name}</span>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 md:gap-20">
                        <div className="lg:col-span-8 space-y-12 md:space-y-20 animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className="space-y-6 md:space-y-8">
                                <div className="flex items-center gap-4 text-[#10b981]">
                                    <div className="h-[1px] w-8 md:w-12 bg-current opacity-50"></div>
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em]">TRANSACTION MANIFEST</span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl font-black tracking-tighter leading-none text-orange-500 uppercase break-all">
                                    {selectedOrder.reference}
                                </h1>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-12 md:gap-16 pt-12 md:pt-16 border-t border-white/5">
                                <div className="space-y-4">
                                    <label className="text-[9px] md:text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Settlement Value</label>
                                    <p className="text-5xl md:text-8xl font-black text-green-500 tracking-tighter leading-none">${Number(selectedOrder.amount).toFixed(2)}</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] md:text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Protocol Timestamp</label>
                                    <p className="text-2xl md:text-4xl font-black text-green-500 uppercase tracking-tighter leading-none">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {orderRefunds.length > 0 && (
                                <div className="space-y-8 md:space-y-12 pt-16 md:pt-20 border-t border-white/5">
                                    <div className="flex items-center gap-4 text-[#f59e0b]">
                                        <div className="h-[1px] w-8 bg-current opacity-50"></div>
                                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em]">ADJUSTMENT LEDGER</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {orderRefunds.map((refund) => (
                                            <div key={refund.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between gap-8 group hover:bg-white/[0.04] transition-all">
                                                <div className="space-y-4">
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">REFUND_TOKEN: {refund.id.slice(0, 8)}</span>
                                                    <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter group-hover:text-[#f59e0b] transition-colors">{refund.reason}</h3>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className={`px-6 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        refund.status === 'success' ? 'border-[#10b981] text-[#10b981]' : 
                                                        refund.status === 'pending' ? 'border-[#f59e0b] text-[#f59e0b]' : 'border-zinc-800 text-zinc-500'
                                                    }`}>
                                                        {refund.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {orderRefunds.length === 0 && selectedOrder.status === 'success' && (
                                <div className="pt-16 md:pt-20 border-t border-white/5">
                                    <button 
                                        onClick={() => navigate('/refund')}
                                        className="group w-full md:w-auto flex items-center justify-between md:justify-start gap-8 bg-white text-black px-10 py-6 rounded-full text-lg md:text-2xl font-black uppercase tracking-tighter hover:bg-[#f59e0b] hover:text-white transition-all"
                                    >
                                        Initiate Appeal
                                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-4 lg:border-l lg:border-white/5 lg:pl-12 space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                            <div className="p-8 md:p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Current Status</label>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${selectedOrder.status === 'success' ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`}></div>
                                        <p className={`text-3xl font-black uppercase tracking-tighter ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-white/5">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Entity Identification</p>
                                        <p className="text-xl font-black text-white uppercase truncate">{selectedOrder.name || 'Anonymous'}</p>
                                        <p className="text-xs font-black text-[#10b981] truncate">{selectedOrder.email}</p>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="flex items-start gap-4 text-zinc-600">
                                            <ShieldCheck size={18} className="mt-1 shrink-0 text-[#10b981]" />
                                            <p className="text-[9px] leading-relaxed font-black uppercase tracking-wider">
                                                Verification integrity is guaranteed by cryptographic signatures on the {settings.company_name} ledger.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16 mt-auto relative z-10 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <ShieldCheck size={20} className="text-[#10b981]" />
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.4em]">SECURE ACCESS PROTOCOL</p>
                                <p className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest">© {new Date().getFullYear()} {settings.company_name} // SETTLEMENT_SYSTEM</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 md:gap-12 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                            <Link to="/terms-of-service" className="hover:text-white transition-colors">PROTOCOL TERMS</Link>
                            <Link to="/privacy-policy" className="hover:text-white transition-colors">PRIVACY SHIELD</Link>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 overflow-x-hidden flex flex-col font-sans relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f59e0b]/3 blur-[120px]"></div>
            </div>

            <nav className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-row justify-between items-center relative z-10 faded-line-b gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#10b981]"></div>
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">{settings.company_name}</span>
                </div>
                <Link to="/" className="modern-action-white hover:opacity-100 text-[9px] md:text-[11px]">
                    REVERT TO HUB
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
                    {/* Hero Section */}
                    <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="space-y-4 md:space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-8 md:w-10 h-[1px] bg-[#10b981]"></div>
                                <p className="text-[#10b981] text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em]">ENTITY PORTAL</p>
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none uppercase break-words">
                                Order <br />
                                <span className="text-white/50">Tracking</span>
                            </h1>
                        </div>
                        <p className="text-base md:text-xl text-[#f59e0b] font-black max-w-xl md:max-w-sm leading-tight border-l-2 border-[#f59e0b] pl-4 md:pl-8 uppercase tracking-tighter">
                            Authorized gateway to access the <span className="text-white">secure transaction ledger</span> for verified digital signatures.
                        </p>
                    </div>

                    {/* Interaction Section */}
                    <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                        {!searched ? (
                            <div className="relative group">
                                <form onSubmit={handleSearch} className="space-y-8 md:space-y-12">
                                    <div className="group relative">
                                        <label className="text-[9px] font-black text-white uppercase tracking-[0.4em] block mb-2 group-focus-within:text-[#10b981] transition-all">Registered Account</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="company@domain.com"
                                                className="w-full bg-transparent border border-white/10 rounded-full px-8 py-4 md:py-6 outline-none text-base font-black transition-all placeholder:text-white/40 uppercase text-white focus:border-[#10b981]/50"
                                                required
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20">
                                                <Search size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-4 bg-white text-black text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] py-5 md:py-7 rounded-full hover:bg-[#10b981] hover:text-white transition-all group"
                                    >
                                        Execute Query
                                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-8 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-[#10b981] uppercase tracking-[0.4em]">Active Identity</span>
                                            <p className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter truncate max-w-xs">{email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSearched(false);
                                                setEmail('');
                                                setOrders([]);
                                                setRefunds([]);
                                            }}
                                            className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors border-b border-zinc-800 hover:border-red-500 pb-1"
                                        >
                                            Reset Query
                                        </button>
                                    </div>
                                    
                                    {/* Decorative Line */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-[60px] rounded-full"></div>
                                </div>

                                {loading && (
                                    <div className="py-20 flex flex-col items-center space-y-8">
                                        <div className="w-16 h-16 border-2 border-white/10 border-t-[#10b981] animate-spin"></div>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.8em] animate-pulse">Synchronizing</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-8 bg-red-500/5 border border-red-500/10 space-y-4 rounded-2xl">
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500">Query Fault</span>
                                        <p className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white leading-none">{error}</p>
                                    </div>
                                )}

                                {!loading && orders.length === 0 && !error && (
                                    <div className="py-20 text-center space-y-4 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                                        <p className="text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px]">Zero Protocols Retained</p>
                                    </div>
                                )}

                                {!loading && orders.length > 0 && (
                                    <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                onClick={() => setSelectedOrder(order)}
                                                className="group p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-[#10b981]/30 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center gap-8"
                                            >
                                                <div className="flex items-center gap-8 w-full md:w-auto">
                                                    <div className="flex flex-col items-center justify-center bg-black border border-white/10 px-4 h-12 min-w-[100px] text-white group-hover:text-[#10b981] group-hover:border-[#10b981]/50 transition-all">
                                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </span>
                                                        <span className="text-sm font-black tracking-tighter mt-1">
                                                            {new Date(order.createdAt).getDate().toString().padStart(2, '0')}-{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} {new Date(order.createdAt).getFullYear()}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">REF_TOKEN</span>
                                                        <p className="text-base font-black text-white uppercase tracking-tighter group-hover:text-[#10b981] transition-colors">
                                                            {order.reference}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between w-full md:w-auto gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        <p className="text-2xl font-black text-white tracking-tighter">${Number(order.amount).toFixed(2)}</p>
                                                    </div>
                                                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full group-hover:bg-[#10b981] group-hover:text-white transition-all">
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16 mt-auto relative z-10 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <ShieldCheck size={20} className="text-[#10b981]" />
                        <div className="space-y-1">
                            <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.4em]">SECURE ACCESS PROTOCOL</p>
                            <p className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest">© {new Date().getFullYear()} {settings.company_name} // SETTLEMENT_SYSTEM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 md:gap-12 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                        <Link to="/terms-of-service" className="hover:text-white transition-colors">PROTOCOL TERMS</Link>
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">PRIVACY SHIELD</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CustomerDashboard;
