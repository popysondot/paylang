import React from 'react';
import InfoLayout from '../components/InfoLayout';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

const BusinessCaseStudies = () => {
    return (
        <InfoLayout title="Business & Management Case Studies">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <p className="text-lg">
                    Success in business education requires strategic thinking and data-driven analysis. Our MBA-qualified experts help you analyze complex business scenarios and provide winning recommendations.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-12">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <BarChart3 className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">SWOT Analysis</h3>
                        <p className="text-sm">Strategic evaluation of corporate strengths, weaknesses, and market opportunities.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <PieChart className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Market Research</h3>
                        <p className="text-sm">Consumer behavior analysis and competitive landscape mapping.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <TrendingUp className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Financial Reports</h3>
                        <p className="text-sm">Interpretation of financial statements and ratio analysis for corporate assignments.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Global Business Insights</h2>
                <p>From tech startups in Silicon Valley to manufacturing giants in Europe, our case study experts cover all industries. We use modern frameworks like Porter’s Five Forces and PESTEL to ensure your analysis is comprehensive and professional.</p>
            </div>
        </InfoLayout>
    );
};

export default BusinessCaseStudies;
