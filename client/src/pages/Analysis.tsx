import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileImage, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STAGES = [
    'Image Upload',
    'Vision Analysis',
    'Annotated Visualization',
    'Insights Diagram',
    'Data Storage'
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
                <h2 className="text-3xl font-bold text-white tracking-tight">New Analysis</h2>
                <p className="text-gray-400 mt-2">Upload an image to run through the AI vision pipeline.</p>
                {errorMsg && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl shadow-lg flex items-center gap-3">
                        <X className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="text-red-400 text-sm font-medium">{errorMsg}</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {!file ? (
                    <div
                        className={cn(
                            "w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center cursor-pointer bg-zinc-900",
                            dragActive
                                ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
                                : "border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
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
                        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6 shadow-md border border-zinc-700">
                            <UploadCloud className={cn("w-10 h-10 transition-colors", dragActive ? "text-indigo-400" : "text-zinc-500")} />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-100 mb-2">Drag & drop your image here</h3>
                        <p className="text-zinc-400 mb-6">or click to browse from your computer</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">PNG</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">JPEG</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">TIFF</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">BMP</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">WebP</span>
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
                                        <div className="w-full h-1 bg-indigo-400 blur-[2px] shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                                    </div>
                                )}
                            </div>

                            <div className="px-4 flex items-start justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileImage className="w-8 h-8 text-indigo-400 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-zinc-100 truncate w-48">{file.name}</p>
                                        <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {!analyzing && (
                                    <button
                                        onClick={clearFile}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                        title="Remove Image"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {!analyzing && (
                                <div className="px-4 mt-6">
                                    <label htmlFor="microscopeType" className="block text-sm font-medium text-zinc-300 mb-2">Microscope Type</label>
                                    <select
                                        id="microscopeType"
                                        value={microscopeType}
                                        onChange={(e) => setMicroscopeType(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                    >
                                        <option value="Bright Field">Bright Field</option>
                                        <option value="Dark Field">Dark Field</option>
                                        <option value="Phase Contrast">Phase Contrast</option>
                                        <option value="Fluorescence">Fluorescence</option>
                                        <option value="Confocal">Confocal</option>
                                        <option value="SEM (Scanning Electron Microscope)">SEM (Scanning Electron Microscope)</option>
                                        <option value="TEM (Transmission Electron Microscope)">TEM (Transmission Electron Microscope)</option>
                                        <option value="AFM (Atomic Force Microscope)">AFM (Atomic Force Microscope)</option>
                                        <option value="STM (Scanning Tunneling Microscope)">STM (Scanning Tunneling Microscope)</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Analysis Controls Panel */}
                        <div className="glass-panel p-8 h-full flex flex-col justify-center border-zinc-800 shadow-sm">
                            {!analyzing ? (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                                        <Sparkles className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-100 mb-2">Ready for Analysis</h3>
                                    <p className="text-zinc-400 mb-8">
                                        Our AI will process this image to detect objects, measure sizes, and extract scientific insights.
                                    </p>
                                    <button
                                        onClick={startAnalysis}
                                        className="w-full py-4 text-lg font-bold text-zinc-900 bg-white rounded-xl shadow-sm hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 border border-zinc-200 group relative overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <Sparkles className="w-5 h-5 text-indigo-600" />
                                            Analyze with AI
                                        </span>
                                        <div className="absolute inset-0 bg-zinc-200/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full justify-center">
                                    <h3 className="text-xl font-bold text-zinc-100 mb-8 text-center flex items-center justify-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                                        Processing Pipeline
                                    </h3>

                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-700 before:to-transparent">
                                        {STAGES.map((stage, idx) => {
                                            const isComplete = idx < currentStage;
                                            const isCurrent = idx === currentStage;
                                            const isPending = idx > currentStage;

                                            return (
                                                <div key={stage} className={cn("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-all duration-500", isPending ? "opacity-40" : "opacity-100")}>
                                                    <div className={cn(
                                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors duration-300",
                                                        isComplete ? "bg-indigo-500 border-indigo-500" :
                                                            isCurrent ? "bg-zinc-900 border-indigo-500" :
                                                                "bg-zinc-900 border-zinc-700"
                                                    )}>
                                                        {isComplete ? (
                                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                                        ) : isCurrent ? (
                                                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                                        ) : (
                                                            <span className="text-sm font-medium text-zinc-500">{idx + 1}</span>
                                                        )}
                                                    </div>

                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-panel-subtle p-4 border border-zinc-800 flex flex-col shadow-none">
                                                        <h4 className={cn("font-semibold text-sm", isCurrent ? "text-indigo-400" : "text-zinc-300")}>{stage}</h4>
                                                        {isCurrent && <p className="text-xs text-indigo-400/70 mt-1 animate-pulse">Processing...</p>}
                                                        {isComplete && <p className="text-xs text-zinc-500 mt-1">Completed</p>}
                                                        {isPending && <p className="text-xs text-zinc-600 mt-1">Pending</p>}
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
