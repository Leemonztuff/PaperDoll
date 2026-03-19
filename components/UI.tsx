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

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  status: {
    hasKey: boolean;
    keySource: "none" | "manual" | "environment";
    tier: "free" | "pro";
    isValid: boolean;
  };
  quota: {
    requestsUsed: number;
    requestsLimit: number;
    isUnlimited: boolean;
  };
  remainingRequests: number;
  isQuotaExceeded: boolean;
  quotaPercentage: number;
  manualKey: string;
  showKey: boolean;
  isTesting: boolean;
  testResult: { success: boolean; error?: string } | null;
  onManualKeyChange: (key: string) => void;
  onSaveKey: () => void;
  onClearKey: () => void;
  onToggleShowKey: () => void;
  onTestConnection: () => Promise<void>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  status,
  quota,
  remainingRequests,
  isQuotaExceeded,
  quotaPercentage,
  manualKey,
  showKey,
  isTesting,
  testResult,
  onManualKeyChange,
  onSaveKey,
  onClearKey,
  onToggleShowKey,
  onTestConnection,
}) => {
  if (!isOpen) return null;

  const getTierBadge = () => {
    if (status.tier === "pro") {
      return (
        <span className="px-2 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-indigo-300">
          PRO TIER
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-300">
        FREE TIER
      </span>
    );
  };

  const getStatusIndicator = () => {
    if (!status.hasKey) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <MicroLabel color="text-red-400">NO API KEY CONFIGURED</MicroLabel>
        </div>
      );
    }
    if (status.keySource === "manual") {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <MicroLabel color="text-emerald-400">CUSTOM KEY ACTIVE</MicroLabel>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <MicroLabel color="text-indigo-400">ENVIRONMENT KEY</MicroLabel>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-graphite-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <Panel className="relative max-w-lg w-full bg-graphite-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <SectionTitle className="text-slate-200">ENGINE CALIBRATION</SectionTitle>
            {getTierBadge()}
          </div>
          <IconButton variant="ghost" onClick={onClose}>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        <div className="space-y-6">
          <ToolSection title="API Key Status">{getStatusIndicator()}</ToolSection>

          <ToolSection title="Usage Quota">
            <div className="space-y-4">
              {status.hasKey && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <MicroLabel>
                      {quota.isUnlimited ? "UNLIMITED" : `${remainingRequests} requests remaining`}
                    </MicroLabel>
                    <span className="text-[10px] font-mono text-indigo-300">
                      {quota.isUnlimited ? "∞" : `${quota.requestsUsed}/${quota.requestsLimit}`}
                    </span>
                  </div>
                  {!quota.isUnlimited && (
                    <div className="w-full h-2 bg-graphite-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          quotaPercentage > 80
                            ? "bg-red-500"
                            : quotaPercentage > 50
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                        }`}
                        style={{ width: `${quotaPercentage}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              {!status.hasKey && (
                <p className="text-xs text-slate-400">
                  Configure an API key below to start generating assets.
                  Free tier includes limited requests per day.
                </p>
              )}
            </div>
          </ToolSection>

          <ToolSection title="API Key Configuration">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={manualKey}
                  onChange={(e) => onManualKeyChange(e.target.value)}
                  placeholder="Paste your nanobanana API key here..."
                  className="w-full bg-graphite-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500/50 focus:bg-graphite-900 outline-none transition-all font-mono placeholder:text-slate-600 pr-12"
                />
                <button
                  onClick={onToggleShowKey}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showKey ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl ${
                    testResult.success
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`text-xs font-bold ${
                      testResult.success ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {testResult.success ? "Connection successful!" : testResult.error || "Connection failed"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={onTestConnection}
                  disabled={isTesting || manualKey.length < 10}
                  className="flex-1"
                >
                  {isTesting ? "TESTING..." : "TEST CONNECTION"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onSaveKey}
                  disabled={manualKey.length < 10}
                >
                  SAVE
                </Button>
                <Button variant="danger" onClick={onClearKey}>
                  CLEAR
                </Button>
              </div>
            </div>
          </ToolSection>

          <ToolSection title="Get Your API Key">
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Quick Setup Guide</span>
                </div>
                <ol className="text-[11px] text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-bold">Google AI Studio</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Get API Key" in the sidebar</li>
                  <li>Create a new API key or copy an existing one</li>
                  <li>Paste the key above and click "Test Connection"</li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-graphite-800 hover:bg-graphite-700 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  AI Studio
                </a>
                <a
                  href="https://ai.google.dev/gemini-api/docs/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-graphite-800 hover:bg-graphite-700 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Pricing
                </a>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Free Tier Benefits</span>
                </div>
                <ul className="text-[10px] text-slate-400 space-y-1">
                  <li>• <span className="text-emerald-400 font-bold">500 requests/day</span> free with Gemini 2.5 Flash</li>
                  <li>• No credit card required</li>
                  <li>• Image generation included</li>
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7m14 13V7a2 2 0 00-2-2h-6l2 6h6l-2-6m-6 0V5a2 2 0 10-4 0v6l2 6h6l2-6V11a2 2 0 10-4 0" />
                  </svg>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Pro Tier (Paid)</span>
                </div>
                <ul className="text-[10px] text-slate-400 space-y-1">
                  <li>• Access to Gemini 3 Pro Image model</li>
                  <li>• Higher quality outputs</li>
                  <li>• ~$0.134 per image generated</li>
                </ul>
              </div>
            </div>
          </ToolSection>

          <Button variant="glass" onClick={onClose} className="w-full">
            CLOSE
          </Button>
        </div>
      </Panel>
    </div>
  )
}

interface LayerSeparatorProps {
  isOpen: boolean
  onClose: () => void
  sourceImage: string
  onLayersExtracted: (layers: LayerData) => void
}

interface LayerData {
  body: string
  clothing: string
  accessories: string
  background: string
}

export const LayerSeparator: React.FC<LayerSeparatorProps> = ({
  isOpen,
  onClose,
  sourceImage,
  onLayersExtracted,
}) => {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractingLayer, setExtractingLayer] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const layerDefinitions = [
    { id: "body", label: "Body", description: "Character skin/body base" },
    { id: "clothing", label: "Clothing", description: "Armor, clothes, fabric" },
    { id: "accessories", label: "Accessories", description: "Weapons, helmets, items" },
    { id: "background", label: "Background", description: "Environmental elements" },
  ]

  const handleExtractLayers = async () => {
    setIsExtracting(true)
    setError(null)
    setProgress(0)

    try {
      const { GeminiService, LayerData } = await import("../services/geminiService")
      const { DEFAULT_CONFIG } = await import("../constants")

      const layers: LayerData = {
        body: "",
        clothing: "",
        accessories: "",
        background: "",
      }

      for (let i = 0; i < layerDefinitions.length; i++) {
        const layer = layerDefinitions[i].id as keyof LayerData
        setExtractingLayer(layerDefinitions[i].label)
        setProgress(((i + 0.5) / layerDefinitions.length) * 100)

        layers[layer] = await GeminiService.extractLayer(
          sourceImage,
          layer,
          DEFAULT_CONFIG
        )

        setProgress(((i + 1) / layerDefinitions.length) * 100)
      }

      onLayersExtracted(layers)
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to extract layers")
    } finally {
      setIsExtracting(false)
      setExtractingLayer(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-graphite-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      <Panel className="relative max-w-md w-full bg-graphite-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <SectionTitle className="text-slate-200">LAYER SEPARATOR</SectionTitle>
          <IconButton variant="ghost" onClick={onClose}>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        <div className="space-y-6">
          <p className="text-xs text-slate-400 text-center">
            Extract character layers as separate transparent PNGs for game development.
          </p>

          <div className="space-y-3">
            {layerDefinitions.map((layer, index) => (
              <div
                key={layer.id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                  isExtracting
                    ? "bg-graphite-800/50 border-white/5"
                    : "bg-graphite-800/30 border-white/5 hover:border-indigo-500/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isExtracting
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "bg-graphite-700 text-slate-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {layer.label}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {layer.description}
                  </div>
                </div>
                {extractingLayer === layer.label && (
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>

          {isExtracting && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <MicroLabel>Extracting {extractingLayer}...</MicroLabel>
                <span className="text-indigo-400 font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-graphite-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="text-xs text-red-400 font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleExtractLayers}
              disabled={isExtracting}
              className="w-full"
            >
              {isExtracting ? "EXTRACTING..." : "EXTRACT ALL LAYERS"}
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full">
              CANCEL
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}

interface LayerPreviewProps {
  layers: LayerData
  onClose: () => void
  onDownload: (layer: keyof LayerData) => void
  onDownloadAll: () => void
}

export const LayerPreview: React.FC<LayerPreviewProps> = ({
  layers,
  onClose,
  onDownload,
  onDownloadAll,
}) => {
  const layerInfo = [
    { id: "body" as const, label: "Body", color: "bg-rose-500" },
    { id: "clothing" as const, label: "Clothing", color: "bg-blue-500" },
    { id: "accessories" as const, label: "Accessories", color: "bg-amber-500" },
    { id: "background" as const, label: "Background", color: "bg-emerald-500" },
  ]

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-graphite-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      <Panel className="relative max-w-4xl w-full bg-graphite-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-graphite-900/95 backdrop-blur-sm py-2 z-10">
          <SectionTitle className="text-slate-200">EXTRACTED LAYERS</SectionTitle>
          <div className="flex gap-2">
            <Button variant="primary" onClick={onDownloadAll}>
              DOWNLOAD ALL
            </Button>
            <IconButton variant="ghost" onClick={onClose}>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {layerInfo.map((layer) => (
            <div
              key={layer.id}
              className="relative group bg-graphite-950 rounded-xl overflow-hidden border border-white/5"
            >
              <div className="absolute top-2 left-2 z-10">
                <span
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white ${layer.color}`}
                >
                  {layer.label}
                </span>
              </div>
              <div className="aspect-square flex items-center justify-center p-4">
                <img
                  src={layers[layer.id]}
                  alt={layer.label}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <Button
                  variant="secondary"
                  onClick={() => onDownload(layer.id)}
                  className="text-[9px]"
                >
                  DOWNLOAD
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500">
            All layers are exported with magenta (#FF00FF) background for transparency.
          </p>
        </div>
      </Panel>
    </div>
  )
}
