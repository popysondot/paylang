import React from 'react';
import { ArrowRight } from 'lucide-react';

const DiffViewer = ({ data }) => {
    if (!data) return null;
    try {
        const diff = typeof data === 'string' ? JSON.parse(data) : data;
        if (!diff || typeof diff !== 'object') return <span className="text-white/20 italic text-[9px]">No details available</span>;
        
        return (
            <div className="mt-2 space-y-1">
                {Object.entries(diff).map(([key, val]) => (
                    <div key={key} className="text-[9px] flex items-center gap-3">
                        <span className="font-black text-white/30 uppercase tracking-widest">{key}:</span>
                        <span className="text-red-500/40 line-through">{String(val.from)}</span>
                        <ArrowRight size={10} className="text-white/10" />
                        <span className="text-[#10b981] font-black">{String(val.to)}</span>
                    </div>
                ))}
            </div>
        );
    } catch (e) {
        return <span className="text-white/20 text-[9px]">{String(data)}</span>;
    }
};

const AuditLogsTable = ({ logs }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar pb-8">
            <div className="min-w-[1000px] border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-12 px-10 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-[#10b981] border-b border-white/10">
                    <div className="col-span-3">IDENTITY_UID</div>
                    <div className="col-span-2">ACTION_VECTOR</div>
                    <div className="col-span-5">PAYLOAD_DETAILS</div>
                    <div className="col-span-2 text-right">TIMESTAMP</div>
                </div>
                <div>
                    {logs.map((log, i) => (
                        <div key={i} className="grid grid-cols-12 items-start px-10 py-8 transition-all duration-500 group border-b border-white/[0.03] last:border-none hover:bg-white/[0.01]">
                            <div className="col-span-3">
                                <p className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-[#10b981] transition-colors duration-500">{log.username}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10 mt-1">IP_{log.ip_address}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[9px] font-black text-[#10b981] uppercase tracking-[0.3em] px-4 py-2 border border-[#10b981]/20 rounded-full">
                                    {log.action}
                                </span>
                            </div>
                            <div className="col-span-5 pr-12">
                                <DiffViewer data={log.details} />
                            </div>
                            <div className="col-span-2 text-right text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors duration-500">
                                {new Date(log.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuditLogsTable;
