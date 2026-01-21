import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

const AdminSettings = ({ token, onClose }) => {
    const getBaseUrl = () => {
        return window.location.hostname === 'localhost' 
            ? (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
            : '';
    };

    const [settings, setSettings] = useState({
        company_name: 'Payment Hub',
        support_email: '',
        support_phone: '',
        notification_email: '',
        report_email: '',
        refund_policy_days: '14',
        max_refund_percentage: '100',
        timezone: 'UTC',
        service_name: 'Professional Services'
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
            const res = await axios.get(`${getBaseUrl()}/api/admin/settings`, {
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
            for (const [key, value] of Object.entries(settings)) {
                await axios.post(
                    `${getBaseUrl()}/api/admin/settings`,
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
            await axios.post(
                `${getBaseUrl()}/api/admin/change-password`,
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
                <div className="animate-spin h-12 w-12 border-2 border-white/25 border-t-[#10b981]"></div>
            </div>
        );
    }

    const inputClasses = "w-full bg-white/[0.03] border-none rounded-full px-8 py-4 text-white placeholder:text-white/5 outline-none focus:bg-white/[0.05] transition-all font-black uppercase tracking-[0.2em] text-[11px]";
    const labelClasses = "block text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 group-focus-within:text-white transition-all";

    return (
        <div className="space-y-24 animate-in fade-in duration-1000 font-sans pb-40">
            {message && (
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] p-8 rounded-full flex items-center gap-6 font-black uppercase tracking-[0.2em] text-[11px] animate-in slide-in-from-top-4 duration-700">
                    <CheckCircle size={24} /> {message}
                </div>
            )}

            {error && (
                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] p-8 rounded-full flex items-center gap-6 font-black uppercase tracking-[0.2em] text-[11px] animate-in slide-in-from-top-4 duration-700">
                    <AlertCircle size={24} /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-32">
                {/* Company Settings */}
                <div className="space-y-16 relative">
                    <div className="absolute left-[-48px] top-0 w-1 h-32 bg-gradient-to-b from-[#10b981] to-transparent rounded-full"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center text-[#10b981]">
                            <Settings size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Global Identity</h3>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">CORE_BRANDING_CONFIGURATION</p>
                        </div>
                    </div>
                    
                    <div className="space-y-12 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="group">
                                <label className={labelClasses}>Entity Name</label>
                                <input
                                    type="text"
                                    value={settings.company_name || ''}
                                    onChange={(e) => handleChange('company_name', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="group">
                                <label className={labelClasses}>Service Name</label>
                                <input
                                    type="text"
                                    value={settings.service_name || ''}
                                    onChange={(e) => handleChange('service_name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="CORE_SETTLEMENT"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="group">
                                <label className={labelClasses}>Support Email</label>
                                <input
                                    type="email"
                                    value={settings.support_email || ''}
                                    onChange={(e) => handleChange('support_email', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="group">
                                <label className={labelClasses}>Support Phone</label>
                                <input
                                    type="tel"
                                    value={settings.support_phone || ''}
                                    onChange={(e) => handleChange('support_phone', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="group">
                                <label className={labelClasses}>Admin Alerts</label>
                                <input
                                    type="email"
                                    value={settings.notification_email || ''}
                                    onChange={(e) => handleChange('notification_email', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="group">
                                <label className={labelClasses}>Timezone</label>
                                <select
                                    value={settings.timezone || 'UTC'}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                    className={`${inputClasses} cursor-pointer appearance-none`}
                                >
                                    <option className="bg-black">UTC</option>
                                    <option className="bg-black">EST</option>
                                    <option className="bg-black">CST</option>
                                    <option className="bg-black">MST</option>
                                    <option className="bg-black">PST</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Policies & Content */}
                <div className="space-y-24">
                    <div className="space-y-16 relative">
                        <div className="absolute left-[-48px] top-0 w-1 h-32 bg-gradient-to-b from-[#f59e0b] to-transparent rounded-full"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center text-[#f59e0b]">
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Adjustments</h3>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">POLICY_VECTOR_CONSTRAINTS</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            <div className="group">
                                <label className={labelClasses}>Window (Days)</label>
                                <input
                                    type="number"
                                    value={settings.refund_policy_days || '14'}
                                    onChange={(e) => handleChange('refund_policy_days', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="group">
                                <label className={labelClasses}>Max Ratio (%)</label>
                                <input
                                    type="number"
                                    value={settings.max_refund_percentage || '100'}
                                    onChange={(e) => handleChange('max_refund_percentage', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-16 relative">
                        <div className="absolute left-[-48px] top-0 w-1 h-32 bg-gradient-to-b from-[#a855f7] to-transparent rounded-full"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center text-[#a855f7]">
                                <Save size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Access Key</h3>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">SECURITY_TOKEN_ROTATION</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-12 relative z-10">
                            <div className="group">
                                <label className={labelClasses}>Current Key</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="group">
                                    <label className={labelClasses}>New Key</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className={labelClasses}>Verify</label>
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
                                className="w-full bg-white text-black py-6 rounded-full font-black uppercase tracking-[0.4em] text-[11px] hover:bg-white/90 transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                            >
                                Update Credentials
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-24 border-t border-white/[0.03]">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group bg-[#10b981] text-black px-12 py-6 rounded-full font-black uppercase tracking-[0.4em] text-[11px] flex items-center gap-6 hover:bg-white transition-all duration-700 disabled:opacity-50 shadow-[0_30px_60px_rgba(16,185,129,0.1)]"
                >
                    {saving ? 'Synchronizing...' : 'Commit Changes'}
                    <Save size={20} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
