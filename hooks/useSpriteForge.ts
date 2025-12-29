
import { useState, useEffect, useCallback, useReducer } from 'react';
import { AppState, GeneratedOutfit, ForgeConfig, ForgeMode } from '../types';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { DEFAULT_CONFIG } from '../constants';

type ForgeAction = 
  | { type: 'SET_BASE_IMAGE'; payload: string }
  | { type: 'SET_ACTIVE_PARENT'; payload: GeneratedOutfit | null }
  | { type: 'SET_OUTFITS'; payload: GeneratedOutfit[] }
  | { type: 'ADD_OUTFIT'; payload: GeneratedOutfit }
  | { type: 'REMOVE_OUTFIT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CONFIG'; payload: Partial<ForgeConfig> }
  | { type: 'SET_FORGE_MODE'; payload: ForgeMode }
  | { type: 'UPDATE_BG'; payload: 'magenta' | 'white' | 'gray' }
  | { type: 'TOGGLE_NODE'; payload: string };

function forgeReducer(state: AppState, action: ForgeAction): AppState {
  switch (action.type) {
    case 'SET_BASE_IMAGE': return { ...state, baseImage: action.payload, activeParent: null };
    case 'SET_ACTIVE_PARENT': return { ...state, activeParent: action.payload };
    case 'SET_OUTFITS': return { ...state, outfits: action.payload };
    case 'ADD_OUTFIT': return { ...state, outfits: [action.payload, ...state.outfits] };
    case 'REMOVE_OUTFIT': return { ...state, outfits: state.outfits.filter(o => o.id !== action.payload) };
    case 'SET_LOADING': return { ...state, isGenerating: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_FORGE_MODE': return { ...state, config: { ...state.config, mode: action.payload } };
    case 'UPDATE_CONFIG': return { ...state, config: { ...state.config, ...action.payload } };
    case 'UPDATE_BG': return { ...state, config: { ...state.config, protocols: { ...state.config.protocols, backgroundStyle: action.payload } } };
    case 'TOGGLE_NODE': return { 
      ...state, 
      config: { 
        ...state.config, 
        neuralChain: state.config.neuralChain.map(n => n.id === action.payload ? { ...n, isActive: !n.isActive } : n) 
      } 
    };
    default: return state;
  }
}

export function useSpriteForge() {
  const [state, dispatch] = useReducer(forgeReducer, {
    baseImage: null,
    activeParent: null,
    outfits: [],
    isGenerating: false,
    config: DEFAULT_CONFIG,
    error: null
  });

  useEffect(() => {
    StorageService.getAllOutfits().then(data => 
      dispatch({ type: 'SET_OUTFITS', payload: data })
    );
  }, []);

  const uploadBaseDNA = useCallback((url: string) => {
    dispatch({ type: 'SET_BASE_IMAGE', payload: url });
  }, []);

  const executeBaseExtraction = useCallback(async (imageUrl: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const baseDNA = await GeminiService.extractBaseDNA(imageUrl, state.config);
      dispatch({ type: 'SET_BASE_IMAGE', payload: baseDNA });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.config]);

  const executeSynthesis = useCallback(async (prompt: string) => {
    if (!state.baseImage) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const url = await GeminiService.synthesizeEvolution(
        state.baseImage,
        state.activeParent?.url || null,
        prompt,
        state.config
      );
      const newAsset: GeneratedOutfit = {
        id: crypto.randomUUID(),
        url,
        originalUrl: url,
        parentId: state.activeParent?.id,
        prompt,
        timestamp: Date.now(),
        model: state.config.model,
        aspectRatio: state.config.aspectRatio,
        evolutionStep: (state.activeParent?.evolutionStep || 0) + 1,
        mode: state.config.mode
      };
      await StorageService.saveOutfit(newAsset);
      dispatch({ type: 'ADD_OUTFIT', payload: newAsset });
      dispatch({ type: 'SET_ACTIVE_PARENT', payload: newAsset });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.baseImage, state.activeParent, state.config]);

  const deleteAsset = useCallback(async (id: string) => {
    await StorageService.deleteOutfit(id);
    dispatch({ type: 'REMOVE_OUTFIT', payload: id });
  }, []);

  return {
    state,
    dispatch,
    uploadBaseDNA,
    executeBaseExtraction,
    executeSynthesis,
    deleteAsset
  };
}
