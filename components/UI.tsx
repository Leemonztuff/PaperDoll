
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
    primary: 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white shadow-lg',
    secondary: 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30',
    danger: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 active:bg-red-500 active:text-white',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/10'
  };

  return (
    <button 
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed ${themes[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const InfoBadge: React.FC<{ text: string; icon?: React.ReactNode; color?: string }> = ({ text, icon, color = "text-indigo-400" }) => (
  <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
    {icon || (
      <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    <span className={`text-[8px] font-black uppercase tracking-widest ${color}`}>{text}</span>
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
  <div className="w-full space-y-4">
    <div className="flex justify-between items-end px-1">
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">{label}</span>
        {description && <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">{description}</span>}
      </div>
      <span className="text-[10px] font-mono font-bold text-white bg-indigo-600/20 px-3 py-1 rounded-lg border border-indigo-500/30 shadow-lg">{value}%</span>
    </div>
    <div className="relative group flex items-center">
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all shadow-inner"
      />
    </div>
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
      className={`relative w-full h-full select-none touch-none overflow-hidden rounded-[4rem] border border-white/5 shadow-3xl bg-zinc-900 ${className}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        <img src={before} className="opacity-15 max-h-full max-w-full object-contain pixelated scale-110" alt="DNA Source" />
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-zinc-900/60 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-white/30 border border-white/5">GENETIC BASE</div>
      </div>
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={after} className="max-h-full max-w-full object-contain drop-shadow-[0_0_80px_rgba(99,102,241,0.5)] pixelated scale-110" alt="Synthesized Gear" />
        <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-indigo-600/60 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-white border border-white/10 shadow-2xl">EVOLUTION ACTIVE</div>
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,1)] z-20 pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/95 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 rotate-45 shadow-2xl">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    "> CONNECTING TO NEURAL HUB...",
    "> EXTRACTING DNA MASK...",
    "> SYNCING VOXEL GRID...",
    "> PROJECTING ASSET GEOMETRY...",
    "> BAKING MATERIAL TEXTURES...",
    "> PIXELGUARD VALIDATION...",
    "> ASSET STABILIZED."
  ];

  useEffect(() => {
    if (!active) {
      setLogs([]);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i < allLogs.length) {
        setLogs(prev => [...prev.slice(-3), allLogs[i]]);
        i++;
      }
    }, 900);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute bottom-8 left-8 right-8 z-[110] font-mono text-[8px] text-indigo-400/80 bg-zinc-950/95 backdrop-blur-3xl p-5 rounded-3xl border border-indigo-500/20 shadow-3xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        {logs.map((log, idx) => (
          <div key={idx} className={`${idx === logs.length - 1 ? 'text-white font-bold' : 'opacity-25'}`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Tag: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 hover:shadow-indigo-500/20 transition-all active:scale-95"
  >
    + {label}
  </button>
);

export const Loader: React.FC<{ message?: string; subMessage?: string }> = ({ message = 'SYNTHESIZING', subMessage = 'NEURAL GRID CALIBRATION' }) => (
  <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-700">
    <div className="relative mb-12">
      <div className="w-48 h-48 border-[2px] border-indigo-500/5 rounded-full animate-ping opacity-20" />
      <div className="absolute inset-0 w-48 h-48 border-[4px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_40px_rgba(99,102,241,0.1)]" />
      <div className="absolute inset-4 border border-indigo-500/20 rounded-full flex items-center justify-center bg-zinc-900/40">
         <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,1)]" />
      </div>
    </div>
    <div className="flex flex-col items-center gap-6 text-center px-12 reveal-view">
      <div className="space-y-2">
        <span className="text-[16px] font-black uppercase tracking-[0.8em] text-white block animate-pulse">{message}</span>
        <span className="text-[9px] font-bold text-indigo-400/40 uppercase tracking-[0.4em] block">{subMessage}</span>
      </div>
      <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="flex gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="w-2.5 h-2.5 bg-indigo-500/30 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />
        ))}
      </div>
    </div>
  </div>
);
