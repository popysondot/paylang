import React from 'react';
import { ShieldCheck, Lock, UserPlus } from 'lucide-react';

const StaffTable = ({ users, onToggleStatus, onAddUser }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar">
            <div className="min-w-[900px]">
                <div className="flex justify-between items-center mb-16 px-2">
                    <div className="w-1/4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                    <button 
                        onClick={onAddUser}
                        className="flex items-center gap-4 px-10 py-4 bg-[#10b981] text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all duration-700 shadow-[0_20px_40px_rgba(16,185,129,0.1)] group"
                    >
                        <UserPlus size={14} className="group-hover:rotate-12 transition-transform" />
                        PROVISION_ACCESS_IDENTITY
                    </button>
                    <div className="w-1/4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                </div>

                <div className="grid grid-cols-4 px-0 py-6 text-[10px] font-black uppercase tracking-[0.6em] text-[#10b981] border-b border-white/10">
                    <div>ACCESS_IDENTITY</div>
                    <div>ROLE_AUTHORITY</div>
                    <div>SESSION_STATUS</div>
                    <div className="text-right">CONTROL</div>
                </div>
                <div>
                    {users.map((u, i) => (
                        <div key={i} className="grid grid-cols-4 items-center px-0 py-10 transition-all duration-500 group border-b border-white/10 last:border-none">
                            <div className="flex items-center gap-6">
                                <div className="text-white/40 group-hover:text-[#10b981] transition-colors duration-500">
                                    <ShieldCheck size={20} strokeWidth={2.5} />
                                </div>
                                <p className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-[#10b981] transition-colors duration-500 leading-none">{u.username}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] px-4 py-2 border border-white/10">
                                    ROOT_AUTHORITY
                                </span>
                            </div>
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 border ${
                                    u.is_active 
                                        ? 'text-[#10b981] border-[#10b981]/10 bg-[#10b981]/5' 
                                        : 'text-red-500 border-red-500/10 bg-red-500/5'
                                }`}>
                                    {u.is_active ? 'ACTIVE_SESSION' : 'REVOKED'}
                                </span>
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    onClick={() => onToggleStatus(u.id)}
                                    className={`flex items-center gap-4 px-8 py-3 font-black uppercase tracking-[0.4em] text-[10px] transition-all duration-700 border ${
                                        u.is_active 
                                            ? 'text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500' 
                                            : 'text-[#10b981] border-[#10b981]/20 hover:bg-[#10b981] hover:text-black hover:border-[#10b981]'
                                    }`}
                                >
                                    <Lock size={14} />
                                    {u.is_active ? 'REVOKE' : 'RESTORE'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StaffTable;
