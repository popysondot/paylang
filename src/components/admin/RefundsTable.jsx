import React from 'react';
import { CheckSquare, XSquare, RefreshCw } from 'lucide-react';

const RefundsTable = ({ refunds, onApprove, onReject, processingId }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar pb-8">
            <div className="min-w-[1000px] border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-12 px-10 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-[#f59e0b] border-b border-white/10">
                    <div className="col-span-4">ENTITY_IDENTITY</div>
                    <div className="col-span-2">VALUE</div>
                    <div className="col-span-3">ADJUSTMENT_REASON</div>
                    <div className="col-span-2">STATUS</div>
                    <div className="col-span-1 text-right">EXECUTE</div>
                </div>
                <div>
                    {refunds.map((r, i) => (
                        <div key={i} className="grid grid-cols-12 items-center px-10 py-8 transition-all duration-500 group border-b border-white/[0.03] last:border-none hover:bg-white/[0.01]">
                            <div className="col-span-4">
                                <p className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-[#f59e0b] transition-colors duration-500 truncate pr-4">{r.email}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{r.reference || 'REF_NULL'}</p>
                            </div>
                            <div className="col-span-2 text-2xl font-black text-white tracking-tighter group-hover:text-[#f59e0b] transition-colors duration-500">
                                <span className="text-[14px] text-white/20 mr-1">$</span>
                                {Number(r.amount).toLocaleString()}
                            </div>
                            <div className="col-span-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] truncate pr-8 group-hover:text-white/50 transition-colors duration-500">
                                {r.reason}
                            </div>
                            <div className="col-span-2">
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 border rounded-full ${
                                    r.status === 'approved' ? 'border-[#10b981] text-[#10b981]' : 
                                    r.status === 'rejected' ? 'border-red-500 text-red-500' : 
                                    'border-[#f59e0b] text-[#f59e0b]'
                                }`}>
                                    {r.status}
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-end gap-6">
                                {r.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => onApprove(r.id)}
                                            disabled={processingId === r.id}
                                            className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-[#10b981] hover:border-[#10b981] hover:text-[#10b981] transition-all duration-500 disabled:opacity-50"
                                            title="Approve Refund"
                                        >
                                            {processingId === r.id ? <RefreshCw className="animate-spin" size={16} /> : <CheckSquare size={16} />}
                                        </button>
                                        <button 
                                            onClick={() => onReject(r.id)}
                                            disabled={processingId === r.id}
                                            className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-red-500 hover:border-red-500 hover:text-red-500 transition-all duration-500 disabled:opacity-50"
                                            title="Reject Refund"
                                        >
                                            <XSquare size={16} />
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
