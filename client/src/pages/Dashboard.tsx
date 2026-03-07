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
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Dashboard Overview</h2>
                    <p className="text-gray-400 mt-2 text-lg">Monitor your image analysis metrics and history.</p>
                    {userStatus && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-semibold uppercase tracking-wider border border-white/20">
                                Plan: {userStatus.plan}
                            </span>
                            {userStatus.plan !== 'research' && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20">
                                    <span className="text-sm font-medium text-brand-indigo">
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
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 hover:-translate-y-0.5"
                >
                    <Microscope className="w-5 h-5" />
                    New Analysis
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {stats.map((stat) => (
                    <div key={stat.name} className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-cyan/20 transition-all duration-300 border border-white/5 hover:border-white/10">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 group-hover:scale-110 transform">
                            <stat.icon className="w-20 h-20 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">{stat.name}</p>
                        <div className="flex items-baseline gap-3">
                            <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
                            <span className={stat.change.startsWith('+') ? 'text-green-400 text-sm font-semibold' : 'text-cyan-400 text-sm font-semibold'}>
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
                                <tr key={analysis.id} onClick={() => navigate(`/results/${analysis.id}`)} className="hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                    <td className="px-6 py-5">
                                        <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-white/10 group-hover:border-brand-cyan/50 transition-colors bg-black/50">
                                            <img src={analysis.image_url} alt="" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-semibold text-gray-200 group-hover:text-brand-cyan transition-colors text-base">
                                            {analysis.image_name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{analysis.status}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{new Date(analysis.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
                                            {analysis.particle_count.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{analysis.average_size.toFixed(1)} nm</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
