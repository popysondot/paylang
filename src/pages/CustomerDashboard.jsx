import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, DollarSign, Clock, AlertCircle, CheckCircle, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
    const [email, setEmail] = useState('');
    const [orders, setOrders] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const navigate = useNavigate();

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
                return 'bg-emerald-100 text-emerald-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'approved':
                return 'bg-blue-100 text-blue-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    if (selectedOrder) {
        const orderRefunds = getRefundsForOrder(selectedOrder.id);
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => setSelectedOrder(null)}
                        className="flex items-center gap-2 text-emerald-600 font-bold mb-6 hover:text-emerald-700"
                    >
                        <ArrowLeft size={20} /> Back to Orders
                    </button>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                        <h1 className="text-3xl font-black text-slate-900 mb-8">Order Details</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Reference</p>
                                <p className="text-xl font-black text-slate-900 break-all">{selectedOrder.reference}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Amount</p>
                                <p className="text-xl font-black text-slate-900">${Number(selectedOrder.amount).toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Status</p>
                                <span className={`px-4 py-2 rounded-lg font-bold text-sm inline-block ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Date</p>
                                <p className="text-xl font-black text-slate-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {orderRefunds.length > 0 && (
                            <div className="border-t border-slate-100 pt-8">
                                <h2 className="text-2xl font-black text-slate-900 mb-6">Refund Requests</h2>
                                <div className="space-y-4">
                                    {orderRefunds.map((refund) => (
                                        <div key={refund.id} className="bg-slate-50 p-6 rounded-2xl border-l-4 border-amber-500">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-bold text-slate-900">Request Date: {new Date(refund.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{refund.reason}</p>
                                                </div>
                                                <span className={`px-4 py-2 rounded-lg font-bold text-sm ${getStatusColor(refund.status)}`}>
                                                    {refund.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {orderRefunds.length === 0 && selectedOrder.status === 'success' && (
                            <div className="mt-8 bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                                <p className="text-emerald-700 font-bold">
                                    No refund requests yet. If you need to request a refund, please{' '}
                                    <button
                                        onClick={() => navigate('/refund')}
                                        className="underline font-black hover:text-emerald-800"
                                    >
                                        click here
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Order Tracking</h1>
                    <p className="text-slate-500 font-medium">Check the status of your payments and refunds</p>
                </div>

                {!searched ? (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-12">
                        <form onSubmit={handleSearch}>
                            <div className="max-w-md">
                                <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">
                                    Enter Your Email
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="flex-grow px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-medium"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all whitespace-nowrap"
                                    >
                                        View Orders
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => {
                                setSearched(false);
                                setEmail('');
                                setOrders([]);
                                setRefunds([]);
                            }}
                            className="flex items-center gap-2 text-emerald-600 font-bold mb-6 hover:text-emerald-700"
                        >
                            <ArrowLeft size={20} /> Search Again
                        </button>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl mb-8 flex items-center gap-3 font-bold">
                                <AlertCircle size={24} /> {error}
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-center items-center h-96">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                            </div>
                        )}

                        {!loading && orders.length === 0 && !error && (
                            <div className="bg-slate-50 p-12 rounded-[2rem] text-center">
                                <Package size={48} className="text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">No orders found for this email</p>
                            </div>
                        )}

                        {!loading && orders.length > 0 && (
                            <div className="grid grid-cols-1 gap-6">
                                {orders.map((order) => {
                                    const orderRefunds = getRefundsForOrder(order.id);
                                    return (
                                        <div
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-emerald-500 transition-all cursor-pointer group"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-all">
                                                            <Package className="text-emerald-600" size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-500 font-bold uppercase">Reference</p>
                                                            <p className="font-mono font-bold text-slate-800 break-all">{order.reference}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                                                        <div>
                                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Amount</p>
                                                            <p className="text-lg font-black text-slate-900">${Number(order.amount).toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Status</p>
                                                            <span className={`px-3 py-1 rounded-lg font-bold text-xs inline-block ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Date</p>
                                                            <p className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        {orderRefunds.length > 0 && (
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Refunds</p>
                                                                <p className="font-bold text-amber-600">{orderRefunds.length} request(s)</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">
                                                    <Eye size={20} /> View
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
