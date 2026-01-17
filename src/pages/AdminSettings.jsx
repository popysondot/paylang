import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

const AdminSettings = ({ token, onClose }) => {
    const [settings, setSettings] = useState({
        company_name: 'Service Platform',
        support_email: '',
        support_phone: '',
        notification_email: '',
        report_email: '',
        refund_policy_days: '14',
        max_refund_percentage: '100',
        timezone: 'UTC',
        service_name: 'Professional Services',
        service_description: 'High-quality professional support from industry experts.',
        landing_services: '[]',
        landing_testimonials: '[]'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
            const res = await axios.get(`${baseUrl}/api/admin/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(prev => ({ ...prev, ...res.data }));
            setLoading(false);
        } catch (err) {
            setError('Failed to load settings');
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
            
            for (const [key, value] of Object.entries(settings)) {
                await axios.post(
                    `${baseUrl}/api/admin/settings`,
                    { key, value },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
            await axios.post(
                `${baseUrl}/api/admin/change-password`,
                { 
                    currentPassword: passwordData.currentPassword, 
                    newPassword: passwordData.newPassword 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPasswordMessage('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordMessage(''), 3000);
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Failed to update password');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-100 p-3 rounded-xl">
                    <Settings className="text-emerald-600" size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Admin Settings</h2>
            </div>

            {message && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold">
                    <CheckCircle size={20} /> {message}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Settings */}
                <div className="bg-slate-50 p-6 rounded-2xl">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Company Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                            <input
                                type="text"
                                value={settings.company_name || ''}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Service Name</label>
                            <input
                                type="text"
                                value={settings.service_name || ''}
                                onChange={(e) => handleChange('service_name', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="e.g. Professional Consulting"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Service Description</label>
                            <textarea
                                value={settings.service_description || ''}
                                onChange={(e) => handleChange('service_description', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                                placeholder="Short description of what you offer..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Support Email</label>
                            <input
                                type="email"
                                value={settings.support_email || ''}
                                onChange={(e) => handleChange('support_email', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Support Phone</label>
                            <input
                                type="tel"
                                value={settings.support_phone || ''}
                                onChange={(e) => handleChange('support_phone', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Admin Notification Email</label>
                            <input
                                type="email"
                                value={settings.notification_email || ''}
                                onChange={(e) => handleChange('notification_email', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Email address to receive sale and refund alerts</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Weekly Analytics Report Email</label>
                            <input
                                type="email"
                                value={settings.report_email || ''}
                                onChange={(e) => handleChange('report_email', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Email address to receive weekly revenue and invoice summaries</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Timezone</label>
                            <select
                                value={settings.timezone || 'UTC'}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option>UTC</option>
                                <option>EST</option>
                                <option>CST</option>
                                <option>MST</option>
                                <option>PST</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Refund Policy Settings */}
                <div className="bg-slate-50 p-6 rounded-2xl">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Refund Policy</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Refund Window (Days)</label>
                            <input
                                type="number"
                                value={settings.refund_policy_days || '14'}
                                onChange={(e) => handleChange('refund_policy_days', e.target.value)}
                                min="1"
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Number of days customers can request refunds</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Max Refund Percentage (%)</label>
                            <input
                                type="number"
                                value={settings.max_refund_percentage || '100'}
                                onChange={(e) => handleChange('max_refund_percentage', e.target.value)}
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Maximum percentage of order value that can be refunded</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Landing Page Content Section */}
            <div className="mt-12 border-t border-slate-100 pt-12">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Settings className="text-purple-600" size={24} /> Landing Page Content
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-2xl">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Services JSON</label>
                        <textarea
                            value={settings.landing_services || '[]'}
                            onChange={(e) => handleChange('landing_services', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-48 font-mono text-sm"
                            placeholder='[{"title": "Service Name", "desc": "Description"}]'
                        />
                        <p className="text-xs text-slate-500 mt-2">JSON array of objects with "title" and "desc" properties.</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Testimonials JSON</label>
                        <textarea
                            value={settings.landing_testimonials || '[]'}
                            onChange={(e) => handleChange('landing_testimonials', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-48 font-mono text-sm"
                            placeholder='[{"name": "User Name", "uni": "Title/Role", "quote": "Quote text"}]'
                        />
                        <p className="text-xs text-slate-500 mt-2">JSON array of objects with "name", "uni", and "quote" properties.</p>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="mt-12 border-t border-slate-100 pt-12">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Save className="text-blue-600" size={24} /> Security & Access
                </h3>
                
                <div className="max-w-xl bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-6">Change Administrative Password</h4>
                    
                    {passwordMessage && (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                            <CheckCircle size={18} /> {passwordMessage}
                        </div>
                    )}
                    {passwordError && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                            <AlertCircle size={18} /> {passwordError}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all mt-4"
                        >
                            Update Credentials
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-12 flex gap-4 justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
