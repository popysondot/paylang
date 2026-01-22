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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 py-12 border-b border-white/10">
            {stats.map((stat, i) => (
                <div key={i} className="space-y-6 group relative">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-[1px]" style={{ backgroundColor: stat.color === 'white' ? 'rgba(255,255,255,0.2)' : stat.color }}></div>
                            <div className="transition-all duration-700 group-hover:scale-110" style={{ color: stat.color === 'white' ? 'rgba(255,255,255,0.4)' : stat.color }}>
                                <stat.icon size={14} strokeWidth={3} />
                            </div>
                        </div>
                        <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border ${
                            stat.trend.startsWith('+') 
                                ? 'text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5' 
                                : 'text-[#f59e0b] border-[#f59e0b]/20 bg-[#f59e0b]/5'
                        }`}>
                            {stat.trend}
                        </div>
                    </div>
                    <div>
                        <p className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-3 group-hover:text-[#10b981] transition-colors duration-500">
                            {stat.value}
                        </p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] group-hover:text-white/40 transition-colors">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
