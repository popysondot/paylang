import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 selection:bg-emerald-500/30">
                    <div className="max-w-2xl w-full space-y-12 animate-in fade-in duration-700">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <span className="text-red-500 text-xs font-black uppercase tracking-[0.3em]">System Fault Detected</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                                Critical <br />
                                <span className="text-slate-800 outline-text">Exception.</span>
                            </h1>
                        </div>

                        <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-xl">
                            The application encountered an unrecoverable runtime error. Our automated monitoring systems have been notified.
                        </p>

                        {this.state.error && (
                            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Stack Debug Trace</p>
                                <div className="max-h-48 overflow-y-auto font-mono text-xs text-red-400/80 leading-relaxed break-all">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && (
                                        <div className="mt-4 text-slate-600">
                                            {this.state.errorInfo.componentStack}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-6">
                            <button
                                onClick={this.handleReset}
                                className="group flex items-center justify-between bg-emerald-500 text-[#0f172a] px-10 py-6 rounded-full transition-all duration-500 sm:w-80"
                            >
                                <span className="text-sm font-black uppercase tracking-widest">Reinitialize</span>
                                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="group flex items-center justify-between bg-slate-900 text-white px-10 py-6 rounded-full transition-all duration-500 sm:w-80 border border-slate-800"
                            >
                                <span className="text-sm font-black uppercase tracking-widest">Return to Hub</span>
                                <AlertTriangle size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
                        .outline-text {
                            -webkit-text-stroke: 1px #334155;
                            color: transparent;
                        }
                        @media (min-width: 1024px) {
                            .outline-text {
                                -webkit-text-stroke: 2px #334155;
                            }
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
