import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, AlertCircle, CheckCircle, ShieldCheck, Mail, Phone, Globe, Clock, Percent, ArrowRight } from 'lucide-react';

const AdminSettings = ({ token, onClose }) => {
    const getBaseUrl = () => {
        if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:5000'
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

            setMessage('Settings synchronized successfully');
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
            setPasswordError('Verification failed: Passwords mismatch');
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

            setPasswordMessage('Access credentials updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordMessage(''), 3000);
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Authorization update failed');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-8">
                <div className="w-12 h-12 border-2 border-[#10b981] animate-spin mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em] animate-pulse">RETRIEVING_CONFIG</p>
            </div>
        );
    }

    const inputClasses = "w-full bg-transparent border border-white/10 p-6 outline-none text-2xl font-black transition-all placeholder:text-white/5 uppercase text-white tracking-tight focus:border-[#10b981] rounded-3xl";
    const labelClasses = "block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 transition-all group-focus-within:text-[#10b981] ml-4";

    return (
        <div className="space-y-16 md:space-y-32 animate-in fade-in duration-1000 font-sans pb-40 relative px-2 md:px-0">
            {(message || error) && (
                <div className={`fixed top-24 md:top-32 right-4 md:right-12 z-[100] p-6 flex items-center gap-6 font-black uppercase tracking-[0.2em] text-[10px] animate-in slide-in-from-right-12 duration-700 shadow-2xl backdrop-blur-xl border ${
                    message ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]' : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                    {message ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message || error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 md:gap-32">
                {/* Global Configuration */}
                <div className="space-y-12 md:space-y-16 p-8 border border-white/10 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 md:pb-8">
                        <div className="flex items-center gap-6">
                            <div className="text-[#10b981]">
                                <Globe size={20} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Global Identity</h3>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">CORE_BRANDING_CONFIGURATION</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-10 md:space-y-12">
                        <div className="grid grid-cols-1 gap-y-12 md:gap-y-16">
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
                                <label className={labelClasses}>Service Identifier</label>
                                <input
                                    type="text"
                                    value={settings.service_name || ''}
                                    onChange={(e) => handleChange('service_name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="CORE_SETTLEMENT"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="group">
                                    <label className={labelClasses}>Support Channel</label>
                                    <input
                                        type="email"
                                        value={settings.support_email || ''}
                                        onChange={(e) => handleChange('support_email', e.target.value)}
                                        className={inputClasses}
                                        placeholder="SUPPORT@PROTOCOL"
                                    />
                                </div>
                                <div className="group">
                                    <label className={labelClasses}>Voice Uplink</label>
                                    <input
                                        type="tel"
                                        value={settings.support_phone || ''}
                                        onChange={(e) => handleChange('support_phone', e.target.value)}
                                        className={inputClasses}
                                        placeholder="+1_ADMIN_LINE"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="group">
                                    <label className={labelClasses}>Alert Distribution</label>
                                    <input
                                        type="email"
                                        value={settings.notification_email || ''}
                                        onChange={(e) => handleChange('notification_email', e.target.value)}
                                        className={inputClasses}
                                        placeholder="ALERTS@PROTOCOL"
                                    />
                                </div>
                                <div className="group">
                                    <label className={labelClasses}>Temporal Zone</label>
                                    <div className="relative group">
                                        <select
                                            value={settings.timezone || 'UTC'}
                                            onChange={(e) => handleChange('timezone', e.target.value)}
                                            className={`${inputClasses} cursor-pointer appearance-none pr-10`}
                                        >
                                            <option className="bg-black">UTC</option>
                                            <option className="bg-black">EST</option>
                                            <option className="bg-black">CST</option>
                                            <option className="bg-black">MST</option>
                                            <option className="bg-black">PST</option>
                                        </select>
                                        <Clock size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none group-focus-within:text-[#10b981]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-6 py-6 border border-[#10b981]/20 text-[#10b981] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-[#10b981] hover:text-black transition-all duration-500 rounded-3xl disabled:opacity-50 group"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin"></div>
                        ) : (
                            <>
                                <Save size={16} />
                                SYNC_GLOBAL_IDENTITY
                            </>
                        )}
                    </button>
                </div>

                {/* Policies & Security */}
                <div className="space-y-16 md:space-y-24">
                    <div className="space-y-12 md:space-y-16 p-8 border border-white/10 rounded-3xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6 md:pb-8">
                            <div className="flex items-center gap-6">
                                <div className="text-[#f59e0b]">
                                    <Percent size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Adjustment Logic</h3>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">POLICY_VECTOR_CONSTRAINTS</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            <div className="group">
                                <label className={labelClasses}>Temporal Window (Days)</label>
                                <input
                                    type="number"
                                    value={settings.refund_policy_days || '14'}
                                    onChange={(e) => handleChange('refund_policy_days', e.target.value)}
                                    className={inputClasses.replace('focus:border-[#10b981]', 'focus:border-[#f59e0b]')}
                                />
                            </div>
                            <div className="group">
                                <label className={labelClasses}>Max Threshold (%)</label>
                                <input
                                    type="number"
                                    value={settings.max_refund_percentage || '100'}
                                    onChange={(e) => handleChange('max_refund_percentage', e.target.value)}
                                    className={inputClasses.replace('focus:border-[#10b981]', 'focus:border-[#f59e0b]')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12 md:space-y-16">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6 md:pb-8">
                            <div className="flex items-center gap-6">
                                <div className="text-white/40">
                                    <ShieldCheck size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Access Key</h3>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">SECURITY_TOKEN_ROTATION</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-10 md:space-y-12">
                            {(passwordMessage || passwordError) && (
                                <div className={`p-4 text-[9px] font-black uppercase tracking-widest text-center border ${
                                    passwordMessage ? 'bg-[#10b981]/5 border-[#10b981]/20 text-[#10b981]' : 'bg-red-500/5 border-red-500/20 text-red-500'
                                }`}>
                                    {passwordMessage || passwordError}
                                </div>
                            )}
                            <div className="group">
                                <label className={labelClasses}>Current Key</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className={inputClasses.replace('focus:border-[#10b981]', 'focus:border-white')}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="group">
                                    <label className={labelClasses}>New Key</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className={inputClasses.replace('focus:border-[#10b981]', 'focus:border-white')}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className={labelClasses}>Verify Key</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className={inputClasses.replace('focus:border-[#10b981]', 'focus:border-white')}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-white text-black py-5 md:py-6 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] hover:bg-[#10b981] transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.3)] group flex items-center justify-center gap-4"
                            >
                                <span>Update Credentials</span>
                                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-24 md:pt-32">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group bg-[#10b981] text-black px-12 md:px-24 py-6 md:py-8 font-black uppercase tracking-[0.5em] text-[10px] md:text-[11px] flex items-center gap-4 md:gap-6 hover:bg-white transition-all duration-700 disabled:opacity-50 shadow-[0_30px_60px_rgba(16,185,129,0.15)]"
                >
                    {saving ? 'SYNCHRONIZING...' : 'COMMIT_GLOBAL_CHANGES'}
                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
