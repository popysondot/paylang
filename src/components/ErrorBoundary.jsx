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
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-red-100">
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-100 p-4 rounded-full">
                                <AlertTriangle size={48} className="text-red-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 text-center mb-4">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-slate-500 text-center mb-8 font-medium">
                            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 max-h-48 overflow-y-auto font-mono text-xs text-slate-600">
                                <p className="font-bold text-red-600 mb-2">Error Details:</p>
                                <p className="whitespace-pre-wrap break-words">{this.state.error.toString()}</p>
                                {this.state.errorInfo && (
                                    <>
                                        <p className="font-bold text-red-600 mt-4 mb-2">Stack Trace:</p>
                                        <p className="whitespace-pre-wrap break-words text-xs">{this.state.errorInfo.componentStack}</p>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
                            >
                                <RefreshCw size={20} /> Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg"
                            >
                                Go Home
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
