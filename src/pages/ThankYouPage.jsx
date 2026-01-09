import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
    CheckCircle, 
    Download, 
    Home, 
    FileText, 
    Clock, 
    ShieldCheck, 
    ArrowRight, 
    Mail, 
    HelpCircle,
    RotateCcw
} from 'lucide-react';

const ThankYouPage = () => {
    const location = useLocation();
    const { reference, amount, email, name } = location.state || {};

    const downloadReceipt = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(22, 163, 74); 
        doc.text('TutorFlow Official Receipt', 20, 30);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); 
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
        doc.text(`Receipt No: ${reference}`, 20, 50);
        
        doc.setDrawColor(226, 232, 240); 
        doc.line(20, 60, 190, 60);
        
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59); 
        doc.text('Payment Details:', 20, 75);
        
        doc.setFontSize(12);
        doc.text(`Customer Name: ${name}`, 20, 90);
        doc.text(`Customer Email: ${email}`, 20, 100);
        doc.text(`Service: Academic Tutoring & Assignment Support`, 20, 110);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount Paid: $${amount}`, 20, 130);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); 
        doc.text('Thank you for choosing TutorFlow. For any queries, contact support@tutorflow.edu', 20, 150);
        
        doc.save(`TutorFlow_Receipt_${reference}.pdf`);
    };

    if (!reference) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
                    <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HelpCircle size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">Session Expired</h2>
                    <p className="text-slate-500 mb-8">We couldn't find your recent transaction details. If you just paid, please check your email for confirmation.</p>
                    <Link to="/" className="block w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg">
                        Return to Payment
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-emerald-600 rounded-t-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-center mb-8">
                            <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm animate-bounce">
                                <CheckCircle size={80} className="text-white" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Payment Received!</h1>
                        <p className="text-emerald-100 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
                            Thank you, <span className="text-white font-bold">{name.split(' ')[0]}</span>. Your academic journey just got easier.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-b-[3rem] shadow-2xl overflow-hidden mb-12">
                    <div className="p-8 md:p-12">
                        {/* Transaction Summary Section */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                <FileText className="text-emerald-600" />
                                Payment Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 transition-hover hover:border-emerald-200 group">
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Transaction ID</p>
                                    <p className="text-slate-800 font-mono text-lg font-bold truncate">{reference}</p>
                                </div>
                                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 transition-hover hover:border-emerald-300">
                                    <p className="text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mb-2">Amount Paid</p>
                                    <p className="text-emerald-900 text-4xl font-black">${amount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps Section */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <Clock className="text-emerald-600" />
                                What Happens Next?
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-6 items-start">
                                    <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0">1</div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">Check Your Email</p>
                                        <p className="text-slate-500">A detailed receipt and confirmation has been sent to <span className="text-emerald-600 font-semibold">{email}</span>.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0">2</div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">Tutor Assignment</p>
                                        <p className="text-slate-500">Our team is reviewing your requirements. A specialized tutor will contact you via email within 2-4 hours.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0">3</div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">Work Commences</p>
                                        <p className="text-slate-500">Once assigned, you can track progress and provide additional materials directly to your tutor.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Refund & Support Section - NEW & BIG */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white mb-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldCheck size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
                                    <RotateCcw className="text-emerald-400" />
                                    Refund & Guarantee
                                </h3>
                                <p className="text-slate-400 text-lg mb-8 max-w-xl">
                                    Not satisfied with the service? We offer a 100% money-back guarantee. You can request a refund through our dedicated portal within 14 days.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link 
                                        to="/refund"
                                        className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl"
                                    >
                                        Access Refund Portal
                                        <ArrowRight size={20} />
                                    </Link>
                                    <a 
                                        href="mailto:support@tutorflow.edu"
                                        className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white font-bold py-5 rounded-2xl transition-all backdrop-blur-sm"
                                    >
                                        <Mail size={20} />
                                        Contact Support
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button 
                                onClick={downloadReceipt}
                                className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-600 font-black py-5 rounded-2xl transition-all shadow-sm"
                            >
                                <Download size={24} />
                                Save Receipt (PDF)
                            </button>
                            <Link 
                                to="/"
                                className="flex-1 flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-5 rounded-2xl transition-all"
                            >
                                <Home size={24} />
                                Back to Homepage
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-400 font-medium">
                    <p>© {new Date().getFullYear()} TutorFlow Platform. Secure Academic Payments.</p>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;

