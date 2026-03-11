import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function DashboardLayout() {
    return (
        <div className="flex bg-transparent h-screen w-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden mr-4 my-4">
                <Header />
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden glass-panel-subtle p-8 rounded-2xl border border-white/10 shadow-2xl relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
