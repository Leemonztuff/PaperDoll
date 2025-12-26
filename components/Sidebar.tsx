
import React from 'react';
import { AppState } from '../types';
import { MODEL_OPTIONS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  dispatch: any;
  prompt: string;
  setPrompt: (v: string) => void;
  onGenerate: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, state, dispatch }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-[3rem] p-8 pb-12 shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-500">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
        
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Configuración del Motor</h3>
            <button onClick={onClose} className="p-2 text-slate-500">✕</button>
          </div>

          <section className="space-y-4">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolos de Salida</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'magentaBackground', label: 'Chroma Magenta' },
                { id: 'pixelPerfect', label: 'Pixel Perfect' },
                { id: 'hd2dStyle', label: 'Estilo JRPG' },
                { id: 'strongOutline', label: 'Contorno Pro' },
              ].map(p => (
                <button 
                  key={p.id}
                  onClick={() => dispatch({ 
                    type: 'UPDATE_CONFIG', 
                    payload: { 
                      renderingProtocols: { ...state.renderingProtocols, [p.id]: !state.renderingProtocols[p.id as keyof AppState['renderingProtocols']] } 
                    } 
                  })}
                  className={`py-3 px-4 rounded-xl text-[9px] font-black border transition-all ${state.renderingProtocols[p.id as keyof AppState['renderingProtocols']] ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-transparent text-slate-500'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mutation Power</label>
              <span className="text-[10px] font-mono text-indigo-400">{state.mutationStrength}%</span>
            </div>
            <input 
              type="range" min="1" max="100" value={state.mutationStrength} 
              onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { mutationStrength: +e.target.value } })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none accent-indigo-500"
            />
          </section>

          <section className="space-y-4">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Intelligence</label>
            <div className="grid grid-cols-1 gap-2">
              {MODEL_OPTIONS.map(m => (
                <button 
                  key={m.id}
                  onClick={() => dispatch({ type: 'UPDATE_CONFIG', payload: { selectedModel: m.id } })}
                  className={`w-full py-4 rounded-xl text-[9px] font-black border transition-all ${state.selectedModel === m.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-transparent text-slate-600'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
