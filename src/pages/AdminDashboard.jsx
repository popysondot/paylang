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
    UserPlus,
    Lock,
    Search as SearchIcon
} from 'lucide-react';
import AdminSettings from './AdminSettings';
import { useToast } from '../components/Toast';

const DiffViewer = ({ data }) => {
    if (!data) return null;
    try {
        const diff = typeof data === 'string' ? JSON.parse(data) : data;
        if (!diff || typeof diff !== 'object') return <span className="text-slate-500 italic">No details</span>;
        
        return (
            <div className="mt-2 space-y-1">
                {Object.entries(diff).map(([key, val]) => (
                    <div key={key} className="text-[9px] flex items-center gap-2">
                        <span className="font-black text-slate-500 uppercase">{key}:</span>
                        <span className="text-red-400 line-through opacity-50">{String(val.from)}</span>
                        <ArrowRight size={8} className="text-slate-700" />
                        <span className="text-sky-400 font-bold">{String(val.to)}</span>
                    </div>
                ))}
            </div>
        );
    } catch (e) {
        return <span className="text-slate-400">{String(data)}</span>;
    }
};

const AdminDashboard = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();

    const getBaseUrl = () => {
        if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:5000'
            : '';
    };

    const [activeView, setActiveView] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('days');
    const [loading, setLoading] = useState(isAuthenticated);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [processingRefund, setProcessingRefund] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const brandingSettingsDefault = { company_name: 'Payment Hub' };
    const [brandingSettings, setBrandingSettings] = useState(brandingSettingsDefault);

    const getViewColor = (view) => {
        switch(view) {
            case 'dashboard': return '#ffffff'; 
            case 'transactions': return '#10b981'; 
            case 'customers': return '#ffffff'; 
            case 'refunds': return '#f59e0b'; 
            case 'staff': return '#10b981'; 
            case 'audit': return '#ffffff'; 
            case 'settings': return '#f59e0b'; 
            default: return '#ffffff';
        }
    };

    const currentThemeColor = getViewColor(activeView);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await axios.get(`${getBaseUrl()}/api/settings`);
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
            const res = await axios.post(`${getBaseUrl()}/api/admin/login`, { username, password });
            localStorage.setItem('adminToken', res.data.token);
            setIsAuthenticated(true);
            addToast('Access Granted', 'success');
            setUsername('');
            setPassword('');
            setLoading(true);
        } catch (err) {
            addToast(err.response?.data?.error || 'Authorization Failed', 'error');
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
            await axios.post(
                `${getBaseUrl()}/api/admin/refunds/${refundId}/approve`,
                { refundAmount: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRefunds(refunds.map(r => r.id === refundId ? { ...r, status: 'approved' } : r));
            addToast('Refund Authorized Successfully', 'success');
        } catch (err) {
            addToast('Failed to authorize refund', 'error');
        } finally {
            setProcessingRefund(null);
        }
    };

    const handleRejectRefund = async (refundId) => {
        const token = localStorage.getItem('adminToken');
        setProcessingRefund(refundId);
        try {
            await axios.post(
                `${getBaseUrl()}/api/admin/refunds/${refundId}/reject`,
                { reason: 'After review, this refund cannot be processed.' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRefunds(refunds.map(r => r.id === refundId ? { ...r, status: 'rejected' } : r));
            addToast('Refund Request Declined', 'info');
        } catch (err) {
            addToast('Failed to reject refund', 'error');
        } finally {
            setProcessingRefund(null);
        }
    };

    const handleToggleAdmin = async (userId) => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await axios.post(
                `${getBaseUrl()}/api/admin/users/${userId}/toggle`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
            addToast(res.data.message, 'success');
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to toggle status', 'error');
        }
    };

    const handleCreateAdmin = async (userData) => {
        const token = localStorage.getItem('adminToken');
        try {
            await axios.post(
                `${getBaseUrl()}/api/admin/users`,
                userData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            addToast('New admin created successfully', 'success');
            setShowAddUserModal(false);
            // Refresh users
            const res = await axios.get(`${getBaseUrl()}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to create admin', 'error');
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            const token = localStorage.getItem('adminToken');
            const headers = { Authorization: `Bearer ${token}` };

            try {
                setError(null);
                setLoading(true);
                
                const [analyticsRes, transactionsRes, refundsRes, auditRes, usersRes] = await Promise.allSettled([
                    axios.get(`${getBaseUrl()}/api/admin/analytics?period=${chartPeriod}`, { headers }),
                    axios.get(`${getBaseUrl()}/api/admin/transactions`, { headers }),
                    axios.get(`${getBaseUrl()}/api/admin/refunds`, { headers }),
                    axios.get(`${getBaseUrl()}/api/admin/audit-logs`, { headers }),
                    axios.get(`${getBaseUrl()}/api/admin/users`, { headers })
                ]);

                if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
                if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data);
                if (refundsRes.status === 'fulfilled') setRefunds(refundsRes.value.data);
                if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data);
                if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);

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
        (r.reference && r.reference.toLowerCase().includes(filter.toLowerCase()))
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-[#10b981]/30 font-sans overflow-hidden relative">
                <div className="w-full max-w-md space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#10b981] to-transparent"></div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black tracking-tighter uppercase text-white">ADMIN</h1>
                            <p className="text-[#10b981] font-black uppercase tracking-[0.6em] text-[10px]">Secure Authentication Protocol</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-16">
                        <div className="space-y-12">
                            <div className="group relative">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-4 transition-colors group-focus-within:text-[#10b981]">Identity UID</label>
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="ENTER_UID"
                                    className="w-full bg-transparent border-b border-white/10 py-6 outline-none text-2xl font-black transition-all placeholder:text-white/5 uppercase focus:border-[#10b981] tracking-tighter"
                                    required
                                />
                            </div>
                            <div className="group relative">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-4 transition-colors group-focus-within:text-[#10b981]">Access Key</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-b border-white/10 py-6 outline-none text-2xl font-black transition-all placeholder:text-white/5 focus:border-[#10b981] tracking-widest"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-[#f59e0b] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-pulse">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="pt-8">
                            <button 
                                type="submit"
                                disabled={loginLoading}
                                className="modern-action-green group"
                            >
                                <span>{loginLoading ? 'AUTHENTICATING...' : 'AUTHORIZE_SESSION'}</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10b981]/10 blur-[100px] rounded-full animate-pulse"></div>
                <div className="w-12 h-12 border-2 border-white/5 border-t-[#10b981] rounded-full animate-spin mb-8"></div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em] animate-pulse">SYNCHRONIZING_CORE</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row selection:bg-white/30 font-sans overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 opacity-[0.03]" style={{ backgroundColor: currentThemeColor }}></div>
            <div className="absolute bottom-0 left-[20%] w-[30%] h-[30%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 opacity-[0.02]" style={{ backgroundColor: currentThemeColor }}></div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 bg-black flex flex-col shrink-0 relative z-50 border-r border-white/[0.03]">
                <div className="p-12 flex items-center gap-5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700" style={{ backgroundColor: currentThemeColor, boxShadow: `0 0 30px ${currentThemeColor}22` }}>
                        <ShieldCheck className="text-black" size={18} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black tracking-tighter uppercase leading-none">{brandingSettings.company_name}</h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] mt-1 text-[#10b981]">CORE_PROTOCOL</p>
                    </div>
                </div>

                <nav className="flex-grow px-8 py-4 space-y-2">
                    {[
                        { id: 'dashboard', label: 'INSIGHT', icon: LayoutDashboard },
                        { id: 'transactions', label: 'VAULT', icon: History },
                        { id: 'customers', label: 'NODES', icon: Users },
                        { id: 'refunds', label: 'FLOW', icon: RefreshCw },
                        { id: 'audit', label: 'SEQUENCE', icon: History },
                        { id: 'staff', label: 'ACCESS', icon: ShieldCheck },
                        { id: 'settings', label: 'CONFIG', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center justify-between px-6 py-5 transition-all duration-500 group relative ${
                                activeView === item.id 
                                ? 'text-white' 
                                : 'text-white/20 hover:text-white/60'
                            }`}
                        >
                            <div className="flex items-center gap-5">
                                <item.icon size={18} className={activeView === item.id ? '' : 'text-white/10 group-hover:text-white/40 transition-colors'} style={{ color: activeView === item.id ? getViewColor(item.id) : undefined }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{item.label}</span>
                            </div>
                            {activeView === item.id && (
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: getViewColor(item.id), boxShadow: `0 0 10px ${getViewColor(item.id)}` }}></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-8 mt-auto border-t border-white/[0.03]">
                    <button 
                        onClick={handleLogout}
                        className="modern-action text-red-500/40 hover:text-red-500 px-6 py-4 w-full"
                    >
                        <LogOut size={14} />
                        <span>TERMINATE</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow overflow-y-auto bg-black relative scrollbar-hide">
                <header className="px-12 py-10 flex flex-col md:flex-row md:items-center justify-between gap-8 sticky top-0 bg-black z-50 border-b border-white/[0.03]">
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.6em] mb-2 text-[#10b981]">CURRENT_VECTOR</p>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                                {activeView === 'dashboard' ? 'Insight' : 
                                 activeView === 'transactions' ? 'Vault' : 
                                 activeView === 'customers' ? 'Identity' :
                                 activeView === 'refunds' ? 'Flow' :
                                 activeView === 'audit' ? 'Sequence' : 
                                 activeView === 'staff' ? 'Access' : 'System'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="relative flex-grow md:w-80 group">
                            <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 transition-colors" style={{ color: filter ? '#10b981' : undefined }} size={14} />
                            <input 
                                type="text"
                                placeholder="EXECUTE_QUERY..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-transparent border-none px-8 py-5 text-[11px] text-white placeholder:text-white/10 outline-none transition-all font-black uppercase tracking-[0.2em]"
                            />
                        </div>
                    </div>
                </header>

                <div className="px-12 py-8 pb-32 relative z-10">
                    {activeView === 'dashboard' && (
                        <div className="space-y-20 animate-in fade-in duration-1000">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 border-y border-white/[0.03]">
                                {[
                                    { label: 'GROSS_OUTPUT', value: `$${analytics?.totalRevenue?.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: '#10b981' },
                                    { label: 'SETTLEMENTS', value: analytics?.transactionCount, icon: ShoppingBag, trend: '+8.2%', color: 'white' },
                                    { label: 'ACTIVE_NODES', value: analytics?.uniqueCustomers, icon: Users, trend: '+4.1%', color: 'white' },
                                    { label: 'FLOW_ADJUST', value: `${analytics?.refundRate}%`, icon: RefreshCw, trend: '-2.4%', color: '#f59e0b' },
                                ].map((stat, i) => (
                                    <div key={i} className={`p-12 space-y-8 group relative ${i !== 3 ? 'border-r border-white/[0.03]' : ''}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="text-white/20 transition-all duration-700">
                                                <stat.icon size={16} />
                                            </div>
                                            <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${stat.trend.startsWith('+') ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                                                {stat.trend}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-4xl font-black text-white tracking-tighter leading-none mb-3">{stat.value}</p>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Area */}
                            <div className="py-24 space-y-16">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-white">REVENUE_MANIFEST</h3>
                                        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">TEMPORAL_OUTPUT_SEQUENCE</p>
                                    </div>
                                    <select 
                                        value={chartPeriod}
                                        onChange={(e) => setChartPeriod(e.target.value)}
                                        className="bg-transparent border-none text-[9px] font-black px-4 py-2 outline-none transition-all uppercase tracking-[0.4em] text-white/40 cursor-pointer hover:text-white"
                                    >
                                        <option value="days" className="bg-black">07_DAYS</option>
                                        <option value="weeks" className="bg-black">04_WEEKS</option>
                                        <option value="months" className="bg-black">06_MONTHS</option>
                                    </select>
                                </div>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics?.chartData}>
                                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#ffffff" strokeOpacity={0.02} />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="#ffffff" 
                                                fontSize={8} 
                                                fontWeight={900} 
                                                tick={{ fill: '#ffffff', opacity: 0.1 }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={20}
                                            />
                                            <YAxis 
                                                stroke="#ffffff" 
                                                fontSize={8} 
                                                fontWeight={900} 
                                                tick={{ fill: '#ffffff', opacity: 0.1 }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => `$${value}`}
                                            />
                                            <Tooltip 
                                                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                                                contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '0' }}
                                                itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                                labelStyle={{ color: '#ffffff20', fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.4em' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="revenue" 
                                                stroke="#10b981" 
                                                strokeWidth={2} 
                                                dot={false} 
                                                activeDot={{ r: 4, fill: '#10b981', stroke: '#000000', strokeWidth: 2 }} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'transactions' && (
                        <div className="animate-in fade-in duration-1000">
                            <div className="grid grid-cols-5 px-0 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-white/20 border-b border-white/[0.03]">
                                <div>TEMPORAL_SIG</div>
                                <div>ENTITY_ID</div>
                                <div>VALUATION</div>
                                <div>TOKEN_XREF</div>
                                <div className="text-right">STATUS</div>
                            </div>
                            <div className="divide-y divide-white/[0.03]">
                                {filteredTransactions.map((t, i) => (
                                    <div key={i} className="grid grid-cols-5 items-center px-0 py-12 transition-all duration-500 group">
                                        <div className="text-[10px] font-black text-white/20 tracking-widest uppercase">{new Date(t.createdAt).toLocaleDateString()}</div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tighter leading-none mb-2 group-hover:text-[#10b981] transition-colors">{t.name}</p>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{t.email}</p>
                                        </div>
                                        <div className="text-2xl font-black text-white tracking-tighter">${Number(t.amount).toLocaleString()}</div>
                                        <div className="text-[10px] font-mono font-black text-white/10 uppercase tracking-widest">{t.reference}</div>
                                        <div className="text-right">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${t.status === 'success' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>{t.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'customers' && (
                        <div className="animate-in fade-in duration-1000">
                            <div className="grid grid-cols-4 px-0 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-white/20 border-b border-white/[0.03]">
                                <div>IDENTITY</div>
                                <div>FREQUENCY</div>
                                <div>VALUATION</div>
                                <div className="text-right">LAST_SIG</div>
                            </div>
                            <div className="divide-y divide-white/[0.03]">
                                {filteredCustomers.map((c, i) => (
                                    <div key={i} className="grid grid-cols-4 items-center px-0 py-12 transition-all duration-500 group">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tighter leading-none mb-2 group-hover:text-[#10b981] transition-colors">{c.name}</p>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{c.email}</p>
                                        </div>
                                        <div className="text-[10px] font-black text-white uppercase tracking-widest">{c.transactionCount} UNITS</div>
                                        <div className="text-2xl font-black text-white tracking-tighter">${c.totalSpent.toLocaleString()}</div>
                                        <div className="text-right text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(c.lastTransaction).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'refunds' && (
                        <div className="animate-in fade-in duration-1000">
                            <div className="grid grid-cols-5 px-0 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-white/20 border-b border-white/[0.03]">
                                <div>ENTITY</div>
                                <div>VALUATION</div>
                                <div>REASON_CODE</div>
                                <div>STATUS</div>
                                <div className="text-right">ACTION</div>
                            </div>
                            <div className="divide-y divide-white/[0.03]">
                                {filteredRefunds.map((r, i) => (
                                    <div key={i} className="grid grid-cols-5 items-center px-0 py-12 transition-all duration-500 group">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tighter leading-none mb-2 group-hover:text-[#f59e0b] transition-colors">{r.email}</p>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{r.reference || 'REF_NULL'}</p>
                                        </div>
                                        <div className="text-2xl font-black text-white tracking-tighter">${Number(r.amount).toLocaleString()}</div>
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest truncate pr-8">{r.reason}</div>
                                        <div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${
                                                r.status === 'approved' ? 'text-[#10b981]' : 
                                                r.status === 'rejected' ? 'text-red-500' : 
                                                'text-[#f59e0b]'
                                            }`}>{r.status}</span>
                                        </div>
                                        <div className="flex justify-end gap-8">
                                            {r.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApproveRefund(r.id)}
                                                        disabled={processingRefund === r.id}
                                                        className="modern-action-green"
                                                    >
                                                        APPROVE
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectRefund(r.id)}
                                                        disabled={processingRefund === r.id}
                                                        className="modern-action text-red-500/40 hover:text-red-500"
                                                    >
                                                        REJECT
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'audit' && (
                        <div className="animate-in fade-in duration-1000">
                            <div className="divide-y divide-white/[0.03]">
                                {auditLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-16 py-12 transition-all duration-700 group">
                                        <span className="text-[10px] font-black text-white/20 w-48 shrink-0 mt-2 tracking-widest uppercase">{new Date(log.created_at).toLocaleString()}</span>
                                        <div className="flex-grow">
                                            <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-6 text-[#10b981]">{log.action}</p>
                                            <DiffViewer data={log.newData || log.details} />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-white/5 uppercase tracking-[0.6em] block mb-2">OPERATOR</span>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-white/40">{log.username || 'SYSTEM'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'staff' && (
                        <div className="animate-in fade-in duration-1000">
                            <div className="flex justify-between items-center mb-16">
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.8em] text-white">PROVISIONED_ENTITIES</h3>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-4">SYSTEM_LEVEL ACCESS_CONTROL_LIST</p>
                                </div>
                                <button 
                                    onClick={() => setShowAddUserModal(true)}
                                    className="modern-action-green"
                                >
                                    <UserPlus size={14} />
                                    <span>NEW_ENTITY</span>
                                </button>
                            </div>

                            <div className="divide-y divide-white/[0.03] border-t border-white/[0.03]">
                                {users.map((user) => (
                                    <div key={user.id} className={`grid grid-cols-4 items-center py-12 transition-all duration-1000 ${!user.is_active ? 'opacity-20 grayscale' : 'group'}`}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                                            <div>
                                                <p className="text-xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-[#10b981] transition-colors">{user.username}</p>
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mt-2">{user.email || 'NO_VECTOR_SIGNAL'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            ROLE: <span className="text-white ml-2">{user.role}</span>
                                        </div>

                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                                            STATUS: <span className={user.is_active ? 'text-[#10b981]' : 'text-[#f59e0b]'}>
                                                {user.is_active ? 'ACTIVE' : 'REVOKED'}
                                            </span>
                                        </div>

                                        <div className="flex justify-end">
                                            <button 
                                                onClick={() => handleToggleAdmin(user.id)}
                                                className={`modern-action ${user.is_active ? 'text-red-500/40 hover:text-red-500' : 'text-[#10b981] hover:text-white'}`}
                                            >
                                                {user.is_active ? 'REVOKE' : 'RESTORE'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeView === 'settings' && (
                        <div className="animate-in fade-in duration-1000 max-w-5xl">
                            <AdminSettings token={localStorage.getItem('adminToken')} />
                        </div>
                    )}
                </div>
            </main>

            {showAddUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black animate-in fade-in duration-700">
                    <div className="w-full max-w-lg space-y-16 animate-in slide-in-from-bottom-8 duration-1000 relative">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">New Entity</h3>
                                <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.6em]">ASSIGN_CREDENTIAL_SET</p>
                            </div>
                            <button onClick={() => setShowAddUserModal(false)} className="text-white/20 hover:text-white transition-all duration-500">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleCreateAdmin(Object.fromEntries(formData));
                        }} className="space-y-12 relative z-10">
                            <div className="space-y-10">
                                <div className="group relative">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] block mb-4 group-focus-within:text-white transition-all">IDENTITY_UID</label>
                                    <input name="username" type="text" className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-xl font-black uppercase tracking-tighter transition-all placeholder:text-white/5 focus:border-[#10b981]" placeholder="UID_NULL" required />
                                </div>
                                <div className="group relative">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] block mb-4 group-focus-within:text-white transition-all">OFFICIAL_VECTOR</label>
                                    <input name="email" type="email" className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-xl font-black uppercase tracking-tighter transition-all placeholder:text-white/5 focus:border-[#10b981]" placeholder="VECTOR_NULL" required />
                                </div>
                                <div className="group relative">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] block mb-4 group-focus-within:text-white transition-all">ACCESS_KEY</label>
                                    <input name="password" type="password" className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-xl font-black tracking-widest transition-all placeholder:text-white/5 focus:border-[#10b981]" placeholder="••••••••" required />
                                </div>
                            </div>

                            <button type="submit" className="modern-action-green w-full justify-between pt-8">
                                <span>AUTHORIZE_PROVISIONING</span>
                                <ArrowRight size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
