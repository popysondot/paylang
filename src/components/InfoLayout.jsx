import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const InfoLayout = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Simple Header */}
            <nav className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                            <GraduationCap size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-800">TutorFlow</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-all">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Content Area */}
            <main className="flex-grow py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-8 font-serif">{title}</h1>
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 prose prose-slate max-w-none">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white pt-12 pb-8 border-t border-slate-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-600 p-1 rounded-lg text-white">
                                <GraduationCap size={16} />
                            </div>
                            <span className="font-bold text-slate-800">TutorFlow</span>
                        </div>
                        <div className="flex gap-6 text-sm font-medium text-slate-400">
                            <Link to="/admin" className="hover:text-emerald-600">Admin</Link>
                            <Link to="/refund" className="hover:text-emerald-600">Refund Portal</Link>
                            <Link to="/privacy-policy" className="hover:text-emerald-600">Privacy Policy</Link>
                            <Link to="/terms-of-service" className="hover:text-emerald-600">Terms of Service</Link>
                        </div>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                    <p className="text-center text-xs text-slate-400">© 2024 TutorFlow Academic Services. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default InfoLayout;
