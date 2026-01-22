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
                <div className="min-h-screen bg-black flex items-center justify-center p-8 selection:bg-[#10b981]/30">
                    <div className="max-w-4xl w-full bg-white/5 border border-white/10 p-12 md:p-20 space-y-20 animate-in fade-in duration-1000 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -mr-32 -mt-32"></div>
                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-[2px] bg-red-500"></div>
                                <span className="text-red-500 text-[11px] font-black uppercase tracking-[0.5em]">System Logic Fault</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] text-white uppercase">
                                Execution <br />
                                <span className="text-white/10">Failure.</span>
                            </h1>
                        </div>

                        <p className="text-xl font-medium text-white/40 leading-tight max-w-2xl uppercase tracking-tighter relative z-10">
                            The application encountered an unrecoverable runtime exception. Administrative nodes have been alerted.
                        </p>

                        {this.state.error && (
                            <div className="border-t border-white/10 pt-10 space-y-6 relative z-10">
                                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Stack Debug Manifest</p>
                                <div className="max-h-64 overflow-y-auto font-mono text-xs text-white/40 leading-relaxed break-all bg-black/50 p-8 border border-white/10">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && (
                                        <div className="mt-6 text-white/20">
                                            {this.state.errorInfo.componentStack}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 bg-[#10b981] text-black px-12 py-8 hover:bg-white transition-all duration-500"
                            >
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Reinitialize Protocol</span>
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 bg-white/5 text-white px-12 py-8 hover:bg-white hover:text-black border border-white/10 transition-all duration-500"
                            >
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Return to Hub</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
