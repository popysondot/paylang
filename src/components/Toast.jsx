import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 pointer-events-none">
                {toasts.map(toast => (
                    <Toast 
                        key={toast.id} 
                        {...toast} 
                        onClose={() => removeToast(toast.id)} 
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

const Toast = ({ message, type, onClose }) => {
    return (
        <div className={`
            pointer-events-auto
            flex items-center gap-8 px-8 py-5 border border-white/10 shadow-2xl bg-black/80 backdrop-blur-xl
            animate-in slide-in-from-right-8 duration-500
            ${type === 'success' ? 'ring-1 ring-[#10b981]/50' : 
              type === 'error' ? 'ring-1 ring-red-500/50' : 
              'ring-1 ring-[#f59e0b]/50'}
        `}>
            <div className={`w-2 h-2 ${
                type === 'success' ? 'bg-[#10b981] shadow-[0_0_10px_#10b981]' : 
                type === 'error' ? 'bg-red-500 shadow-[0_0_10px_red]' : 
                'bg-[#f59e0b] shadow-[0_0_10px_#f59e0b]'
            }`}></div>
            
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">{message}</p>
            
            <button 
                onClick={onClose}
                className="text-white/30 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};
