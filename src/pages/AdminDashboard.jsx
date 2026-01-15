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
    ShoppingBag, 
    RefreshCw, 
    Search,
    Download,
    Filter,
    AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
    console.log('AdminDashboard Render initiated');
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [chartPeriod, setChartPeriod] = useState('days');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    useEffect(() => {
        const fetchData = async () => {
            const rawUrl = import.meta.env.VITE_BACKEND_URL;
            if (!rawUrl) {
                console.error('VITE_BACKEND_URL is not defined');
                setError('Backend URL is missing. Please set VITE_BACKEND_URL in your environment variables.');
                setLoading(false);
                return;
            }
            const baseUrl = rawUrl.replace(/\/$/, '');
            console.log('Dashboard connecting to:', baseUrl);
            try {
                setError(null);
                setLoading(true);
                
                // Fetch separately to pinpoint failures
                let analyticsData = null;
                let transactionsData = [];
                let refundsData = [];

                try {
                    const res = await axios.get(`${baseUrl}/api/admin/analytics?period=${chartPeriod}`);
                    analyticsData = res.data;
                } catch (e) {
                    console.error('Analytics API failed:', e);
                }

                try {
                    const res = await axios.get(`${baseUrl}/api/admin/transactions`);
                    transactionsData = res.data;
                } catch (e) {
                    console.error('Transactions API failed:', e);
                }

                try {
                    const res = await axios.get(`${baseUrl}/api/admin/refunds`);
                    refundsData = res.data;
                } catch (e) {
                    console.error('Refunds API failed:', e);
                }

                if (!analyticsData && (!transactionsData || transactionsData.length === 0)) {
                    throw new Error('Could not connect to the backend API. Please check if the server is running on ' + baseUrl);
                }

                setAnalytics(analyticsData);
                setTransactions(transactionsData);
                setRefunds(refundsData);
            } catch (error) {
                console.error('Dashboard Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [chartPeriod]);

    const filteredTransactions = Array.isArray(transactions) ? transactions.filter(t => 
        t.email.toLowerCase().includes(filter.toLowerCase()) || 
        t.reference.toLowerCase().includes(filter.toLowerCase()) ||
        t.name.toLowerCase().includes(filter.toLowerCase())
    ) : [];

    // Derive unique customers from transactions
    const customers = Array.from(new Set(transactions.map(t => t.email))).map(email => {
        const userTransactions = transactions.filter(t => t.email === email);
        const totalSpent = userTransactions.reduce((sum, t) => sum + t.amount, 0);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Loading Analytics Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 p-6 rounded-full mb-6 text-red-500">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Dashboard Error</h2>
                <p className="text-slate-500 mb-8 max-w-md">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-xl">
                        <LayoutDashboard size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tight">TutorFlow <span className="text-emerald-500">Admin</span></span>
                </div>
                <nav className="flex-grow px-4 space-y-2">
                    <button 
                        onClick={() => setActiveView('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'dashboard' ? 'bg-emerald-600' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveView('transactions')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'transactions' ? 'bg-emerald-600' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                        <ShoppingBag size={20} /> Transactions
                    </button>
                    <button 
                        onClick={() => setActiveView('customers')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'customers' ? 'bg-emerald-600' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                        <Users size={20} /> Customers
                    </button>
                    <button 
                        onClick={() => setActiveView('refunds')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'refunds' ? 'bg-emerald-600' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                        <RefreshCw size={20} /> Refunds
                    </button>
                </nav>
                <div className="p-6 border-t border-white/5">
                    <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-2">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            <span className="text-sm font-bold text-emerald-500">Live & Secure</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-y-auto max-h-screen">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{activeView} Overview</h1>
                        <p className="text-slate-500 font-medium">Monitoring real-time academic transactions</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-white p-3 rounded-xl border border-slate-200 text-slate-600 hover:border-emerald-500 transition-all">
                            <Download size={20} />
                        </button>
                        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all">
                            <Filter size={20} /> Generate Report
                        </button>
                    </div>
                </header>

                {activeView === 'dashboard' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:border-emerald-500 transition-all">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <DollarSign size={80} className="text-emerald-600" />
                                </div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Revenue</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-black text-slate-900">${analytics?.summary?.totalRevenue?.toFixed(2) || '0.00'}</h2>
                                    <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                                        <ArrowUpRight size={14} /> +12%
                                    </span>
                                </div>
                            </div>
                            <div 
                                onClick={() => setActiveView('transactions')}
                                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:border-blue-500 transition-all cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ShoppingBag size={80} className="text-blue-600" />
                                </div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Sales</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-black text-slate-900">{analytics?.summary?.totalTransactions || 0}</h2>
                                    <span className="text-blue-500 text-sm font-bold flex items-center gap-1">
                                        <ArrowUpRight size={14} /> +5%
                                    </span>
                                </div>
                            </div>
                            <div 
                                onClick={() => setActiveView('refunds')}
                                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:border-amber-500 transition-all cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <RefreshCw size={80} className="text-amber-600" />
                                </div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Refund Appeals</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-black text-slate-900">{analytics?.summary?.totalRefundRequests || 0}</h2>
                                    <span className="text-amber-500 text-sm font-bold flex items-center gap-1">
                                        <ArrowDownRight size={14} /> -2%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            <div 
                                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-emerald-500 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <div className="w-2 h-6 bg-emerald-600 rounded-full"></div>
                                        Revenue Trends
                                    </h3>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        {['days', 'weeks', 'months', 'years'].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setChartPeriod(p)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                                                    chartPeriod === p ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div 
                                    onClick={() => setActiveView('transactions')}
                                    className="h-[300px] w-full cursor-pointer"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics?.dailyData || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="label" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}}
                                            />
                                            <Tooltip 
                                                cursor={{fill: '#f8fafc'}}
                                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                                            />
                                            <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div 
                                onClick={() => setActiveView('transactions')}
                                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 cursor-pointer hover:border-blue-500 transition-all"
                            >
                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                                    Transaction Distribution
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics?.statusData || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {(analytics?.statusData || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                                            />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={36}
                                                iconType="circle"
                                                formatter={(value) => <span className="text-slate-600 font-bold text-sm px-2">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {(activeView === 'dashboard' || activeView === 'transactions') && (
                    /* Transactions Table */
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-2xl font-black text-slate-900">
                                {activeView === 'dashboard' ? 'Recent Transactions' : 'All Transactions'}
                            </h3>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, email or reference..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                                        <th className="py-6 px-8">Customer</th>
                                        <th className="py-6 px-8">Reference</th>
                                        <th className="py-6 px-8">Date</th>
                                        <th className="py-6 px-8">Amount</th>
                                        <th className="py-6 px-8">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(activeView === 'dashboard' ? filteredTransactions.slice(0, 5) : filteredTransactions).map((t) => (
                                        <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-6 px-8">
                                                <div>
                                                    <p className="font-black text-slate-800">{t.name}</p>
                                                    <p className="text-sm text-slate-500">{t.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 font-mono text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                                                {t.reference}
                                            </td>
                                            <td className="py-6 px-8 text-sm font-bold text-slate-500">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className="font-black text-slate-900">${t.amount}</span>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter">
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredTransactions.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-slate-300" />
                                </div>
                                <h4 className="text-xl font-black text-slate-800">No transactions found</h4>
                                <p className="text-slate-500">Try adjusting your search filters.</p>
                            </div>
                        )}
                        {activeView === 'dashboard' && filteredTransactions.length > 5 && (
                            <div className="p-6 text-center border-t border-slate-50">
                                <button 
                                    onClick={() => setActiveView('transactions')}
                                    className="text-emerald-600 font-bold text-sm hover:underline"
                                >
                                    View All Transactions
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'customers' && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-2xl font-black text-slate-900">Customer Directory</h3>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name or email..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                                        <th className="py-6 px-8">Customer</th>
                                        <th className="py-6 px-8">Transactions</th>
                                        <th className="py-6 px-8">Total Spent</th>
                                        <th className="py-6 px-8">Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredCustomers.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-6 px-8">
                                                <div>
                                                    <p className="font-black text-slate-800">{c.name}</p>
                                                    <p className="text-sm text-slate-500">{c.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-sm font-bold text-slate-500">
                                                {c.transactionCount} payments
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className="font-black text-slate-900">${c.totalSpent.toFixed(2)}</span>
                                            </td>
                                            <td className="py-6 px-8 text-sm font-bold text-slate-500">
                                                {new Date(c.lastTransaction).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeView === 'refunds' && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-2xl font-black text-slate-900">Refund Requests</h3>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search refunds..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                                        <th className="py-6 px-8">Customer</th>
                                        <th className="py-6 px-8">Reference</th>
                                        <th className="py-6 px-8">Reason</th>
                                        <th className="py-6 px-8">Status</th>
                                        <th className="py-6 px-8">Requested On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredRefunds.map((r) => (
                                        <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-6 px-8 text-sm font-bold text-slate-800">
                                                {r.email}
                                            </td>
                                            <td className="py-6 px-8 font-mono text-xs font-bold text-slate-400">
                                                {r.paymentId?.reference || 'N/A'}
                                            </td>
                                            <td className="py-6 px-8 text-sm text-slate-500 max-w-xs truncate">
                                                {r.reason}
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                                                    r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-sm font-bold text-slate-500">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredRefunds.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RefreshCw size={32} className="text-slate-300" />
                                </div>
                                <h4 className="text-xl font-black text-slate-800">No refund requests</h4>
                                <p className="text-slate-500">There are no refund claims at this time.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
