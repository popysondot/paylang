import React from 'react';
import { DollarSign, ShoppingBag, Users, RefreshCw } from 'lucide-react';

const StatsGrid = ({ analytics }) => {
    const stats = [
        { label: 'GROSS_OUTPUT', value: `$${analytics?.totalRevenue?.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: '#10b981' },
        { label: 'SETTLEMENTS', value: analytics?.transactionCount, icon: ShoppingBag, trend: '+8.2%', color: 'white' },
        { label: 'ACTIVE_NODES', value: analytics?.uniqueCustomers, icon: Users, trend: '+4.1%', color: 'white' },
        { label: 'FLOW_ADJUST', value: `${analytics?.refundRate}%`, icon: RefreshCw, trend: '-2.4%', color: '#f59e0b' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {stats.map((stat, i) => (
                <div key={i} className="group relative border border-white/10 p-8 rounded-3xl transition-all duration-500 hover:border-[#10b981]/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4" style={{ backgroundColor: stat.color === 'white' ? '#10b981' : stat.color }}></div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">{stat.label}</p>
                        </div>
                        <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border rounded-full ${
                            stat.trend.startsWith('+') 
                                ? 'text-[#10b981] border-[#10b981]/20' 
                                : 'text-[#f59e0b] border-[#f59e0b]/20'
                        }`}>
                            {stat.trend}
                        </div>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                        <p className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none group-hover:text-[#10b981] transition-colors duration-500">
                            {stat.value}
                        </p>
                        <div className="transition-all duration-700 group-hover:scale-110 mb-1" style={{ color: stat.color === 'white' ? 'rgba(255,255,255,0.2)' : stat.color }}>
                            <stat.icon size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
