import React from 'react';
import InfoLayout from '../components/InfoLayout';

const PrivacyPolicy = () => {
    return (
        <InfoLayout title="Privacy Policy">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                    <p>At TutorFlow, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">2. The Data We Collect</h2>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li><strong>Identity Data:</strong> Includes first name, last name.</li>
                        <li><strong>Contact Data:</strong> Includes email address and telephone numbers.</li>
                        <li><strong>Financial Data:</strong> Handled securely by Paystack; we do not store full card details on our servers.</li>
                        <li><strong>Transaction Data:</strong> Includes details about payments to and from you.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Confidentiality</h2>
                    <p>Your association with TutorFlow is strictly confidential. We never share your details with your university, third parties, or marketing agencies. All communication between you and your tutor is encrypted.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way. We limit access to your personal data to those employees and tutors who have a business need to know.</p>
                </section>

                <div className="text-xs text-slate-400 pt-8 border-t border-slate-100">
                    Last updated: January 2024. For more information, contact privacy@tutorflow.edu
                </div>
            </div>
        </InfoLayout>
    );
};

export default PrivacyPolicy;
