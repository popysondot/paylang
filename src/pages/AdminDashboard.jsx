import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import AdminSettings from './AdminSettings';
import { useToast } from '../components/Toast';

// Sub-components
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminHeader from '../components/admin/AdminHeader';
import StatsGrid from '../components/admin/StatsGrid';
import DashboardChart from '../components/admin/DashboardChart';
import TransactionsTable from '../components/admin/TransactionsTable';
import CustomersTable from '../components/admin/CustomersTable';
import RefundsTable from '../components/admin/RefundsTable';
import AuditLogsTable from '../components/admin/AuditLogsTable';
import StaffTable from '../components/admin/StaffTable';

const AdminDashboard = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();

    const getBaseUrl = () => {
        if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:5000'
            : 'https://paylang-tusk.onrender.com';
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

    const filterData = (data, fields) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => 
            fields.some(field => 
                String(item[field] || '').toLowerCase().includes(filter.toLowerCase())
            )
        );
    };

    const filteredTransactions = filterData(transactions, ['email', 'reference', 'name']);
    
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

    const filteredCustomers = filterData(customers, ['name', 'email']);
    const filteredRefunds = filterData(refunds, ['email', 'reason', 'reference']);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-[#10b981]/30 font-sans overflow-hidden relative">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10b981]/5 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f59e0b]/5 blur-[120px]"></div>
                <div className="w-full max-w-md space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#10b981] to-transparent"></div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black tracking-tighter uppercase text-white">ADMIN_GATEWAY</h1>
                            <p className="text-[#10b981] font-black uppercase tracking-[0.6em] text-[10px]">Secure Authentication Protocol</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-16">
                        <div className="space-y-12">
                            <div className="group relative">
                                <label className="text-[10px] font-black text-white uppercase tracking-[0.4em] block mb-4 transition-colors group-focus-within:text-[#10b981]">Identity UID</label>
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="ENTER_UID"
                                    className="w-full bg-transparent border-b border-white/20 py-6 outline-none text-2xl font-black transition-all placeholder:text-white/5 focus:border-[#10b981] tracking-tighter"
                                    required
                                />
                            </div>
                            <div className="group relative">
                                <label className="text-[10px] font-black text-white uppercase tracking-[0.4em] block mb-4 transition-colors group-focus-within:text-[#10b981]">Access Key</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-b border-white/20 py-6 outline-none text-2xl font-black transition-all placeholder:text-white/5 focus:border-[#10b981] tracking-widest"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-[#f59e0b] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-pulse bg-[#f59e0b]/5 p-4 border border-[#f59e0b]/20 justify-center">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="pt-8">
                            <button 
                                type="submit"
                                disabled={loginLoading}
                                className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-6 hover:bg-[#10b981] transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.3)] group disabled:opacity-50"
                            >
                                <span>{loginLoading ? 'AUTHENTICATING...' : 'AUTHORIZE_SESSION'}</span>
                                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10b981]/10 blur-[100px] animate-pulse"></div>
                <div className="w-12 h-12 border-2 border-[#10b981] animate-spin mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em] animate-pulse">SYNCHRONIZING_CORE</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#10b981]/30 font-sans overflow-x-hidden relative flex flex-col">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#10b981]/5 blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#f59e0b]/3 blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#10b981]/2 blur-[150px] pointer-events-none"></div>

            <AdminNavbar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                handleLogout={handleLogout} 
                brandingSettings={brandingSettings}
            />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 relative z-10">
                <AdminHeader 
                    activeView={activeView} 
                    filter={filter} 
                    setFilter={setFilter} 
                />

                <div className="py-12 pb-32">
                    {activeView === 'dashboard' && (
                        <div className="space-y-24 animate-in fade-in duration-1000">
                            <StatsGrid analytics={analytics} />
                            <DashboardChart 
                                data={analytics?.chartData} 
                                period={chartPeriod} 
                                onPeriodChange={setChartPeriod} 
                            />
                        </div>
                    )}

                    {activeView === 'transactions' && (
                        <TransactionsTable transactions={filteredTransactions} />
                    )}

                    {activeView === 'customers' && (
                        <CustomersTable customers={filteredCustomers} />
                    )}

                    {activeView === 'refunds' && (
                        <RefundsTable 
                            refunds={filteredRefunds} 
                            onApprove={handleApproveRefund} 
                            onReject={handleRejectRefund} 
                            processingId={processingRefund}
                        />
                    )}

                    {activeView === 'audit' && (
                        <AuditLogsTable logs={auditLogs} />
                    )}

                    {activeView === 'staff' && (
                        <StaffTable 
                            users={users} 
                            onToggleStatus={handleToggleAdmin} 
                            onAddUser={() => setShowAddUserModal(true)} 
                        />
                    )}

                    {activeView === 'settings' && (
                        <AdminSettings 
                            token={localStorage.getItem('adminToken')} 
                            onClose={() => setActiveView('dashboard')} 
                        />
                    )}
                </div>
            </main>

            {showAddUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-700">
                    <div className="w-full max-w-lg bg-black border border-white/10 p-16 space-y-16 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#10b981] to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#10b981] to-transparent"></div>
                        
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Provision Access</h3>
                            <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.6em]">PROVISION_ACCESS_IDENTITY</p>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleCreateAdmin(Object.fromEntries(formData));
                        }} className="space-y-16">
                            <div className="space-y-12">
                                <div className="group">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2 group-focus-within:text-[#10b981] transition-colors">Admin UID</label>
                                    <input 
                                        name="username"
                                        type="text"
                                        required
                                        className="w-full bg-transparent border-b border-white/10 py-6 outline-none text-2xl font-black transition-all placeholder:text-white/5 uppercase focus:border-[#10b981] tracking-tight text-white"
                                        placeholder="ENTITY_UID"
                                    />
                                </div>
                                <div className="group">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2 group-focus-within:text-[#10b981] transition-colors">Access Key</label>
                                    <input 
                                        name="password"
                                        type="password" 
                                        required
                                        className="w-full bg-transparent border-b border-white/10 py-6 outline-none text-2xl font-black transition-all placeholder:text-white/5 focus:border-[#10b981] text-white tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-6">
                                <button 
                                    type="submit"
                                    className="w-full py-6 bg-[#10b981] text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all duration-700 shadow-[0_20px_40px_rgba(16,185,129,0.1)] flex items-center justify-center gap-4"
                                >
                                    <span>Authorize Access</span>
                                    <ArrowRight size={14} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all duration-500"
                                >
                                    Cancel_Operation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
