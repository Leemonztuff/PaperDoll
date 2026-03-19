# AGENTS.md - PaperDoll Codebase Guide

## Project Overview

SpriteForge RPG is a React 19 + Vite + TypeScript application that generates pixel-art RPG character assets using Google Gemini AI.

---

## Build / Lint / Test Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Note:** This project does not currently have:
- Test suite configured
- Linting (ESLint/Prettier) configured
- TypeScript strict mode enforcement

---

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2022
- Module: ESNext with bundler resolution
- Path alias: `@/*` maps to project root
- JSX: `react-jsx` transform (React 19 default)
- `noEmit: true` - only type checking, Vite handles compilation

### Type Annotations

**Use explicit types over inference:**
```typescript
// Good
const [state, setState] = useState<string | null>(null);
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => void;

// Avoid
const [state, setState] = useState(null);
```

**For error handling, use `any` type assertion:**
```typescript
catch (error: any) {
  console.error(error);
  dispatch({ type: 'SET_ERROR', payload: error.message });
}
```

### Component Patterns

**Prefer functional components with explicit FC types:**
```typescript
export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <section className={className}>{children}</section>
);
```

**Avoid using `any` for component props - define proper interfaces:**
```typescript
// Good
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "glass" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
}

// Avoid - don't use 'any'
interface Props { onChange: (id: any) => void; } // ❌
```

### Imports

**Order:**
1. React core imports
2. External libraries (e.g., `@google/genai`)
3. Internal imports (relative)
4. Type imports

```typescript
import React, { useState, useCallback, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { ForgeConfig } from "../types";
import { GeminiService } from "../services/geminiService";
import { DEFAULT_CONFIG } from "../constants";
```

**Quotes:** Use double quotes for all imports and strings.

**No semicolons** at the end of statements.

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `App.tsx`, `Atelier.tsx` |
| Hooks | camelCase | `useSpriteForge.ts` |
| Services | PascalCase | `GeminiService.ts`, `StorageService.ts` |
| Types/Interfaces | PascalCase | `GeneratedOutfit`, `ForgeConfig` |
| Functions | camelCase | `handleForge`, `executeSynthesis` |
| Constants | camelCase or UPPER_SNAKE | `DEFAULT_CONFIG`, `ANATOMICAL_MACROS` |
| CSS classes | kebab-case (Tailwind) | `bg-graphite-900`, `text-indigo-400` |

### State Management

**Use useReducer for complex state:**
```typescript
type ForgeAction = 
  | { type: 'SET_BASE_IMAGE'; payload: string }
  | { type: 'SET_ACTIVE_PARENT'; payload: GeneratedOutfit | null }
  | { type: 'UPDATE_CONFIG'; payload: Partial<ForgeConfig> };

function forgeReducer(state: AppState, action: ForgeAction): AppState {
  switch (action.type) {
    case 'SET_BASE_IMAGE': return { ...state, baseImage: action.payload };
    // ...
    default: return state;
  }
}
```

**Use useCallback for async operations:**
```typescript
const executeSynthesis = useCallback(async (prompt: string) => {
  // async logic
}, [state.baseImage, state.activeParent, state.config]);
```

### Error Handling

**In services, handle API errors with specific messages:**
```typescript
private static handleApiError(error: any) {
  console.error("Gemini Error:", error);
  if (error.message?.includes("403") || error.message?.includes("401")) {
    throw new Error("RESELECT_KEY");
  }
  throw error;
}
```

**In components, catch and handle gracefully:**
```typescript
try {
  await executeSynthesis(prompt);
} catch (error: any) {
  if (error.message === "RESELECT_KEY" || error.message === "API_KEY_MISSING") {
    setIsSetupOpen(true);
  }
}
```

### Styling (Tailwind CSS)

**Color palette:** `graphite-*` for backgrounds, `indigo-*` for accents, `slate-*` for text.

**Use existing design system components from `components/UI.tsx`:**
- `Panel`, `Button`, `IconButton`, `SectionTitle`, `MicroLabel`
- `Slider`, `Tabs`, `TextArea`, `Card`, `Loader`
- `Tag`, `InfoBadge`, `ComparisonSlider`, `NeuralLog`

### Global Declarations

**For external APIs (e.g., browser extensions), declare in `App.tsx`:**
```typescript
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
```

---

## File Structure

```
PaperDoll/
├── App.tsx                 # Main app component
├── index.tsx               # Entry point
├── types.ts                # TypeScript interfaces/types
├── constants.ts            # Default config, neural chain, macros
├── hooks/
│   ├── useSpriteForge.ts   # Main state management hook
│   └── useApiKey.ts        # API key management hook
├── components/
│   ├── UI.tsx              # Design system components (SettingsPanel, Button, etc.)
│   ├── Atelier.tsx         # Main forge UI
│   ├── EvolutionTree.tsx    # Outfit history view
│   ├── ImageModal.tsx      # Outfit detail modal
│   └── ...                 # Other feature components
├── services/
│   ├── geminiService.ts     # Google Gemini API integration
│   ├── apiKeyService.ts    # API key & quota management
│   └── storageService.ts    # Local storage operations
└── vite.config.ts          # Vite configuration with path aliases
```

---

## API Integration

- Uses `@google/genai` for Gemini API calls
- Environment variable: `GEMINI_API_KEY` or `API_KEY`
- Models: `gemini-2.5-flash-image` (default), `gemini-3-pro-image-preview`

---

## API Key & Quota Management

### ApiKeyService (`services/apiKeyService.ts`)

Provides API key management with priority system:
1. **Manual key** (localStorage) - User-provided via SettingsPanel
2. **Environment key** - Set via `GEMINI_API_KEY` env variable

```typescript
import { ApiKeyService, QuotaService } from "./services/apiKeyService"

// Check if API key exists
const status = ApiKeyService.getStatus()
// status: { hasKey, keySource, tier, isValid }

// Set/clear manual key
ApiKeyService.setKey("user-api-key")
ApiKeyService.clearKey()

// Test connection
const result = await ApiKeyService.testConnection(optionalKey)
```

### QuotaService (`services/apiKeyService.ts`)

Tracks API usage with daily limits (60 requests by default):

```typescript
import { QuotaService } from "./services/apiKeyService"

// Check quota
const quota = QuotaService.getQuota()
// quota: { requestsUsed, requestsLimit, lastReset, isUnlimited }

const remaining = QuotaService.getRemainingRequests() // number
const exceeded = QuotaService.isQuotaExceeded() // boolean

// Track usage (called automatically by GeminiService)
QuotaService.incrementUsage()
```

### useApiKey Hook (`hooks/useApiKey.ts`)

React hook for API key state management:

```typescript
import { useApiKey } from "./hooks/useApiKey"

const {
  status,           // ApiKeyStatus object
  quota,            // QuotaInfo object
  manualKey,        // Current manual key string
  showKey,          // Toggle key visibility
  isTesting,        // Connection test in progress
  testResult,       // { success, error } | null
  remainingRequests, // number
  isQuotaExceeded,  // boolean
  setManualKey,
  saveKey,
  clearKey,
  toggleShowKey,
  testConnection,
} = useApiKey()
```

### SettingsPanel Component

Full-featured API key configuration UI with:
- API key status indicator (Free/Pro tier)
- Usage quota visualization with progress bar
- Secure key input with show/hide toggle
- Connection test button
- Save/Clear functionality

---

## Layer Separation System

### GeminiService Layer Methods (`services/geminiService.ts`)

Extract character layers for game development:

```typescript
import { GeminiService, LayerData } from "./services/geminiService"

// Extract a single layer
const bodyLayer = await GeminiService.extractLayer(
  sourceImage,
  "body",  // "body" | "clothing" | "accessories" | "background"
  config
)

// Extract all layers at once (4 API calls)
const layers = await GeminiService.extractAllLayers(sourceImage, config)
// layers: { body, clothing, accessories, background }
```

### LayerSeparator Component (`components/UI.tsx`)

Modal for extracting layers with progress indicator:

```tsx
<LayerSeparator
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  sourceImage={outfitUrl}
  onLayersExtracted={(layers) => handleLayers(layers)}
/>
```

### LayerPreview Component (`components/UI.tsx`)

Preview and download extracted layers:

```tsx
<LayerPreview
  layers={extractedLayers}
  onClose={() => setLayers(null)}
  onDownload={(layerKey) => downloadLayer(layerKey)}
  onDownloadAll={() => downloadAllLayers()}
/>
```

### Layer Types

| Layer | Description | Use Case |
|-------|-------------|----------|
| `body` | Character skin/base | Animation base, recoloring |
| `clothing` | Armor, clothes | Different outfit sets |
| `accessories` | Weapons, helmets, items | Equipment swaps |
| `background` | Environmental elements | Scene composition |
