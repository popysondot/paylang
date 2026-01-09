import React from 'react';
import InfoLayout from '../components/InfoLayout';
import { Check } from 'lucide-react';

const Pricing = () => {
    return (
        <InfoLayout title="Transparent Pricing Guide">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <p className="text-lg">
                    We offer competitive, transparent pricing based on the complexity, urgency, and academic level of your assignment. There are never any hidden fees.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-12">
                    <div className="p-8 border-2 border-slate-100 rounded-3xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Undergraduate Level</h3>
                        <p className="text-3xl font-extrabold text-emerald-600 mb-6">Starting at $15 <span className="text-sm text-slate-400 font-normal">/ page</span></p>
                        <ul className="space-y-3">
                            {['Standard Research', '2:1 Grade Quality', 'Free Formatting', '7-Day Support'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-sm"><Check size={16} className="text-emerald-500" /> {item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-8 border-2 border-emerald-500 rounded-3xl relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-widest">Recommended</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Postgraduate / PhD</h3>
                        <p className="text-3xl font-extrabold text-emerald-600 mb-6">Starting at $25 <span className="text-sm text-slate-400 font-normal">/ page</span></p>
                        <ul className="space-y-3">
                            {['Advanced Analysis', 'First-Class Quality', 'PhD Level Expert', 'Priority Delivery'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-sm"><Check size={16} className="text-emerald-500" /> {item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">What Influences the Price?</h2>
                <ul className="list-disc pl-6 space-y-4">
                    <li><strong>Deadline:</strong> Assignments with longer deadlines are generally more affordable.</li>
                    <li><strong>Complexity:</strong> Specialized topics like Quantum Physics or Advanced Law may require higher-tier experts.</li>
                    <li><strong>Word Count:</strong> We price per page (standard 275 words per page).</li>
                </ul>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mt-8">
                    <p className="text-emerald-800 font-semibold">Bulk Discount Available</p>
                    <p className="text-emerald-600 text-sm">Need a full dissertation or multiple modules? Contact our support for a custom quote and save up to 20%.</p>
                </div>
            </div>
        </InfoLayout>
    );
};

export default Pricing;
