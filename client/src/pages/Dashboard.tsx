import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Microscope, Activity, Scaling, Images } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const stats = [
    { name: 'Total Analyses', value: '1,429', change: '+12%', description: 'this week', icon: Images, color: 'from-white/20 to-transparent', iconColor: 'text-white' },
    { name: 'Elements Detected', value: '8.4M', change: '+18%', description: 'this week', icon: Activity, color: 'from-white/20 to-transparent', iconColor: 'text-white' },
    { name: 'Avg. Element Size', value: '14.2 nm', change: '-2%', description: 'from average', icon: Scaling, color: 'from-white/20 to-transparent', iconColor: 'text-white' },
    { name: 'Processing Time', value: '1.2s', change: '-15%', description: 'improvement', icon: Microscope, color: 'from-white/20 to-transparent', iconColor: 'text-white' },
];

interface AnalysisRecord {
    id: string;
    image_name: string;
    created_at: string;
    particle_count: number;
    average_size: number;
    image_url: string;
    status: string;
    microscopeType: string;
}

export default function Dashboard() {
    const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([]);
    const [userStatus, setUserStatus] = useState<{ plan: string, analysis_count: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        Promise.all([
            fetch(`${API_URL}/api/analyses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json()),
            fetch(`${API_URL}/api/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())
        ])
            .then(([analysesData, userData]) => {
                if (analysesData.success) {
                    setRecentAnalyses(analysesData.data);
                }
                if (userData.success) {
                    setUserStatus(userData.data);
                }
            })
            .catch(err => console.error("Failed to fetch dashboard data:", err))
            .finally(() => setLoading(false));
    }, [token]);
    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-zinc-700 mt-2 text-lg font-medium">Monitor your image analysis metrics and history.</p>
                    {userStatus && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/20 text-white backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/30 shadow-sm">
                                Plan: {userStatus.plan}
                            </span>
                            {userStatus.plan !== 'research' && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm">
                                    <span className="text-sm font-semibold text-white">
                                        Remaining analyses: {
                                            (userStatus.plan === 'student' ? 1000 : 100) - userStatus.analysis_count
                                        } / {userStatus.plan === 'student' ? 1000 : 100}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <Link
                    to="/analysis"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[var(--color-button-primary)] rounded-lg shadow-md hover:bg-[var(--color-button-hover)] transition-all duration-300 hover:-translate-y-0.5 border border-white/20"
                >
                    <Microscope className="w-5 h-5" />
                    New Analysis
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => (
                    <div key={stat.name} className="glass-panel group flex flex-col justify-between">
                        {/* Background gradient hint */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${stat.color} pointer-events-none`} />
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-semibold text-emerald-50 tracking-wide">{stat.name}</p>
                                <div className={`p-2 rounded-lg bg-white/20 ${stat.iconColor} backdrop-blur-sm shadow-inner`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-4xl font-extrabold tracking-tight mb-2">{stat.value}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${stat.change.startsWith('+') || stat.change.startsWith('-1') ? 'text-white' : 'text-rose-200'}`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-emerald-100/80 font-medium">
                                        {stat.description}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Large faded background icon */}
                        <div className="absolute -bottom-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 transform pointer-events-none">
                            <stat.icon className="w-32 h-32 text-white" />
                        </div>
                    </div>
                ))}
            </div>

            {/* History Table/List */}
            <div className="glass-panel p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/20 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Recent Analyses</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/5 text-[#e2e8f0] uppercase tracking-wider text-xs font-bold border-b border-white/20">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold">Image Preview</th>
                                <th scope="col" className="px-6 py-4 font-bold">Filename</th>
                                <th scope="col" className="px-6 py-4 font-bold">Analysis Date</th>
                                <th scope="col" className="px-6 py-4 font-bold">Microscope</th>
                                <th scope="col" className="px-6 py-4 font-bold">Detected Elements</th>
                                <th scope="col" className="px-6 py-4 font-bold">Avg. Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#e2e8f0] animate-pulse font-medium">Loading analyses from server...</td>
                                </tr>
                            ) : recentAnalyses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 border border-white/20 shadow-inner">
                                                <Images className="w-8 h-8 text-white opacity-90" />
                                            </div>
                                            <p className="text-white font-bold text-lg mb-1">No analyses yet</p>
                                            <p className="text-[#e2e8f0] text-sm mb-6">Upload an image to start your first analysis.</p>
                                            <Link to="/analysis" className="px-5 py-2.5 bg-[var(--color-button-primary)] hover:bg-[var(--color-button-hover)] text-white font-bold rounded-xl shadow-md transition-all text-sm border border-white/30">
                                                Start First Analysis
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : recentAnalyses.map((analysis) => (
                                <tr key={analysis.id} onClick={() => navigate(`/results/${analysis.id}`)} className="hover:bg-white/12 transition-colors cursor-pointer group text-[#e2e8f0]">
                                    <td className="px-6 py-5">
                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/20 shadow-sm bg-white/5">
                                        <img src={`${API_URL}/uploads/${analysis.image_url.split('/').pop()}`} alt="analysis preview" className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-all duration-500" />
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="font-bold text-white group-hover:text-cyan-100 transition-colors text-sm">
                                        {analysis.image_name}
                                    </div>
                                    <div className="text-xs text-[#e2e8f0] opacity-80 mt-1">{analysis.status}</div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{new Date(analysis.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold">{analysis.microscopeType || 'Unknown'}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--color-button-primary)]/20 text-white border border-[var(--color-button-primary)]/40 shadow-sm">
                                        {analysis.particle_count.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold">{analysis.average_size.toFixed(1)} nm</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
