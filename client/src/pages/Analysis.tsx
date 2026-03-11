import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileImage, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STAGES = [
    { title: 'Uploading Image', desc: 'Transferring file securely...' },
    { title: 'Analyzing Structures', desc: 'AI detection in progress' },
    { title: 'Generating Visualization', desc: 'Rendering insights & overlay' },
    { title: 'Saving Results', desc: 'Finalizing data storage' }
];

export default function Analysis() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [analyzing, setAnalyzing] = useState(false);
    const [currentStage, setCurrentStage] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [microscopeType, setMicroscopeType] = useState<string>('Bright Field');

    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { token } = useAuth();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (newFile: File) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/tiff', 'image/bmp', 'image/webp', 'image/gif'];
        if (validTypes.includes(newFile.type)) {
            setFile(newFile);
            setPreviewUrl(URL.createObjectURL(newFile));
        } else {
            alert('Please upload a valid image file (PNG, JPEG, TIFF, BMP, WebP, GIF)');
        }
    };

    const clearFile = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const startAnalysis = async () => {
        if (!file) return;
        setAnalyzing(true);
        setCurrentStage(0);
        setErrorMsg(null);

        // Advance stages visually while the API request processes
        const interval = setInterval(() => {
            setCurrentStage(prev => {
                // Don't advance past 'Insights Diagram' (index 3) until API completes
                if (prev < STAGES.length - 2) return prev + 1;
                return prev;
            });
        }, 1500);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('microscopeType', microscopeType);

            const res = await fetch(`${API_URL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await res.json();
            clearInterval(interval);

            if (result.success && result.data?.id) {
                setCurrentStage(STAGES.length);
                setTimeout(() => {
                    navigate(`/results/${result.data.id}`);
                }, 800);
            } else {
                setErrorMsg(result.error || 'Unknown error');
                setAnalyzing(false);
            }
        } catch (error) {
            clearInterval(interval);
            console.error('Upload failed', error);
            setErrorMsg('Upload failed. Is the server running?');
            setAnalyzing(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">New Analysis</h2>
                <p className="text-zinc-700 mt-2 font-medium">Upload an image to run through the AI vision pipeline.</p>
                {errorMsg && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-md flex items-center gap-3">
                        <X className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="text-red-700 text-sm font-bold">{errorMsg}</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {!file ? (
                    <div
                        className={cn(
                            "w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center cursor-pointer",
                            dragActive
                                ? "border-[var(--color-button-primary)] bg-[var(--color-button-primary)]/10 scale-[1.02]"
                                : "border-emerald-200 bg-white hover:bg-emerald-50 shadow-sm hover:shadow-md"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept=".png,.jpg,.jpeg,.tiff,.bmp,.webp,.gif"
                            onChange={handleChange}
                        />
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 shadow-sm border border-emerald-200 text-[var(--color-button-primary)] transition-transform hover:scale-110">
                            <UploadCloud className={cn("w-10 h-10 transition-colors", dragActive ? "text-emerald-600" : "text-[var(--color-button-primary)]")} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Drag & drop your image here</h3>
                        <p className="text-zinc-600 mb-6 font-medium">or click to browse from your computer</p>
                        <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                            <span className="px-2 py-1 rounded-md bg-emerald-100 border border-emerald-200">PNG</span>
                            <span className="px-2 py-1 rounded-md bg-emerald-100 border border-emerald-200">JPEG</span>
                            <span className="px-2 py-1 rounded-md bg-emerald-100 border border-emerald-200">TIFF</span>
                            <span className="px-2 py-1 rounded-md bg-emerald-100 border border-emerald-200">BMP</span>
                            <span className="px-2 py-1 rounded-md bg-emerald-100 border border-emerald-200">WebP</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Image Preview Panel */}
                        <div className="glass-panel p-2 pb-6 flex flex-col relative group overflow-hidden">
                            <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/40 mb-4 relative">
                                <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain" />

                                {/* Scanning overlay effect when analyzing */}
                                {analyzing && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="w-full h-1 bg-white blur-[2px] shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                                    </div>
                                )}
                            </div>

                            <div className="px-4 flex items-start justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileImage className="w-8 h-8 text-white shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate w-48">{file.name}</p>
                                        <p className="text-xs text-emerald-100/90 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {!analyzing && (
                                    <button
                                        onClick={clearFile}
                                        className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-md transition-colors"
                                        title="Remove Image"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {!analyzing && (
                                <div className="px-4 mt-6">
                                    <label htmlFor="microscopeType" className="block text-sm font-bold text-white mb-2">Microscope Type</label>
                                    <select
                                        id="microscopeType"
                                        value={microscopeType}
                                        onChange={(e) => setMicroscopeType(e.target.value)}
                                        className="w-full bg-white/20 border border-white/30 text-white font-semibold rounded-lg px-4 py-2.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                                    >
                                        <option value="Bright Field" className="text-zinc-900">Bright Field</option>
                                        <option value="Dark Field" className="text-zinc-900">Dark Field</option>
                                        <option value="Phase Contrast" className="text-zinc-900">Phase Contrast</option>
                                        <option value="Fluorescence" className="text-zinc-900">Fluorescence</option>
                                        <option value="Confocal" className="text-zinc-900">Confocal</option>
                                        <option value="SEM (Scanning Electron Microscope)" className="text-zinc-900">SEM (Scanning Electron Microscope)</option>
                                        <option value="TEM (Transmission Electron Microscope)" className="text-zinc-900">TEM (Transmission Electron Microscope)</option>
                                        <option value="AFM (Atomic Force Microscope)" className="text-zinc-900">AFM (Atomic Force Microscope)</option>
                                        <option value="STM (Scanning Tunneling Microscope)" className="text-zinc-900">STM (Scanning Tunneling Microscope)</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Analysis Controls Panel */}
                        <div className="glass-panel p-8 h-full flex flex-col justify-center border-white/20 shadow-xl">
                            {!analyzing ? (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 border border-white/30 shadow-inner">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-white mb-2">Ready for Analysis</h3>
                                    <p className="text-emerald-50 mb-8 font-medium">
                                        Our AI will process this image to detect objects, measure sizes, and extract scientific insights.
                                    </p>
                                    <button
                                        onClick={startAnalysis}
                                        className="w-full py-4 text-lg font-extrabold text-white bg-[var(--color-button-primary)] rounded-xl shadow-lg hover:shadow-xl hover:bg-[var(--color-button-hover)] transition-all duration-300 hover:-translate-y-0.5 border border-white/20 group relative overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <Sparkles className="w-5 h-5 text-white" />
                                            Analyze with AI
                                        </span>
                                        <div className="absolute inset-0 bg-emerald-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full justify-center">
                                    <h3 className="text-xl font-extrabold text-white mb-8 text-center flex items-center justify-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                                        Processing Pipeline
                                    </h3>

                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/40 before:to-transparent">
                                        {STAGES.map((stage, idx) => {
                                            const isComplete = idx < currentStage;
                                            const isCurrent = idx === currentStage;
                                            const isPending = idx > currentStage;

                                            return (
                                                <div key={stage.title} className={cn("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-all duration-500", isPending ? "opacity-50" : "opacity-100")}>
                                                    <div className={cn(
                                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10 transition-all duration-300",
                                                        isComplete ? "bg-white border-white" :
                                                            isCurrent ? "bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110" :
                                                                "bg-white/10 border-white/30 backdrop-blur-sm"
                                                    )}>
                                                        {isComplete ? (
                                                            <CheckCircle2 className="w-6 h-6 text-[var(--color-button-primary)]" />
                                                        ) : isCurrent ? (
                                                            <div className="relative flex items-center justify-center">
                                                                <Loader2 className="w-5 h-5 text-[var(--color-button-primary)] animate-spin" />
                                                                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-bold text-emerald-100">{idx + 1}</span>
                                                        )}
                                                    </div>

                                                    <div className={cn("w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-panel p-4 pb-3 border transition-all duration-500", isCurrent ? "border-white/60 bg-white/20 shadow-xl translate-x-1 md:group-odd:-translate-x-1 md:group-even:translate-x-1" : "border-white/10 shadow-sm")}>
                                                        <h4 className={cn("font-bold text-sm", isCurrent ? "text-white" : "text-emerald-50")}>{stage.title}</h4>
                                                        {isCurrent && <p className="text-xs text-emerald-100 mt-1 font-semibold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" /> {stage.desc}</p>}
                                                        {isComplete && <p className="text-xs text-white/90 mt-1 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</p>}
                                                        {isPending && <p className="text-xs text-emerald-100/60 mt-1 font-medium">Pending...</p>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
