
import React, { useState, useRef, useEffect } from 'react';

export const IconButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  title?: string;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, title }) => {
  const themes = {
    primary: 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10',
    secondary: 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30',
    danger: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
  };

  return (
    <button 
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${themes[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const InfoBadge: React.FC<{ text: string; icon?: React.ReactNode }> = ({ text, icon }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
    {icon || (
      <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300">{text}</span>
  </div>
);

export const Slider: React.FC<{
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, description, value, min, max, onChange }) => (
  <div className="w-full space-y-3">
    <div className="flex justify-between items-end px-1">
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">{label}</span>
        {description && <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">{description}</span>}
      </div>
      <span className="text-[10px] font-mono font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">{value}%</span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
    />
  </div>
);

export const ComparisonSlider: React.FC<{
  before: string;
  after: string;
  className?: string;
}> = ({ before, after, className = "" }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none touch-none overflow-hidden ${className}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        <img src={before} style={{imageRendering:'pixelated', transform:'scale(1.2)'}} className="opacity-30 max-h-full max-w-full object-contain" alt="Original" />
        <div className="absolute top-6 left-6 text-[8px] font-black uppercase tracking-widest text-white/20">Original Base</div>
      </div>
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={after} style={{imageRendering:'pixelated', transform:'scale(1.2)'}} className="max-h-full max-w-full object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]" alt="Synthesized" />
        <div className="absolute top-6 right-6 text-[8px] font-black uppercase tracking-widest text-indigo-500/40">Neural Forge</div>
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] z-20 pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600/90 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 rotate-45">
          <svg className="w-5 h-5 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7l-4 4m0 0l4 4m-4-4h16m-4-4l4 4m0 0l-4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const NeuralLog: React.FC<{ active: boolean }> = ({ active }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const allLogs = [
    "> INITIALIZING NEURAL LINK...",
    "> MAPPING ANATOMICAL MESH...",
    "> INJECTING MATERIAL SHADERS...",
    "> STABILIZING PIXEL GRID...",
    "> CALCULATING LIGHT BOUNCES...",
    "> RESOLVING GENETIC DRIFT...",
    "> COMPILING SPRITE ASSET...",
    "> SYNTHESIS COMPLETE."
  ];

  useEffect(() => {
    if (!active) {
      setLogs([]);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i < allLogs.length) {
        setLogs(prev => [...prev.slice(-4), allLogs[i]]);
        i++;
      }
    }, 800);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute bottom-10 left-6 right-6 z-[110] font-mono text-[9px] text-indigo-400 bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-indigo-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
      {logs.map((log, idx) => (
        <div key={idx} className={`${idx === logs.length - 1 ? 'text-white font-bold opacity-100' : 'opacity-40'}`}>
          {log}
        </div>
      ))}
    </div>
  );
};

export const Tag: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all active:scale-95"
  >
    + {label}
  </button>
);

export const Loader: React.FC<{ message?: string }> = ({ message = 'Sintetizando...' }) => (
  <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
    <div className="relative">
      <div className="w-24 h-24 border-2 border-indigo-500/10 rounded-full animate-ping" />
      <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
    <div className="flex flex-col items-center mt-8 gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white animate-pulse">{message}</span>
      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Wait for neural stabilization</span>
    </div>
  </div>
);
