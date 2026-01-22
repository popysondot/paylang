import React from 'react';

const TransactionsTable = ({ transactions }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar">
            <div className="min-w-[800px]">
                <div className="grid grid-cols-5 px-0 py-6 text-[10px] font-black uppercase tracking-[0.6em] text-[#10b981] border-b border-white/10">
                    <div>TIMESTAMP</div>
                    <div>ENTITY</div>
                    <div>VALUE_USD</div>
                    <div>REFERENCE</div>
                    <div className="text-right">STATUS</div>
                </div>
                <div className="divide-y divide-white/[0.03]">
                    {transactions.map((t, i) => (
                        <div key={i} className="grid grid-cols-5 items-center px-0 py-10 transition-all duration-500 group border-b border-white/10 last:border-none">
                            <div className="text-[11px] font-black text-white/40 tracking-widest uppercase">
                                {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2 group-hover:text-[#10b981] transition-colors duration-500">
                                    {t.name}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t.email}</p>
                            </div>
                            <div className="text-4xl font-black text-white tracking-tighter group-hover:text-[#10b981] transition-colors duration-500">
                                <span className="text-[18px] text-white/20 mr-1">$</span>
                                {Number(t.amount).toLocaleString()}
                            </div>
                            <div className="text-[10px] font-mono font-black text-white/10 uppercase tracking-widest group-hover:text-white/30 transition-colors">
                                {t.reference}
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 border ${
                                    t.status === 'success' 
                                        ? 'text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5' 
                                        : 'text-[#f59e0b] border-[#f59e0b]/20 bg-[#f59e0b]/5'
                                }`}>
                                    {t.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TransactionsTable;
