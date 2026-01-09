import React from 'react';
import InfoLayout from '../components/InfoLayout';
import { Scale, Gavel, FileText } from 'lucide-react';

const LawAssignments = () => {
    return (
        <InfoLayout title="Law Assignment Assistance">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <p className="text-lg">
                    Navigating complex legal frameworks requires precision, deep research, and a profound understanding of case law. Our legal experts are here to help you excel in your law degree.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-12">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Scale className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Case Analysis</h3>
                        <p className="text-sm">Detailed IRAC-based analysis of landmark and recent court rulings.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Gavel className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Mooting Prep</h3>
                        <p className="text-sm">Drafting persuasive skeleton arguments and bundles for your mooting sessions.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <FileText className="text-emerald-600 mb-4" size={24} />
                        <h3 className="font-bold text-slate-900">Legal Theory</h3>
                        <p className="text-sm">In-depth essays on Jurisprudence, Equity, and International Law.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Expertise Across Jurisdictions</h2>
                <p>We have specialized tutors for UK Law (Common Law), US Law, European Law, and International Human Rights. Whether it's Tort, Contract, or Constitutional Law, we provide high-grade academic support tailored to your specific curriculum.</p>
                
                <div className="bg-emerald-600 p-8 rounded-3xl text-white">
                    <h4 className="text-xl font-bold mb-2">Ready to start your Law project?</h4>
                    <p className="text-emerald-100 mb-6">Our legal researchers are standing by to help you draft your next first-class assignment.</p>
                    <button onClick={() => window.location.href='/'} className="bg-white text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all">Get Started Now</button>
                </div>
            </div>
        </InfoLayout>
    );
};

export default LawAssignments;
