import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Microscope, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = (pathname: string) => {
        if (pathname === '/') return 'Dashboard';
        if (pathname.startsWith('/analysis')) return 'New Analysis';
        if (pathname.startsWith('/history')) return 'History';
        if (pathname.startsWith('/results')) return 'Analysis Results';
        if (pathname.startsWith('/packages')) return 'Plans';
        return 'Scientific Analysis Portal';
    };

    return (
        <header className="h-16 shrink-0 flex items-center justify-between px-8 bg-[rgba(255,255,255,0.15)] backdrop-blur-md mb-4 relative z-50 rounded-2xl border-b border-solid border-[rgba(255,255,255,0.25)] shadow-lg text-white">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 md:hidden">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center p-1">
                        <Microscope className="h-5 w-5 text-white" />
                    </div>
                </div>
                <h1 className="text-xl font-semibold text-white tracking-wide">
                    {getPageTitle(location.pathname)}
                </h1>
            </div>
            
            <div className="flex items-center gap-6">
                <Link
                    to="/analysis"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all text-sm font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Analysis
                </Link>

                <div className="relative group cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-[var(--color-button-primary)] shadow-lg transition-transform group-hover:scale-105">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {/* Detailed Profile Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                        <div className="bg-[var(--color-button-primary)] p-1 border border-white/20 shadow-2xl rounded-xl flex flex-col">
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-sm font-semibold text-white truncate">{user?.email || 'Guest User'}</p>
                                <p className="text-xs text-emerald-100/70 mt-1">Joined: <span className="text-white font-medium px-1 py-0.5 rounded bg-white/10">{new Date().toLocaleDateString()}</span></p>
                            </div>
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1">Current Plan</p>
                                <p className="text-sm text-white font-extrabold capitalize">{user?.plan || 'Trial'}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-rose-200 hover:text-white hover:bg-rose-500/80 rounded-lg transition-colors flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
