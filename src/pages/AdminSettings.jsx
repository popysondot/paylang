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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const inputClasses = "w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 outline-none focus:border-emerald-500 transition-all font-medium";
    const labelClasses = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2";
    const sectionClasses = "bg-slate-900/20 border border-slate-800/50 p-8 rounded-[2.5rem] space-y-6";

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs">
                    <CheckCircle size={20} /> {message}
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Company Settings */}
                <div className={sectionClasses}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500">
                            <Settings size={20} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Identity</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Company Name</label>
                                <input
                                    type="text"
                                    value={settings.company_name || ''}
                                    onChange={(e) => handleChange('company_name', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Service Name</label>
                                <input
                                    type="text"
                                    value={settings.service_name || ''}
                                    onChange={(e) => handleChange('service_name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="e.g. Professional Consulting"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Service Description</label>
                            <textarea
                                value={settings.service_description || ''}
                                onChange={(e) => handleChange('service_description', e.target.value)}
                                className={`${inputClasses} h-32 resize-none`}
                                placeholder="Short description of what you offer..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Support Email</label>
                                <input
                                    type="email"
                                    value={settings.support_email || ''}
                                    onChange={(e) => handleChange('support_email', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Support Phone</label>
                                <input
                                    type="tel"
                                    value={settings.support_phone || ''}
                                    onChange={(e) => handleChange('support_phone', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Admin Alerts</label>
                                <input
                                    type="email"
                                    value={settings.notification_email || ''}
                                    onChange={(e) => handleChange('notification_email', e.target.value)}
                                    className={inputClasses}
                                />
                                <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">Sales & Refund notifications</p>
                            </div>
                            <div>
                                <label className={labelClasses}>System Timezone</label>
                                <select
                                    value={settings.timezone || 'UTC'}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option className="bg-[#0f172a]">UTC</option>
                                    <option className="bg-[#0f172a]">EST</option>
                                    <option className="bg-[#0f172a]">CST</option>
                                    <option className="bg-[#0f172a]">MST</option>
                                    <option className="bg-[#0f172a]">PST</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Policies & Content */}
                <div className="space-y-8">
                    <div className={sectionClasses}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-500">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Refund Parameters</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Policy Window (Days)</label>
                                <input
                                    type="number"
                                    value={settings.refund_policy_days || '14'}
                                    onChange={(e) => handleChange('refund_policy_days', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Max Percentage (%)</label>
                                <input
                                    type="number"
                                    value={settings.max_refund_percentage || '100'}
                                    onChange={(e) => handleChange('max_refund_percentage', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={sectionClasses}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-purple-500">
                                <Save size={20} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Security Update</h3>
                        </div>

                        {passwordMessage && (
                            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle size={14} /> {passwordMessage}
                            </div>
                        )}
                        {passwordError && (
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={14} /> {passwordError}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className={labelClasses}>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>New Secret</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Confirm Secret</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-white text-[#0f172a] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all mt-2"
                            >
                                Authenticate & Update
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Landing Content JSONs */}
            <div className={sectionClasses}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-blue-500">
                        <Settings size={20} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Dynamic Landing Content</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <label className={labelClasses}>Services Config (JSON)</label>
                        <textarea
                            value={settings.landing_services || '[]'}
                            onChange={(e) => handleChange('landing_services', e.target.value)}
                            className={`${inputClasses} h-64 font-mono text-xs`}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Testimonials Config (JSON)</label>
                        <textarea
                            value={settings.landing_testimonials || '[]'}
                            onChange={(e) => handleChange('landing_testimonials', e.target.value)}
                            className={`${inputClasses} h-64 font-mono text-xs`}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-12">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group bg-emerald-500 text-[#0f172a] px-12 py-6 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-white transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/10"
                >
                    {saving ? 'Synchronizing...' : 'Commit Changes'}
                    <Save size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
