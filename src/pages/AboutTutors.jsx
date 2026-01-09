import React from 'react';
import InfoLayout from '../components/InfoLayout';
import { UserCheck, Globe, Shield } from 'lucide-react';

const AboutTutors = () => {
    return (
        <InfoLayout title="About Our Elite Tutors">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <p className="text-lg">
                    At TutorFlow, we believe that academic excellence starts with exceptional mentorship. Our network of tutors is composed of some of the most qualified academic professionals in the world.
                </p>

                <div className="grid md:grid-cols-3 gap-8 my-12">
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <UserCheck className="mx-auto text-emerald-600 mb-4" size={32} />
                        <h3 className="font-bold text-slate-900 mb-2">Vetted Experts</h3>
                        <p className="text-sm">Every tutor undergoes a rigorous multi-stage verification process including background checks and academic testing.</p>
                    </div>
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Globe className="mx-auto text-emerald-600 mb-4" size={32} />
                        <h3 className="font-bold text-slate-900 mb-2">Global Presence</h3>
                        <p className="text-sm">Our experts are located in top academic hubs across the US, UK, Canada, and Australia, ensuring local curriculum mastery.</p>
                    </div>
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <Shield className="mx-auto text-emerald-600 mb-4" size={32} />
                        <h3 className="font-bold text-slate-900 mb-2">PhD Level</h3>
                        <p className="text-sm">Over 85% of our tutors hold PhD or Masters degrees from Ivy League and Russell Group universities.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Our Selection Process</h2>
                <p>
                    We don't just hire anybody. We only select the top 3% of applicants. Our criteria focus on subject matter expertise, communication skills, and a passion for student success. When you work with a TutorFlow expert, you're working with a proven leader in their field.
                </p>

                <h2 className="text-2xl font-bold text-slate-900">Commitment to Integrity</h2>
                <p>
                    Academic integrity is the cornerstone of our service. Our tutors act as mentors, providing original research, guidance, and high-quality drafts that serve as powerful study tools to help you master your curriculum.
                </p>
            </div>
        </InfoLayout>
    );
};

export default AboutTutors;
