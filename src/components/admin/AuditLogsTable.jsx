import React from 'react';
import { ArrowRight } from 'lucide-react';

const DiffViewer = ({ data }) => {
    if (!data) return null;
    try {
        const diff = typeof data === 'string' ? JSON.parse(data) : data;
        if (!diff || typeof diff !== 'object') return <span className="text-white/20 italic text-[10px]">No details available</span>;
        
        return (
            <div className="mt-2 space-y-1">
                {Object.entries(diff).map(([key, val]) => (
                    <div key={key} className="text-[10px] flex items-center gap-3">
                        <span className="font-black text-white/30 uppercase tracking-widest">{key}:</span>
                        <span className="text-red-500/40 line-through">{String(val.from)}</span>
                        <ArrowRight size={10} className="text-white/10" />
                        <span className="text-[#10b981] font-black">{String(val.to)}</span>
                    </div>
                ))}
            </div>
        );
    } catch (e) {
        return <span className="text-white/20 text-[10px]">{String(data)}</span>;
    }
};

const AuditLogsTable = ({ logs }) => {
    return (
        <div className="animate-in fade-in duration-1000 overflow-x-auto no-scrollbar">
            <div className="min-w-[900px]">
                <div className="grid grid-cols-4 px-0 py-6 text-[10px] font-black uppercase tracking-[0.6em] text-[#10b981] border-b border-white/10">
                    <div>IDENTITY_UID</div>
                    <div>ACTION_VECTOR</div>
                    <div>PAYLOAD_DETAILS</div>
                    <div className="text-right">TIMESTAMP</div>
                </div>
                <div>
                    {logs.map((log, i) => (
                        <div key={i} className="grid grid-cols-4 items-start px-0 py-10 transition-all duration-500 group border-b border-white/10 last:border-none">
                            <div>
                                <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-[#10b981] transition-colors duration-500">{log.username}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 mt-3">IP_{log.ip_address}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.4em] px-4 py-2 border border-[#10b981]/20 bg-[#10b981]/5">
                                    {log.action}
                                </span>
                            </div>
                            <div className="pr-12">
                                <DiffViewer data={log.details} />
                            </div>
                            <div className="text-right text-[11px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors duration-500">
                                {new Date(log.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuditLogsTable;
