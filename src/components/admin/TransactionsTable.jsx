import React from 'react';

const TransactionsTable = ({ transactions }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar pb-8">
            <div className="min-w-[1000px] border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-12 px-10 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-[#10b981] border-b border-white/10">
                    <div className="col-span-2">TIMESTAMP</div>
                    <div className="col-span-4">IDENTITY</div>
                    <div className="col-span-2">VALUE</div>
                    <div className="col-span-3">REFERENCE</div>
                    <div className="col-span-1 text-right">STATUS</div>
                </div>
                <div className="">
                    {transactions.map((t, i) => (
                        <div key={i} className="grid grid-cols-12 items-center px-10 py-8 transition-all duration-500 group border-b border-white/[0.03] last:border-none hover:bg-white/[0.01]">
                            <div className="col-span-2 text-[10px] font-black text-white/40 tracking-widest uppercase">
                                {new Date(t.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="col-span-4">
                                <p className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-[#10b981] transition-colors duration-500">
                                    {t.name}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{t.email}</p>
                            </div>
                            <div className="col-span-2 text-2xl font-black text-white tracking-tighter group-hover:text-[#10b981] transition-colors duration-500">
                                <span className="text-[14px] text-white/20 mr-1">$</span>
                                {Number(t.amount).toLocaleString()}
                            </div>
                            <div className="col-span-3 text-[10px] font-mono font-black text-white/10 uppercase tracking-widest group-hover:text-white/30 transition-colors">
                                {t.reference}
                            </div>
                            <div className="col-span-1 text-right">
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 border rounded-full ${
                                    t.status === 'success' 
                                        ? 'border-[#10b981] text-[#10b981]' 
                                        : 'border-[#f59e0b] text-[#f59e0b]'
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
