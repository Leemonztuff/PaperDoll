
import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isGenerating: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isGenerating }) => {
  return (
    <header className="h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-50">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-3 hover:bg-white/5 rounded-2xl transition-colors"
        >
          <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 ring-2 ring-white/10">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[15px] font-black uppercase tracking-[0.3em] text-white leading-none">
              Atelier <span className="text-indigo-500">Alpha</span> <span className="text-[10px] opacity-50 ml-1">v3.0</span>
            </h1>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">Neural Dressing & Concept System</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="hidden sm:flex items-center space-x-4 border-r border-white/10 pr-8 mr-2">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Neural Engine</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isGenerating ? 'text-amber-400 animate-pulse' : 'text-green-500'}`}>
              {isGenerating ? 'Sintetizando...' : 'Stage Ready'}
            </span>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${isGenerating ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]' : 'bg-green-500 shadow-[0_0_12px_#22c55e]'}`} />
        </div>
        
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-xl"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">GCP Link</span>
          <svg className="w-3 h-3 text-slate-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>
    </header>
  );
};

export default Header;
