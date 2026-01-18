import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { 
    LayoutDashboard, 
    Users, 
    DollarSign, 
    ArrowUpRight, 
    ArrowDownRight,
    ArrowRight,
    ShoppingBag, 
    RefreshCw, 
    Search,
    History,
    Download,
    Filter,
    AlertCircle,
    Settings,
    CheckCircle,
    XCircle,
    LogOut,
    ShieldCheck,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('days');
    const [loading, setLoading] = useState(isAuthenticated);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [processingRefund, setProcessingRefund] = useState(null);
    const [brandingSettings, setBrandingSettings] = useState({ company_name: 'Payment Hub' });

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
                const res = await axios.get(`${baseUrl}/api/settings`);
                if (res.data.company_name) setBrandingSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                // Keep default
            }
        };
        fetchBranding();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setError(null);
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
            const res = await axios.post(`${baseUrl}/api/admin/login`, { username, password });
            localStorage.setItem('adminToken', res.data.token);
            setIsAuthenticated(true);
            setUsername('');
            setPassword('');
            setLoading(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setAnalytics(null);
    };

    const handleApproveRefund = async (refundId) => {
        const token = localStorage.getItem('adminToken');
        setProcessingRefund(refundId);
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
            await axios.post(
                `${baseUrl}/api/admin/refunds/${refundId}/approve`,
                { refundAmount: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRefunds(refunds.map(r => r.id === refundId ? { ...r, status: 'approved' } : r));
            setProcessingRefund(null);
        } catch (err) {
            console.error('Approval error:', err);
            setProcessingRefund(null);
        }
    };

    const handleRejectRefund = async (refundId) => {
        const token = localStorage.getItem('adminToken');
        setProcessingRefund(refundId);
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
            await axios.post(
                `${baseUrl}/api/admin/refunds/${refundId}/reject`,
                { reason: 'After review, this refund cannot be processed.' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRefunds(refunds.map(r => r.id === refundId ? { ...r, status: 'rejected' } : r));
            setProcessingRefund(null);
        } catch (err) {
            console.error('Rejection error:', err);
            setProcessingRefund(null);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            const rawUrl = import.meta.env.VITE_BACKEND_URL;
            if (!rawUrl) {
                setError('Backend URL is missing.');
                setLoading(false);
                return;
            }
            const baseUrl = rawUrl.replace(/\/$/, '');
            const token = localStorage.getItem('adminToken');
            const headers = { Authorization: `Bearer ${token}` };

            try {
                setError(null);
                setLoading(true);
                
                const [analyticsRes, transactionsRes, refundsRes, auditRes] = await Promise.allSettled([
                    axios.get(`${baseUrl}/api/admin/analytics?period=${chartPeriod}`, { headers }),
                    axios.get(`${baseUrl}/api/admin/transactions`, { headers }),
                    axios.get(`${baseUrl}/api/admin/refunds`, { headers }),
                    axios.get(`${baseUrl}/api/admin/audit-logs`, { headers })
                ]);

                if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
                if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data);
                if (refundsRes.status === 'fulfilled') setRefunds(refundsRes.value.data);
                if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data);

                if (analyticsRes.status === 'rejected' && analyticsRes.reason.response?.status === 401) {
                    handleLogout();
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [chartPeriod, isAuthenticated]);

    const filteredTransactions = Array.isArray(transactions) ? transactions.filter(t => 
        t.email.toLowerCase().includes(filter.toLowerCase()) || 
        t.reference.toLowerCase().includes(filter.toLowerCase()) ||
        t.name.toLowerCase().includes(filter.toLowerCase())
    ) : [];

    const customers = Array.from(new Set(transactions.map(t => t.email))).map(email => {
        const userTransactions = transactions.filter(t => t.email === email);
        const totalSpent = userTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        return {
            name: userTransactions[0].name,
            email,
            transactionCount: userTransactions.length,
            totalSpent,
            lastTransaction: userTransactions[0].createdAt
        };
    });

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(filter.toLowerCase()) || 
        c.email.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredRefunds = refunds.filter(r => 
        r.email.toLowerCase().includes(filter.toLowerCase()) || 
        r.reason.toLowerCase().includes(filter.toLowerCase()) ||
        (r.paymentId && r.paymentId.reference.toLowerCase().includes(filter.toLowerCase()))
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30">
                <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="text-[#0f172a]" size={32} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-white">System Access</h1>
                        <p className="text-slate-500 font-medium tracking-wide">Enter administrative credentials to proceed.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-10">
                        <div className="space-y-8">
                            <div className="group relative">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-emerald-400">Identity</label>
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="w-full bg-transparent border-b-2 border-slate-800 focus:border-emerald-500 py-3 outline-none text-2xl font-black transition-all placeholder:text-slate-800"
                                    required
                                />
                            </div>
                            <div className="group relative">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-emerald-400">Passcode</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-b-2 border-slate-800 focus:border-emerald-500 py-3 outline-none text-2xl font-black transition-all placeholder:text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loginLoading}
                            className="group w-full flex items-center justify-between bg-emerald-500 text-[#0f172a] px-8 py-6 rounded-full font-black uppercase tracking-widest text-sm hover:bg-white transition-all duration-500 disabled:opacity-50"
                        >
                            <span>{loginLoading ? 'Authenticating...' : 'Authorize Session'}</span>
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-2 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Loading Analytics</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col lg:flex-row selection:bg-emerald-500/30">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 bg-slate-900 border-r border-slate-800/50 flex flex-col shrink-0">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-[#0f172a]" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white leading-none">{brandingSettings.company_name}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Console</p>
                    </div>
                </div>

                <nav className="flex-grow px-4 pb-8 space-y-1">
                    {[
                        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                        { id: 'transactions', label: 'Payments', icon: ShoppingBag },
                        { id: 'customers', label: 'Clients', icon: Users },
                        { id: 'refunds', label: 'Refunds', icon: RefreshCw },
                        { id: 'audit', label: 'Logs', icon: History },
                        { id: 'settings', label: 'Config', icon: Settings },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === item.id ? 'bg-emerald-500 text-[#0f172a]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon size={18} /> {item.label}
                        </button>
                    ))}
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all mt-8"
                    >
                        <LogOut size={18} /> Terminate
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-800/50">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Network Live</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tight break-all">ID: {localStorage.getItem('adminToken')?.slice(0, 16)}...</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow overflow-y-auto">
                <header className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 sticky top-0 bg-[#0f172a]/80 backdrop-blur-xl z-20">
                    <div className="space-y-1">
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Administrator</p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                            {activeView === 'dashboard' ? 'Real-time Metrics' : 
                             activeView === 'transactions' ? 'Payment Ledger' :
                             activeView === 'customers' ? 'Client Directory' :
                             activeView === 'refunds' ? 'Refund Manager' :
                             activeView === 'audit' ? 'System Logs' : 'Global Settings'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:w-64">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input 
                                type="text"
                                placeholder="SEARCH INDEX..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 px-12 py-3 rounded-full text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                            />
                        </div>
                        {activeView === 'dashboard' && (
                            <select 
                                value={chartPeriod}
                                onChange={(e) => setChartPeriod(e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full outline-none focus:border-emerald-500 transition-all"
                            >
                                <option value="days">7 Days</option>
                                <option value="weeks">4 Weeks</option>
                                <option value="months">6 Months</option>
                            </select>
                        )}
                    </div>
                </header>

                <div className="px-8 pb-12">
                    {activeView === 'dashboard' && (
                        <div className="space-y-12 animate-in fade-in duration-700">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {[
                                    { label: 'Gross Revenue', value: `$${analytics?.totalRevenue?.toLocaleString()}`, icon: DollarSign, trend: '+12.5%' },
                                    { label: 'Settlements', value: analytics?.transactionCount, icon: ShoppingBag, trend: '+8.2%' },
                                    { label: 'Active Clients', value: analytics?.uniqueCustomers, icon: Users, trend: '+4.1%' },
                                    { label: 'Refund Ratio', value: `${analytics?.refundRate}%`, icon: RefreshCw, trend: '-2.4%' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] space-y-4 hover:border-emerald-500/50 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500">
                                                <stat.icon size={24} />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.trend}</span>
                                        </div>
                                        <div>
                                            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Area */}
                            <div className="bg-slate-900/30 border border-slate-800 p-8 md:p-12 rounded-[3rem] space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Revenue Trajectory</h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics?.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="#64748b" 
                                                fontSize={10} 
                                                fontWeight={900} 
                                                tick={{ fill: '#94a3b8' }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis 
                                                stroke="#64748b" 
                                                fontSize={10} 
                                                fontWeight={900} 
                                                tick={{ fill: '#94a3b8' }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => `$${value}`}
                                            />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem' }}
                                                itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '12px' }}
                                                labelStyle={{ color: '#64748b', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                            />
                                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'transactions' && (
                        <div className="space-y-4 animate-in fade-in duration-700">
                            <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 border-b border-slate-800">
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Value</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {filteredTransactions.map((t, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-6 text-[10px] font-black text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-black text-white leading-none">{t.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{t.email}</p>
                                                </td>
                                                <td className="px-8 py-6 text-lg font-black text-emerald-500">${Number(t.amount).toFixed(2)}</td>
                                                <td className="px-8 py-6 text-[10px] font-mono font-bold text-slate-400 uppercase">{t.reference}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${t.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{t.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeView === 'customers' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
                            {filteredCustomers.map((c, i) => (
                                <div key={i} className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] space-y-6 hover:border-emerald-500/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-emerald-500 font-black text-lg">
                                            {c.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white leading-none">{c.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{c.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total LTV</p>
                                            <p className="text-xl font-black text-white">${c.totalSpent.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                                            <p className="text-xl font-black text-white">{c.transactionCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span>Last Activity</span>
                                        <span>{new Date(c.lastTransaction).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeView === 'refunds' && (
                        <div className="space-y-6 animate-in fade-in duration-700">
                            {filteredRefunds.map((r, i) => (
                                <div key={i} className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
                                    <div className="space-y-4 flex-grow">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${r.status === 'pending' ? 'bg-amber-500 animate-pulse' : r.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{r.status} REQUEST</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(r.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xl font-black text-white">{r.email}</p>
                                            <p className="text-sm font-medium text-slate-400 italic">"{r.reason}"</p>
                                        </div>
                                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Parent Ref: {r.paymentId?.reference || 'Unknown'}</p>
                                    </div>
                                    {r.status === 'pending' && (
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => handleRejectRefund(r.id)}
                                                disabled={processingRefund === r.id}
                                                className="bg-red-500/10 text-red-500 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                Decline
                                            </button>
                                            <button 
                                                onClick={() => handleApproveRefund(r.id)}
                                                disabled={processingRefund === r.id}
                                                className="bg-emerald-500 text-[#0f172a] px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                                            >
                                                Authorize
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {filteredRefunds.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No action items pending</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'audit' && (
                        <div className="space-y-2 animate-in fade-in duration-700">
                            {auditLogs.map((log, i) => (
                                <div key={i} className="flex items-center gap-6 px-8 py-6 border-b border-slate-800 hover:bg-white/5 transition-colors group">
                                    <span className="text-[10px] font-black text-slate-500 w-40 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                                    <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-emerald-500 transition-colors"></div>
                                    <div className="flex-grow">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{log.action}</p>
                                        <p className="text-xs font-bold text-slate-400">{log.details}</p>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User: {log.adminId?.username || 'System'}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeView === 'settings' && (
                        <div className="animate-in fade-in duration-700 max-w-4xl">
                            <AdminSettings token={localStorage.getItem('adminToken')} />
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
};

export default AdminDashboard;
