import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardChart = ({ data, period, onPeriodChange }) => {
    return (
        <div className="py-12 md:py-24 space-y-12 md:space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/70">REVENUE_MANIFEST</h3>
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">TEMPORAL_OUTPUT_SEQUENCE</p>
                </div>
                <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar w-full md:w-auto">
                    {['days', 'weeks', 'months'].map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange(p)}
                            className={`px-4 md:px-6 py-2 text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 border min-w-max ${
                                period === p 
                                    ? 'bg-[#10b981] border-[#10b981] text-black' 
                                    : 'border-white/10 text-white/20 hover:border-white/30 hover:text-white'
                            }`}
                        >
                            {p === 'days' ? '07_DAYS' : p === 'weeks' ? '04_WEEKS' : '06_MONTHS'}
                        </button>
                    ))}
                </div>
            </div>
            
            {data ? (
                <div className="h-[300px] md:h-[400px] w-full relative">
                    {/* Faded Line behind chart */}
                    <div className="absolute inset-x-0 bottom-[60px] h-px bg-white/5"></div>
                    
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#ffffff" strokeOpacity={0.01} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#ffffff" 
                                fontSize={8} 
                                fontWeight={900} 
                                tick={{ fill: '#ffffff', opacity: 0.1 }}
                                axisLine={false}
                                tickLine={false}
                                dy={20}
                            />
                            <YAxis 
                                stroke="#ffffff" 
                                fontSize={8} 
                                fontWeight={900} 
                                tick={{ fill: '#ffffff', opacity: 0.1 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                                contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '0' }}
                                itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                labelStyle={{ color: '#ffffff20', fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.4em' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={2} 
                                dot={false} 
                                activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#000000', shape: 'square' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[300px] md:h-[400px] w-full flex items-center justify-center border-y border-white/10 bg-white/[0.01]">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.8em] animate-pulse">AWAITING_DATA_STREAM</p>
                </div>
            )}
        </div>
    );
};

export default DashboardChart;
