import React from 'react';
import InfoLayout from '../components/InfoLayout';
import { Brain, Search, Terminal } from 'lucide-react';

const PhDConsultation = () => {
    return (
        <InfoLayout title="PhD Consultation & Research">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <p className="text-lg">
                    The PhD journey is challenging and often isolating. Our senior consultants provide the expert guidance and high-level research support you need to complete your doctorate with confidence.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-12">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Search className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Methodology</h3>
                        <p className="text-sm">Designing robust qualitative and quantitative research frameworks.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Terminal className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Data Analysis</h3>
                        <p className="text-sm">Expert support with SPSS, STATA, R, and NVivo for complex datasets.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Brain className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">VIVA Prep</h3>
                        <p className="text-sm">Mock defense sessions and refining your thesis for final submission.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Bespoke Research Support</h2>
                <p>We provide tailored assistance for specific chapters, including Literature Reviews, Results, and Discussions. Our PhD-level consultants are here to act as your research partners, ensuring your thesis meets the highest academic standards.</p>
            </div>
        </InfoLayout>
    );
};

export default PhDConsultation;
