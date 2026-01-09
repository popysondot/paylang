import React from 'react';
import InfoLayout from '../components/InfoLayout';

const TermsOfService = () => {
    return (
        <InfoLayout title="Terms of Service">
            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                    <p>By accessing and using TutorFlow, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Service Description</h2>
                    <p>TutorFlow provides academic mentorship, research assistance, and tutoring services. The work provided is intended to be used as a model or reference for your own academic work and should be cited appropriately.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Refund Policy</h2>
                    <p>We guarantee high-quality work. If the delivered work does not meet the initial specifications provided, you are entitled to free unlimited revisions. Refunds are considered on a case-by-case basis if the work fails to meet standard academic requirements.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Payment Terms</h2>
                    <p>Payments are processed securely via Paystack. Service begins only after the initial payment or deposit has been confirmed. All prices are in USD unless otherwise specified.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">5. User Responsibility</h2>
                    <p>You are responsible for ensuring that your use of our services complies with your educational institution's academic integrity policies. TutorFlow is not liable for any disciplinary actions taken by your institution.</p>
                </section>
            </div>
        </InfoLayout>
    );
};

export default TermsOfService;
