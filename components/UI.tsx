import React, { useState, useRef, useEffect } from "react";

// --- DESIGN SYSTEM COMPONENTS ---

export const MicroLabel: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
}> = ({ children, className = "", color = "text-slate-500" }) => (
  <span
    className={`text-[9px] font-bold uppercase tracking-widest ${color} ${className}`}
  >
    {children}
  </span>
);

export const SectionTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
}> = ({ children, className = "", color = "text-indigo-400" }) => (
  <h4
    className={`text-[10px] font-bold uppercase tracking-[0.3em] ${color} ${className}`}
  >
    {children}
  </h4>
);

export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <section
    className={`bg-graphite-900/50 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md ${className}`}
  >
    {children}
  </section>
);

export const Tabs: React.FC<{
  options: { id: string | number; label: string }[];
  activeId: string | number;
  onChange: (id: any) => void;
  className?: string;
}> = ({ options, activeId, onChange, className = "" }) => (
  <div
    className={`flex items-center gap-1 bg-graphite-900 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar ${className}`}
  >
    {options.map((opt) => (
      <button
        key={opt.id}
        onClick={() => onChange(opt.id)}
        className={`shrink-0 px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeId === opt.id ? "bg-graphite-700 text-white shadow-sm border border-white/10" : "text-slate-500 hover:text-white hover:bg-graphite-800 border border-transparent"}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const TextArea: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className = "" }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full bg-graphite-900 border border-white/5 rounded-xl p-4 text-sm text-slate-200 focus:border-indigo-500/50 focus:bg-graphite-800 outline-none transition-all resize-none placeholder:text-slate-600 shadow-inner font-mono ${className}`}
  />
);

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "glass" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
}> = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}) => {
  const base =
    "flex items-center justify-center gap-2 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/50 py-3 md:py-4",
    secondary:
      "bg-graphite-800 hover:bg-graphite-700 text-white border border-white/10 py-3 md:py-4",
    glass:
      "bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 md:py-4 backdrop-blur-md",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5 py-2 md:py-3",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 md:py-4",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- EXISTING COMPONENTS ---

export const IconButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  className?: string;
  disabled?: boolean;
  title?: string;
}> = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  title,
}) => {
  const themes = {
    primary:
      "bg-graphite-800 border-white/10 text-slate-300 hover:bg-graphite-700 hover:text-white shadow-sm",
    secondary:
      "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500",
    danger:
      "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 active:bg-red-500 active:text-white",
    success:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/10",
    ghost:
      "border-transparent text-slate-400 hover:text-white hover:bg-white/5",
  };

  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${themes[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const InfoBadge: React.FC<{
  text: string;
  icon?: React.ReactNode;
  color?: string;
}> = ({ text, icon, color = "text-indigo-400" }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-graphite-900/80 backdrop-blur-md border border-white/10 rounded-lg shadow-sm">
    {icon || (
      <svg
        className="w-3 h-3 text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )}
    <MicroLabel color={color}>{text}</MicroLabel>
  </div>
);

export const Slider: React.FC<{
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}> = ({ label, description, value, min, max, unit = "%", onChange }) => (
  <div className="w-full space-y-3">
    <div className="flex justify-between items-end px-1">
      <div className="flex flex-col gap-1">
        <SectionTitle>{label}</SectionTitle>
        {description && <MicroLabel>{description}</MicroLabel>}
      </div>
      <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
        {value}
        {unit}
      </span>
    </div>
    <div className="relative group flex items-center h-4">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all z-10"
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
    const x =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none touch-none overflow-hidden rounded-[4rem] border border-white/5 shadow-3xl bg-graphite-900 ${className}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        <img
          src={before}
          className="opacity-15 max-h-full max-w-full object-contain pixelated scale-110"
          alt="DNA Source"
        />
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-graphite-900/60 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/5">
          <MicroLabel color="text-white/30">GENETIC BASE</MicroLabel>
        </div>
      </div>
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={after}
          className="max-h-full max-w-full object-contain drop-shadow-[0_0_80px_rgba(99,102,241,0.5)] pixelated scale-110"
          alt="Synthesized Gear"
        />
        <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-indigo-600/60 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 shadow-2xl">
          <MicroLabel color="text-white">EVOLUTION ACTIVE</MicroLabel>
        </div>
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,1)] z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/95 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 rotate-45 shadow-2xl">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white -rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M8 7l-4 4m0 0l4 4m-4-4h16m-4-4l4 4m0 0l-4 4"
            />
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
    "> ASSET STABILIZED.",
  ];

  useEffect(() => {
    if (!active) {
      setLogs([]);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i < allLogs.length) {
        setLogs((prev) => [...prev.slice(-3), allLogs[i]]);
        i++;
      }
    }, 900);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute bottom-8 left-8 right-8 z-[110] font-mono text-[8px] text-indigo-400/80 bg-graphite-950/95 backdrop-blur-3xl p-5 rounded-3xl border border-indigo-500/20 shadow-3xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={`${idx === logs.length - 1 ? "text-white font-bold" : "opacity-25"}`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Tag: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 bg-graphite-800 border border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95"
  >
    + {label}
  </button>
);

// --- NEW STANDARDIZED COMPONENTS ---

export const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}> = ({ active, onClick, icon, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl transition-all ${active ? "bg-indigo-600/20 text-indigo-400 shadow-sm border border-indigo-500/30" : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"}`}
  >
    {icon}
  </button>
);

export const MobileNavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all px-3 py-1 rounded-xl ${active ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-slate-300"}`}
  >
    {icon}
    <span className="text-[9px] font-bold uppercase tracking-widest">
      {label}
    </span>
  </button>
);

export const ModelSelect: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-xl border text-center transition-all ${active ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow-sm" : "bg-graphite-950/50 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"}`}
  >
    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
      {label}
    </span>
  </button>
);
export const ToolSection: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, action, children, className = "" }) => (
  <section className={`flex flex-col gap-4 ${className}`}>
    <div className="flex justify-between items-center px-1">
      <SectionTitle>{title}</SectionTitle>
      {action}
    </div>
    {children}
  </section>
);

export const Card: React.FC<{
  onClick?: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  highlight?: boolean;
  className?: string;
}> = ({ onClick, icon, title, description, highlight, className = "" }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`w-full text-left p-5 rounded-2xl flex flex-col gap-3 transition-all ${onClick ? "active:scale-[0.98] cursor-pointer" : "cursor-default"} ${highlight ? "bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 hover:border-indigo-500/50" : "bg-graphite-800 border border-white/5 hover:bg-graphite-700 hover:border-white/10"} ${className}`}
  >
    {icon && (
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? "bg-indigo-500/20 text-indigo-400" : "bg-graphite-900 text-slate-400"}`}
      >
        {icon}
      </div>
    )}
    <div>
      <SectionTitle color={highlight ? "text-indigo-300" : "text-slate-300"}>
        {title}
      </SectionTitle>
      {description && (
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  </button>
);

export const TelemetryItem: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color = "text-slate-200" }) => (
  <div className="flex flex-col gap-1 bg-graphite-950/50 p-3 rounded-xl border border-white/5">
    <MicroLabel>{label}</MicroLabel>
    <span
      className={`text-[10px] font-mono font-bold uppercase tracking-widest ${color}`}
    >
      {value}
    </span>
  </div>
);

export const ModuleToggle: React.FC<{
  node: { id: string; label: string; isActive: boolean; isLocked: boolean };
  onToggle: () => void;
}> = ({ node, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={node.isLocked}
    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
      node.isActive
        ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-200"
        : "bg-graphite-950/50 border-white/5 text-slate-500 grayscale opacity-70"
    } ${node.isLocked ? "cursor-not-allowed opacity-50" : "hover:bg-graphite-800 active:scale-95"}`}
  >
    <div
      className={`w-2 h-2 rounded-full shrink-0 ${node.isActive ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" : "bg-slate-700"}`}
    />
    <div className="flex flex-col gap-0.5 overflow-hidden">
      <span className="text-[9px] font-bold uppercase tracking-widest truncate leading-none">
        {node.label}
      </span>
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest truncate leading-none">
        {node.isActive ? "ACTIVE" : "LOCKED"}
      </span>
    </div>
  </button>
);

export const Loader: React.FC<{ message?: string; subMessage?: string }> = ({
  message = "SYNTHESIZING",
  subMessage = "NEURAL GRID CALIBRATION",
}) => (
  <div className="absolute inset-0 bg-graphite-950/95 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-700">
    <div className="relative mb-12">
      <div className="w-48 h-48 border-[2px] border-indigo-500/5 rounded-full animate-ping opacity-20" />
      <div className="absolute inset-0 w-48 h-48 border-[4px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_40px_rgba(99,102,241,0.1)]" />
      <div className="absolute inset-4 border border-indigo-500/20 rounded-full flex items-center justify-center bg-graphite-900/40">
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,1)]" />
      </div>
    </div>
    <div className="flex flex-col items-center gap-6 text-center px-12 reveal-view">
      <div className="space-y-2">
        <span className="text-[16px] font-bold uppercase tracking-[0.5em] text-white block animate-pulse">
          {message}
        </span>
        <span className="text-[10px] font-bold text-indigo-400/40 uppercase tracking-[0.3em] block">
          {subMessage}
        </span>
      </div>
      <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="flex gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 bg-indigo-500/30 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);
