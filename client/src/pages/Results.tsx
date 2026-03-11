/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle2, Download, RefreshCcw, Maximize,
    Layers, ScanFace, Activity, Shapes, Target, Beaker, Scaling, Loader2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const COLORS = ['#ffffff', '#d1fae5', '#6ee7b7', '#10b981'];

const TABS = ['Original Image', 'AI Annotated', 'Comparison', 'Insights Diagram'];

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
            <div className="glass-panel border-white/20 mb-10 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Analysis Complete</h2>
                        <p className="text-emerald-100 text-base mt-1 font-medium">Successfully processed "{analysis.image_name}" on {new Date(analysis.created_at).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors border border-white/30 shadow-sm"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? 'Exporting...' : 'Export Report'}
                    </button>
                    <Link to="/analysis" className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-button-primary)] hover:bg-[var(--color-button-hover)] text-white text-sm font-extrabold rounded-lg transition-colors shadow-md border border-white/50">
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
                                        "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
                                        activeTab === idx
                                            ? "bg-white text-[var(--color-button-primary)] shadow-md border border-white/20"
                                            : "text-emerald-100 hover:text-white hover:bg-white/20"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div id="image-viewer-container" className="relative aspect-[16/10] xl:aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden bg-black/60 border border-white/20 group hover:border-white/50 transition-colors duration-500 backdrop-blur-sm">
                            {/* Mock Images based on active tab */}
                            {activeTab === 0 && (
                                <TransformWrapper centerOnInit={true} minScale={0.5} maxScale={4}>
                                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <img src={`${API_URL}/uploads/${(analysis.image_url || '').split('/').pop()}`} alt="analysis preview" className="w-full h-full object-contain p-2" />
                                    </TransformComponent>
                                </TransformWrapper>
                            )}
                            {activeTab === 1 && (
                                <TransformWrapper centerOnInit={true} minScale={0.5} maxScale={4}>
                                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <div className="relative w-full h-full flex items-center justify-center p-2">
                                            <img src={`${API_URL}/uploads/${(analysis.annotated_image_url || analysis.image_url || '').split('/').pop()}`} alt="analysis preview" className="max-w-full max-h-full object-contain opacity-80" />
                                            {/* Mock Annotations overlay */}
                                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxjaXJjbGUgY3g9IjMwJSIgY3k9IjQwJSIgcj0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA2YjZkNCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iNjAlIiBjeT0iMjAlIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTEiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] bg-cover opacity-60 mix-blend-screen" />
                                            <div className="absolute top-1/4 left-1/3 w-8 h-8 border-2 border-sky-400 rounded-full animate-ping opacity-75"></div>
                                            <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border-2 border-violet-500 rounded-full animate-pulse opacity-75"></div>
                                        </div>
                                    </TransformComponent>
                                </TransformWrapper>
                            )}
                            {activeTab === 2 && (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-950 p-2">
                                    <ReactCompareSlider
                                        itemOne={<ReactCompareSliderImage src={`${API_URL}/uploads/${(analysis.image_url || '').split('/').pop()}`} alt="Original Image" style={{ objectFit: 'contain' }} />}
                                        itemTwo={<ReactCompareSliderImage src={`${API_URL}/uploads/${(analysis.annotated_image_url || analysis.image_url || '').split('/').pop()}`} alt="Annotated Image" style={{ objectFit: 'contain' }} />}
                                        className="w-full h-full rounded-lg"
                                    />
                                </div>
                            )}
                            {activeTab === 3 && (
                                <TransformWrapper centerOnInit={true} minScale={0.5} maxScale={4}>
                                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                                            <div className="text-center">
                                                <Layers className="w-16 h-16 text-white mx-auto mb-4 opacity-80" />
                                                <p className="text-white font-bold tracking-wide">Insights Diagram Generated via API</p>
                                            </div>
                                        </div>
                                    </TransformComponent>
                                </TransformWrapper>
                            )}

                            <button onClick={() => {
                                const elem = document.getElementById("image-viewer-container");
                                if (!document.fullscreenElement) {
                                    elem?.requestFullscreen().catch(err => console.error(err));
                                } else {
                                    document.exitFullscreen();
                                }
                            }} className="absolute bottom-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="glass-panel p-6 shadow-xl">
                        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                            <Beaker className="w-5 h-5 text-white" />
                            AI Scientific Analysis Notes
                        </h3>

                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/20 border border-white/30 text-white text-sm font-bold shadow-sm">
                            <Shapes className="w-4 h-4" />
                            Microscope Type: {analysis.microscopeType || 'Unknown'}
                        </div>

                        <div className="space-y-4 text-sm text-emerald-50 font-medium leading-relaxed">
                            <p>{analysis.analysis_notes || "Basic visual analysis completed for the provided micrograph, capturing key characteristics of the nanoscale entities."}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Metrics (30%) */}
                <div className="w-full xl:w-[30%] flex flex-col gap-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-5 h-full content-start">
                        <div className="glass-panel group">
                            <div className="text-emerald-50 mb-2 flex items-center gap-2">
                                <Target className="w-5 h-5 text-white shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Elements</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold tracking-tight">{analysis.particle_count.toLocaleString()}</p>
                        </div>
                        <div className="glass-panel group">
                            <div className="text-emerald-50 mb-2 flex items-center gap-2">
                                <Scaling className="w-5 h-5 text-white shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Avg Size</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold tracking-tight">{analysis.average_size} <span className="text-lg opacity-70">nm</span></p>
                        </div>
                        <div className="glass-panel group">
                            <div className="text-emerald-50 mb-2 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-white shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Std Dev (Noise)</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold tracking-tight">±{analysis.standard_deviation} <span className="text-lg opacity-70">nm</span></p>
                        </div>
                        <div className="glass-panel group">
                            <div className="text-emerald-50 mb-2 flex items-center gap-2">
                                <ScanFace className="w-5 h-5 text-white shrink-0" />
                                <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider truncate">Uniformity</span>
                            </div>
                            <p className="text-2xl 2xl:text-3xl font-extrabold tracking-tight">{analysis.uniformity_index}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Section: Full Width Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Size Distribution Chart */}
                <div className="glass-panel group shadow-xl border-white/20 relative transition-all duration-300 hover:border-white/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                    <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2 relative z-10">
                        <BarChart className="w-5 h-5 text-white" />
                        Size Distribution
                    </h3>
                    <div className="h-64 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysis.size_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.2)" vertical={false} opacity={0.5} />
                                <XAxis dataKey="range" stroke="rgba(255,255,255,0.7)" fontSize={12} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                                <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} tickLine={false} axisLine={false} dx={-10} fontWeight={600} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '12px', color: '#064e3b', padding: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                                    itemStyle={{ color: '#064e3b', fontWeight: 800 }}
                                    animationDuration={300}
                                />
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <Bar dataKey="count" fill="url(#colorUv)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shape Distribution Chart */}
                <div className="glass-panel group shadow-xl border-white/20 relative transition-all duration-300 hover:border-white/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                    <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2 relative z-10">
                        <Shapes className="w-5 h-5 text-white" />
                        Morphology Analysis
                    </h3>
                    <div className="h-64 w-full flex items-center justify-center relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {COLORS.map((color, index) => (
                                        <linearGradient key={`grad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                                            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={analysis.shape_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={105}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    animationDuration={1500}
                                >
                                    {analysis.shape_distribution.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={`url(#pieGrad-${index % COLORS.length})`} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '12px', padding: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                                    itemStyle={{ color: '#064e3b', fontWeight: 800 }}
                                    animationDuration={300}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {analysis.shape_distribution.map((entry: any, index: number) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm text-emerald-50 font-bold">
                                <span className="w-3 h-3 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name} ({entry.value}%)
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}
