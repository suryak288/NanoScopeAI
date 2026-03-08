import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Microscope, Activity, Scaling, Images } from 'lucide-react';

const stats = [
    { name: 'Total Analyses', value: '1,429', change: '+12%', icon: Images },
    { name: 'Elements Detected', value: '8.4M', change: '+18%', icon: Activity },
    { name: 'Avg. Element Size', value: '14.2 nm', change: '-2%', icon: Scaling },
    { name: 'Processing Time', value: '1.2s', change: '-15%', icon: Microscope },
];

interface AnalysisRecord {
    id: string;
    image_name: string;
    created_at: string;
    particle_count: number;
    average_size: number;
    image_url: string;
    status: string;
}

export default function Dashboard() {
    const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([]);
    const [userStatus, setUserStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        Promise.all([
            fetch('http://localhost:3001/api/analyses', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json()),
            fetch('http://localhost:3001/api/user/me', {
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
                    <h2 className="text-4xl font-extrabold text-zinc-100 tracking-tight">Dashboard Overview</h2>
                    <p className="text-zinc-400 mt-2 text-lg">Monitor your image analysis metrics and history.</p>
                    {userStatus && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider border border-zinc-700">
                                Plan: {userStatus.plan}
                            </span>
                            {userStatus.plan !== 'research' && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <span className="text-sm font-medium text-indigo-400">
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
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-zinc-900 bg-white rounded-lg shadow-sm hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5"
                >
                    <Microscope className="w-5 h-5" />
                    New Analysis
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => (
                    <div key={stat.name} className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg hover:border-zinc-700 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 group-hover:scale-110 transform">
                            <stat.icon className="w-24 h-24 text-zinc-100" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">{stat.name}</p>
                        <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-bold text-zinc-100 tracking-tight">{stat.value}</p>
                            <span className={stat.change.startsWith('+') ? 'text-emerald-400 text-sm font-medium' : 'text-zinc-400 text-sm font-medium'}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Table/List */}
            <div className="glass-panel overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Analyses</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/5 text-gray-400 uppercase tracking-wider text-xs">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Image Preview</th>
                                <th scope="col" className="px-6 py-4 font-medium">Filename</th>
                                <th scope="col" className="px-6 py-4 font-medium">Analysis Date</th>
                                <th scope="col" className="px-6 py-4 font-medium">Detected Elements</th>
                                <th scope="col" className="px-6 py-4 font-medium">Avg. Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-brand-cyan animate-pulse font-medium">Loading analyses from server...</td>
                                </tr>
                            ) : recentAnalyses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Images className="w-8 h-8 text-gray-600 mb-3" />
                                            <p className="text-gray-400">You haven't analyzed any images yet.</p>
                                            <Link to="/analysis" className="mt-4 text-brand-cyan hover:text-cyan-300 text-sm font-medium transition-colors">Start your first analysis &rarr;</Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : recentAnalyses.map((analysis) => (
                                <tr key={analysis.id} onClick={() => navigate(`/results/${analysis.id}`)} className="hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                                    <td className="px-6 py-5">
                                        <div className="relative h-12 w-12 rounded-md overflow-hidden border border-zinc-800 group-hover:border-indigo-500/50 transition-colors bg-zinc-950">
                                            <img src={analysis.image_url} alt="" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-semibold text-zinc-300 group-hover:text-indigo-400 transition-colors text-sm">
                                            {analysis.image_name}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">{analysis.status}</div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 text-sm">{new Date(analysis.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            {analysis.particle_count.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300 font-medium">{analysis.average_size.toFixed(1)} nm</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
