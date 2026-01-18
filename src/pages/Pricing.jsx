import React from 'react';
import InfoLayout from '../components/InfoLayout';
import { Check, ArrowRight } from 'lucide-react';

const Pricing = () => {
    return (
        <InfoLayout title="Transparent Pricing Guide">
            <div className="space-y-12">
                <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                    We offer competitive, transparent pricing based on complexity and specialized requirements. <span className="text-emerald-400">Zero hidden fees.</span>
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-12">
                    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-6">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Standard Tier</p>
                            <h3 className="text-3xl font-black text-white">Basic Research</h3>
                        </div>
                        <p className="text-5xl font-black text-white">$15 <span className="text-sm text-slate-600 font-bold uppercase tracking-widest">/ Unit</span></p>
                        <ul className="space-y-4 pt-4 border-t border-slate-800">
                            {['Standard Research', 'High Quality Delivery', 'Professional Formatting', '7-Day Support'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                    <Check size={18} className="text-emerald-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="p-8 bg-white text-[#0f172a] rounded-[2rem] space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-emerald-500 px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                            Recommended
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Premium Tier</p>
                            <h3 className="text-3xl font-black">Advanced Analysis</h3>
                        </div>
                        <p className="text-5xl font-black">$25 <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">/ Unit</span></p>
                        <ul className="space-y-4 pt-4 border-t border-slate-100">
                            {['Advanced Analysis', 'Premium Quality', 'Senior Level Expert', 'Priority Delivery'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm font-black uppercase tracking-tight">
                                    <Check size={18} className="text-emerald-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">Price Factors</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <p className="text-white font-black uppercase tracking-widest text-xs">Deadline</p>
                            <p className="text-slate-500 text-sm font-medium">Urgent projects require priority allocation.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-black uppercase tracking-widest text-xs">Complexity</p>
                            <p className="text-slate-500 text-sm font-medium">Technical mastery levels influence tier selection.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-black uppercase tracking-widest text-xs">Volume</p>
                            <p className="text-slate-500 text-sm font-medium">Bulk projects qualify for custom discounts.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-500 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[#0f172a]">
                        <p className="text-2xl font-black uppercase tracking-tighter">Bulk Discounts Available</p>
                        <p className="font-bold opacity-80">Save up to 20% on ongoing projects.</p>
                    </div>
                    <button className="bg-[#0f172a] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-4 transition-all">
                        Contact Sales <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </InfoLayout>
    );
};

export default Pricing;
