import React from 'react';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingBag, 
    RefreshCw, 
    History,
    ShieldCheck,
    LogOut,
    Settings
} from 'lucide-react';

const AdminNavbar = ({ activeView, setActiveView, handleLogout, brandingSettings }) => {
    const menuItems = [
        { id: 'dashboard', label: 'INSIGHT', icon: LayoutDashboard },
        { id: 'transactions', label: 'VAULT', icon: ShoppingBag },
        { id: 'customers', label: 'IDENTITY', icon: Users },
        { id: 'refunds', label: 'FLOW', icon: RefreshCw },
        { id: 'audit', label: 'SEQUENCE', icon: History },
        { id: 'staff', label: 'ACCESS', icon: ShieldCheck },
    ];

    return (
        <nav className="w-full bg-black border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#10b981]"></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
                            {brandingSettings.company_name}
                        </span>
                    </div>
                    
                    <div className="flex md:hidden items-center gap-4">
                        <button
                            onClick={() => setActiveView('settings')}
                            className={`transition-all duration-500 ${activeView === 'settings' ? 'text-[#f59e0b]' : 'text-white/40'}`}
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-white/40 hover:text-red-500 transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    <div className="flex items-center justify-start md:justify-center gap-8 md:gap-12 min-w-max px-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`flex items-center gap-3 transition-all duration-500 group relative py-2`}
                            >
                                <item.icon 
                                    size={14} 
                                    className={`transition-colors duration-500 ${activeView === item.id ? 'text-[#10b981]' : 'text-white/40 group-hover:text-white/60'}`} 
                                />
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
                                    activeView === item.id ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                                }`}>
                                    {item.label}
                                </span>
                                {activeView === item.id && (
                                    <div className="absolute -bottom-2 md:-bottom-6 left-0 w-full h-[2px] bg-[#10b981]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => setActiveView('settings')}
                        className={`transition-all duration-500 group ${activeView === 'settings' ? 'text-[#f59e0b]' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-white/40 hover:text-red-500 transition-colors"
                        title="TERMINATE_SESSION"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
