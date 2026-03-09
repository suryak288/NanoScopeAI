import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import {
    CheckCircle2, Download, RefreshCcw, Maximize,
    Layers, ScanFace, Activity, Shapes, Target, Beaker, Scaling, Loader2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../utils/cn';

const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#e879f9'];

const TABS = ['Original Image', 'AI Annotated', 'Insights Diagram'];

export default function Results() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(1); // Default to Annotated
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (!id || !token) return;
        fetch(`${API_URL}/api/analysis/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAnalysis(data.data);
                }
            })
            .catch(err => console.error("Failed to fetch analysis:", err))
            .finally(() => setLoading(false));
    }, [id, token]);

    if (loading) {
        return <div className="text-white text-center mt-20 animate-pulse">Loading analysis...</div>;
    }

    if (!analysis) {
        return <div className="text-white text-center mt-20">Analysis not found.</div>;
    }

    const handleExport = async () => {
        if (!id || !token) return;
        setExporting(true);
        try {
            const res = await fetch(`${API_URL}/api/analysis/${id}/export`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NanoScope_Report_${analysis.image_name.split('.')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            {/* Success Banner */}
            <div className="glass-panel border-emerald-500/20 bg-emerald-500/5 mb-10 p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-5">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Analysis Complete</h2>
                        <p className="text-emerald-300/80 text-base mt-1">Successfully processed "{analysis.image_name}" on {new Date(analysis.created_at).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? 'Exporting...' : 'Export Report'}
                    </button>
                    <Link to="/analysis" className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-bold rounded-lg transition-colors shadow-sm border border-zinc-200">
                        <RefreshCcw className="w-4 h-4" /> New Analysis
                    </Link>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">

                {/* Left Column: Images & Tabs (70%) */}
                <div className="w-full xl:w-[70%] flex flex-col gap-6">
                    <div className="glass-panel p-6">
                        <div className="flex space-x-1 mb-6 glass-panel-subtle p-1 rounded-xl w-fit">
                            {TABS.map((tab, idx) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(idx)}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                        activeTab === idx
                                            ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="relative aspect-[16/10] xl:aspect-[4/3] rounded-2xl shadow-xl overflow-hidden bg-zinc-950 border border-zinc-800 group hover:border-indigo-500/40 transition-colors duration-500">
                            {/* Mock Images based on active tab */}
                            {activeTab === 0 && (
                                <img src={analysis.image_url} alt="Original" className="w-full h-full object-contain p-2" />
                            )}
                            {activeTab === 1 && (
                                <div className="relative w-full h-full flex items-center justify-center p-2">
                                    <img src={analysis.annotated_image_url || analysis.image_url} alt="Annotated" className="max-w-full max-h-full object-contain opacity-80" />
                                    {/* Mock Annotations overlay */}
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxjaXJjbGUgY3g9IjMwJSIgY3k9IjQwJSIgcj0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA2YjZkNCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iNjAlIiBjeT0iMjAlIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTEiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] bg-cover opacity-60 mix-blend-screen" />
                                    <div className="absolute top-1/4 left-1/3 w-8 h-8 border-2 border-sky-400 rounded-full animate-ping opacity-75"></div>
                                    <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border-2 border-violet-500 rounded-full animate-pulse opacity-75"></div>
                                </div>
                            )}
                            {activeTab === 2 && (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-500/5">
                                    <div className="text-center">
                                        <Layers className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
                                        <p className="text-zinc-300 font-medium">Insights Diagram Generated via API</p>
                                    </div>
                                </div>
                            )}

                            <button className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Beaker className="w-5 h-5 text-indigo-400" />
                            AI Scientific Analysis Notes
                        </h3>
                        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                            <p>{analysis.analysis_notes || "Basic visual analysis completed for the provided micrograph, capturing key characteristics of the nanoscale entities."}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Metrics (30%) */}
                <div className="w-full xl:w-[30%] flex flex-col gap-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-5 h-full content-start">
                        <div className="glass-panel p-6 hover:-translate-y-0.5 transition-transform border-zinc-800 hover:border-zinc-700 duration-300 shadow-none">
                            <div className="text-zinc-500 mb-2 flex items-center gap-2">
                                <Target className="w-5 h-5 text-sky-400 shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Elements</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold text-zinc-100 tracking-tight">{analysis.particle_count.toLocaleString()}</p>
                        </div>
                        <div className="glass-panel p-6 hover:-translate-y-0.5 transition-transform border-zinc-800 hover:border-zinc-700 duration-300 shadow-none">
                            <div className="text-zinc-500 mb-2 flex items-center gap-2">
                                <Scaling className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Avg Size</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold text-zinc-100 tracking-tight">{analysis.average_size} nm</p>
                        </div>
                        <div className="glass-panel p-6 hover:-translate-y-0.5 transition-transform border-zinc-800 hover:border-zinc-700 duration-300 shadow-none">
                            <div className="text-zinc-500 mb-2 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-violet-400 shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Std Dev</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold text-zinc-100 tracking-tight">±{analysis.standard_deviation} nm</p>
                        </div>
                        <div className="glass-panel p-6 hover:-translate-y-0.5 transition-transform border-zinc-800 hover:border-zinc-700 duration-300 shadow-none">
                            <div className="text-zinc-500 mb-2 flex items-center gap-2">
                                <ScanFace className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Uniformity</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold text-zinc-100 tracking-tight">{analysis.uniformity_index}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Section: Full Width Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Size Distribution Chart */}
                <div className="glass-panel p-8 shadow-none border-zinc-800">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-sky-400" />
                        Size Distribution
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysis.size_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                                <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="url(#colorUv)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.9} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shape Distribution Chart */}
                <div className="glass-panel p-8 shadow-none border-zinc-800">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Shapes className="w-5 h-5 text-violet-400" />
                        Morphology Analysis
                    </h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analysis.shape_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {analysis.shape_distribution.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {analysis.shape_distribution.map((entry: any, index: number) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name} ({entry.value}%)
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}
