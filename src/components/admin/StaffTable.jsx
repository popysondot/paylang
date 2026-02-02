import React from 'react';
import { ShieldCheck, Lock, UserPlus } from 'lucide-react';

const StaffTable = ({ users, onToggleStatus, onAddUser }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar pb-8">
            <div className="min-w-[900px]">
                <div className="flex justify-end items-center mb-8 pr-2">
                    <button 
                        onClick={onAddUser}
                        className="flex items-center gap-4 px-10 py-4 border border-[#10b981] text-[#10b981] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-[#10b981] hover:text-black transition-all duration-700 rounded-full group"
                    >
                        <UserPlus size={14} className="group-hover:rotate-12 transition-transform" />
                        PROVISION_ACCESS
                    </button>
                </div>

                <div className="border border-white/10 rounded-[2.5rem] overflow-hidden">
                    <div className="grid grid-cols-4 px-10 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-[#10b981] border-b border-white/10">
                        <div>ACCESS_IDENTITY</div>
                        <div>ROLE_AUTHORITY</div>
                        <div>SESSION_STATUS</div>
                        <div className="text-right">CONTROL</div>
                    </div>
                    <div>
                        {users.map((u, i) => (
                            <div key={i} className="grid grid-cols-4 items-center px-10 py-8 transition-all duration-500 group border-b border-white/[0.03] last:border-none hover:bg-white/[0.01]">
                                <div className="flex items-center gap-6">
                                    <div className="text-white/20 group-hover:text-[#10b981] transition-colors duration-500">
                                        <ShieldCheck size={18} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-[#10b981] transition-colors duration-500 leading-none">{u.username}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] px-4 py-2 border border-white/10 rounded-full">
                                        ROOT_AUTHORITY
                                    </span>
                                </div>
                                <div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 border rounded-full ${
                                        u.is_active 
                                            ? 'border-[#10b981] text-[#10b981]' 
                                            : 'border-red-500 text-red-500'
                                    }`}>
                                        {u.is_active ? 'ACTIVE' : 'REVOKED'}
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => onToggleStatus(u.id)}
                                        className={`flex items-center gap-4 px-8 py-3 font-black uppercase tracking-[0.4em] text-[10px] transition-all duration-700 border rounded-full ${
                                            u.is_active 
                                                ? 'text-red-500 border-red-500/20 hover:border-red-500' 
                                                : 'text-[#10b981] border-[#10b981]/20 hover:border-[#10b981]'
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
        </div>
    );
};

export default StaffTable;
