import React from 'react';
import { CheckSquare, XSquare, RefreshCw } from 'lucide-react';

const RefundsTable = ({ refunds, onApprove, onReject, processingId }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar">
            <div className="min-w-[900px]">
                <div className="grid grid-cols-5 px-0 py-6 text-[10px] font-black uppercase tracking-[0.6em] text-[#f59e0b] border-b border-white/10">
                    <div>ENTITY_IDENTITY</div>
                    <div>VALUE_USD</div>
                    <div>ADJUSTMENT_REASON</div>
                    <div>STATUS</div>
                    <div className="text-right">EXECUTE</div>
                </div>
                <div>
                    {refunds.map((r, i) => (
                        <div key={i} className="grid grid-cols-5 items-center px-0 py-10 transition-all duration-500 group border-b border-white/10 last:border-none">
                            <div>
                                <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2 group-hover:text-[#f59e0b] transition-colors duration-500">{r.email}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{r.reference || 'REF_NULL'}</p>
                            </div>
                            <div className="text-4xl font-black text-white tracking-tighter group-hover:text-[#f59e0b] transition-colors duration-500">
                                <span className="text-[18px] text-white/20 mr-1">$</span>
                                {Number(r.amount).toLocaleString()}
                            </div>
                            <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] truncate pr-8 group-hover:text-white/50 transition-colors duration-500">
                                {r.reason}
                            </div>
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 border ${
                                    r.status === 'approved' ? 'text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5' : 
                                    r.status === 'rejected' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                                    'text-[#f59e0b] border-[#f59e0b]/20 bg-[#f59e0b]/5'
                                }`}>
                                    {r.status}
                                </span>
                            </div>
                            <div className="flex justify-end gap-12">
                                {r.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => onApprove(r.id)}
                                            disabled={processingId === r.id}
                                            className="text-[#10b981] hover:text-white transition-all duration-500 disabled:opacity-50 hover:scale-125"
                                            title="Approve Refund"
                                        >
                                            {processingId === r.id ? <RefreshCw className="animate-spin" size={20} /> : <CheckSquare size={20} />}
                                        </button>
                                        <button 
                                            onClick={() => onReject(r.id)}
                                            disabled={processingId === r.id}
                                            className="text-red-500 hover:text-white transition-all duration-500 disabled:opacity-50 hover:scale-125"
                                            title="Reject Refund"
                                        >
                                            <XSquare size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RefundsTable;
