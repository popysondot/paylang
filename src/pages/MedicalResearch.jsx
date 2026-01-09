import React from 'react';
import InfoLayout from '../components/InfoLayout';
import { Activity, Microscope, HeartPulse } from 'lucide-react';

const MedicalResearch = () => {
    return (
        <InfoLayout title="Medical & Healthcare Research">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <p className="text-lg">
                    The medical field demands absolute accuracy and up-to-date scientific evidence. Our healthcare professionals and medical researchers provide high-level support for nursing, medicine, and public health students.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-12">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Microscope className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Literature Reviews</h3>
                        <p className="text-sm">Systematic and narrative reviews using PubMed, Cochrane, and Google Scholar.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Activity className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Case Studies</h3>
                        <p className="text-sm">Professional clinical case study analysis and care plan development.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <HeartPulse className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Ethical Analysis</h3>
                        <p className="text-sm">Comprehensive discussion on bioethics and healthcare policy frameworks.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Evidence-Based Excellence</h2>
                <p>All medical research provided is cited using specialized medical styles (AMA, Vancouver, APA) and reflects the latest clinical guidelines. We ensure your work is grounded in solid scientific evidence.</p>
            </div>
        </InfoLayout>
    );
};

export default MedicalResearch;
