import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Microscope, History, PackageSearch } from 'lucide-react';
import { cn } from '../utils/cn';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'New Analysis', href: '/analysis', icon: Microscope },
    { name: 'History', href: '/history', icon: History },
];

const secondaryNavigation = [
    { name: 'Plans', href: '/packages', icon: PackageSearch },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex flex-col shrink-0 gap-y-5 overflow-y-auto glass-panel-subtle px-6 pb-4 w-64 border-r-0 rounded-none rounded-r-2xl m-4 mr-0">
            <div className="flex h-16 shrink-0 items-center justify-center pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-cyan flex items-center justify-center p-1">
                        <Microscope className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">NanoScope<span className="text-brand-cyan">AI</span></span>
                </div>
            </div>
            <nav className="flex flex-1 flex-col mt-8">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2">Primary</div>
                        <ul role="list" className="-mx-2 space-y-2">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                                return (
                                    <li key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'bg-gradient-to-r from-white/10 to-transparent text-white border-l-[3px] border-brand-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent hover:translate-x-1',
                                                'group flex items-center gap-x-3 rounded-r-lg p-2.5 text-sm leading-6 font-medium transition-all duration-300 ease-out'
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    isActive ? 'text-brand-cyan' : 'text-gray-400 group-hover:text-white',
                                                    'h-5 w-5 shrink-0 transition-colors duration-200'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                    <li className="mt-auto">
                        <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2">Secondary</div>
                        <ul role="list" className="-mx-2 space-y-2">
                            {secondaryNavigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className="group flex items-center gap-x-3 rounded-r-lg p-2.5 text-sm leading-6 font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 ease-out border-l-[3px] border-transparent hover:translate-x-1"
                                    >
                                        <item.icon
                                            className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-white transition-colors duration-200"
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
