import React from 'react';

const CustomersTable = ({ customers }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar">
            <div className="min-w-[800px]">
                <div className="grid grid-cols-4 px-0 py-6 text-[10px] font-black uppercase tracking-[0.6em] text-[#10b981] border-b border-white/10">
                    <div>ENTITY_IDENTITY</div>
                    <div>TRANSACTIONS</div>
                    <div>TOTAL_VALUE</div>
                    <div className="text-right">LAST_SYNC</div>
                </div>
                <div>
                    {customers.map((c, i) => (
                        <div key={i} className="grid grid-cols-4 items-center px-0 py-10 transition-all duration-500 group border-b border-white/10 last:border-none">
                            <div>
                                <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2 group-hover:text-[#10b981] transition-colors duration-500">
                                    {c.name}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{c.email}</p>
                            </div>
                            <div className="text-[12px] font-black text-white/50 uppercase tracking-widest">
                                {c.transactionCount} <span className="text-[8px] opacity-40">UNITS</span>
                            </div>
                            <div className="text-4xl font-black text-white tracking-tighter group-hover:text-[#10b981] transition-colors duration-500">
                                <span className="text-[18px] text-white/20 mr-1">$</span>
                                {c.totalSpent.toLocaleString()}
                            </div>
                            <div className="text-right text-[11px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors duration-500">
                                {new Date(c.lastTransaction).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomersTable;
