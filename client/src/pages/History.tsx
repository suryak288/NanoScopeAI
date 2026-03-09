import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { History as HistoryIcon } from 'lucide-react';

interface AnalysisRecord {
    id: string;
    image_name: string;
    created_at: string;
    particle_count: number;
    average_size: number;
    image_url: string;
    status: string;
}

export default function History() {
    const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        fetch(`${API_URL}/api/analyses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAnalyses(data.data);
                }
            })
            .catch(err => console.error("Failed to fetch analyses:", err))
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8 shrink-0">
                <div className="h-12 w-12 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md">
                    <HistoryIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Analysis History</h2>
                    <p className="text-zinc-400 text-sm mt-1">Review your previously analyzed samples and reports.</p>
                </div>
            </div>

            <div className="glass-panel flex-1 flex flex-col overflow-hidden">
                <div className="overflow-x-auto flex-1 h-full">
                    <table className="w-full text-left text-sm whitespace-nowrap h-full block">
                        <thead className="bg-white/5 text-gray-400 uppercase tracking-wider text-xs sticky top-0 z-10 w-full table table-fixed">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium w-32">Image Preview</th>
                                <th scope="col" className="px-6 py-4 font-medium w-1/3">Filename</th>
                                <th scope="col" className="px-6 py-4 font-medium w-1/4">Analysis Date</th>
                                <th scope="col" className="px-6 py-4 font-medium w-1/6">Detected Elements</th>
                                <th scope="col" className="px-6 py-4 font-medium w-1/6">Avg. Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 block overflow-y-auto w-full h-full" style={{ height: "auto" }}>
                            {loading ? (
                                <tr className="table table-fixed w-full">
                                    <td colSpan={5} className="px-6 py-12 text-center text-brand-cyan animate-pulse font-medium">Loading analyses from server...</td>
                                </tr>
                            ) : analyses.length === 0 ? (
                                <tr className="table table-fixed w-full">
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                                                <HistoryIcon className="w-8 h-8 text-zinc-500" />
                                            </div>
                                            <p className="text-zinc-300 font-medium text-lg">No analysis history found</p>
                                            <p className="text-zinc-500 text-sm mt-1 mb-6 max-w-sm">Record your first microscopic sample through the imaging pipeline to see it appear here.</p>
                                            <button onClick={() => navigate('/analysis')} className="px-6 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-lg shadow-sm transition-all border border-zinc-200">
                                                Start New Analysis
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : analyses.map((analysis) => (
                                <tr key={analysis.id} onClick={() => navigate(`/results/${analysis.id}`)} className="table table-fixed w-full border-b border-transparent hover:border-indigo-500/30 hover:bg-zinc-800/30 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 hover:shadow-lg relative z-0 hover:z-10">
                                    <td className="px-6 py-5 w-32">
                                        <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-zinc-800 group-hover:border-indigo-500/50 transition-colors bg-zinc-950">
                                            <img src={analysis.image_url} alt="" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 w-1/3 truncate">
                                        <div className="font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors text-base truncate">
                                            {analysis.image_name}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">{analysis.status}</div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 w-1/4">{new Date(analysis.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 w-1/6">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            {analysis.particle_count.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300 font-medium w-1/6">{analysis.average_size.toFixed(1)} nm</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
