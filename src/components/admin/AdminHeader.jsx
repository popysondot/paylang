import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

const AdminHeader = ({ activeView, filter, setFilter }) => {
    const getTitle = () => {
        switch(activeView) {
            case 'dashboard': return 'Insight';
            case 'transactions': return 'Vault';
            case 'customers': return 'Identity';
            case 'refunds': return 'Flow';
            case 'audit': return 'Sequence';
            case 'staff': return 'Access';
            case 'settings': return 'System';
            default: return 'System';
        }
    };

    const getSubtitle = () => {
        switch(activeView) {
            case 'dashboard': return 'ANALYTICS_MANIFEST';
            case 'transactions': return 'SETTLEMENT_LOGS';
            case 'customers': return 'ENTITY_REGISTRY';
            case 'refunds': return 'ADJUSTMENT_VECTORS';
            case 'audit': return 'AUDIT_SEQUENCE_LOGS';
            case 'staff': return 'ACCESS_CONTROL_LIST';
            case 'settings': return 'CORE_CONFIGURATION';
            default: return 'SYSTEM_DASHBOARD';
        }
    };

    return (
        <header className="py-12 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-[#10b981]"></div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#10b981]">{getSubtitle()}</p>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                    {getTitle()}
                </h2>
            </div>

            <div className="w-full md:w-96 group">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2 group-focus-within:text-[#10b981] transition-colors">Registry Search</label>
                <div className="relative">
                    <SearchIcon 
                        className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-500 ${filter ? 'text-[#10b981]' : 'text-white/10'}`} 
                        size={18} 
                    />
                    <input 
                        type="text"
                        placeholder="INPUT_IDENTITY..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-transparent border border-white/10 rounded-full py-4 pl-16 pr-8 outline-none text-base font-black transition-all placeholder:text-white/5 uppercase text-white tracking-tight focus:border-[#10b981]/50"
                    />
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
