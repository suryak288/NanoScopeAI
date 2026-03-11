import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shadow-md border border-white/20 backdrop-blur-md">
                    <HistoryIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Analysis History</h2>
                    <p className="text-zinc-700 text-lg font-medium mt-1">Review your previously analyzed samples and reports.</p>
                </div>
            </div>

            <div className="glass-panel p-0 flex-1 flex flex-col overflow-hidden">
                <div className="overflow-x-auto flex-1 h-full">
                    <table className="w-full text-left text-sm whitespace-nowrap h-full block">
                        <thead className="bg-white/5 text-[#e2e8f0] uppercase tracking-wider text-xs font-bold sticky top-0 z-10 w-full table table-fixed border-b border-white/20">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold w-32">Image Preview</th>
                                <th scope="col" className="px-6 py-4 font-bold w-1/3">Filename</th>
                                <th scope="col" className="px-6 py-4 font-bold w-1/4">Analysis Date</th>
                                <th scope="col" className="px-6 py-4 font-bold w-32">Microscope</th>
                                <th scope="col" className="px-6 py-4 font-bold w-1/6">Elements</th>
                                <th scope="col" className="px-6 py-4 font-bold w-1/6">Avg. Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 block overflow-y-auto w-full h-full" style={{ height: "auto" }}>
                            {loading ? (
                                <tr className="table table-fixed w-full">
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#e2e8f0] animate-pulse font-bold">Loading analyses from server...</td>
                                </tr>
                            ) : analyses.length === 0 ? (
                                <tr className="table table-fixed w-full">
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20 shadow-inner">
                                                <HistoryIcon className="w-10 h-10 text-white opacity-90" />
                                            </div>
                                            <p className="text-white font-extrabold text-2xl mb-2">No analyses yet</p>
                                            <p className="text-[#e2e8f0] text-base mb-8 font-medium">Upload an image to start your first analysis.</p>
                                            <button onClick={() => navigate('/analysis')} className="px-6 py-3 bg-[var(--color-button-primary)] hover:bg-[var(--color-button-hover)] text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border border-white/30">
                                                Start First Analysis
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : analyses.map((analysis) => (
                                <tr key={analysis.id} onClick={() => navigate(`/results/${analysis.id}`)} className="table table-fixed w-full border-b border-transparent hover:border-white/20 hover:bg-white/12 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 hover:shadow-lg relative z-0 hover:z-10 text-[#e2e8f0]">
                                    <td className="px-6 py-5 w-32">
                                        <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-white/20 group-hover:border-white transition-colors bg-white/5 shadow-sm">
                                            <img src={`${API_URL}/uploads/${analysis.image_url.split('/').pop()}`} alt="analysis preview" className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-all duration-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 w-1/3 truncate">
                                        <div className="font-bold text-white group-hover:text-cyan-100 transition-colors text-base truncate">
                                            {analysis.image_name}
                                        </div>
                                        <div className="text-xs text-[#e2e8f0] opacity-80 mt-1 font-medium">{analysis.status}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium w-1/4">{new Date(analysis.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold w-32 truncate">{analysis.microscopeType || 'Unknown'}</td>
                                    <td className="px-6 py-4 w-1/6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--color-button-primary)]/20 text-white border border-[var(--color-button-primary)]/40 shadow-sm">
                                            {analysis.particle_count.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold w-1/6">{analysis.average_size.toFixed(1)} nm</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
