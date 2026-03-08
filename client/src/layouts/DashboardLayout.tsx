import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex bg-transparent h-screen w-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden mr-4 my-4">
                {/* Topbar */}
                <header className="h-16 shrink-0 flex items-center justify-between px-8 glass-panel-subtle mb-4 relative z-50">
                    <h1 className="text-xl font-semibold text-white tracking-wide">
                        Scientific Analysis Portal
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-medium text-white shadow-lg border border-indigo-600 transition-transform group-hover:scale-105">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {/* Detailed Profile Dropdown */}
                            <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                <div className="bg-zinc-900 p-1 border border-zinc-800 shadow-2xl rounded-xl flex flex-col">
                                    <div className="px-4 py-3 border-b border-zinc-800/50">
                                        <p className="text-sm font-semibold text-zinc-100 truncate">{user?.email || 'Guest User'}</p>
                                        <p className="text-xs text-zinc-400 mt-1">Joined: <span className="text-zinc-300 font-medium px-1 py-0.5 rounded bg-zinc-800">{new Date().toLocaleDateString()}</span></p>
                                    </div>
                                    <div className="px-4 py-3 border-b border-zinc-800/50">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Current Plan</p>
                                        <p className="text-sm text-indigo-400 font-bold capitalize">{user?.plan || 'Trial'}</p>
                                    </div>
                                    <div className="p-1">
                                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden glass-panel-subtle p-8 rounded-2xl border border-white/10 shadow-2xl relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
