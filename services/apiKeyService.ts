const API_KEY_STORAGE = "PAPERDOLL_API_KEY";
const QUOTA_STORAGE = "PAPERDOLL_QUOTA";

export interface QuotaInfo {
  requestsUsed: number;
  requestsLimit: number;
  lastReset: number;
  isUnlimited: boolean;
}

export interface ApiKeyStatus {
  hasKey: boolean;
  keySource: "none" | "manual" | "environment";
  tier: "free" | "pro";
  isValid: boolean;
}

export class ApiKeyService {
  static getStorageKey(): string {
    return API_KEY_STORAGE;
  }

  static getKey(): string | null {
    const manualKey = localStorage.getItem(API_KEY_STORAGE);
    if (manualKey && manualKey.length > 10) {
      return manualKey;
    }
    const envKey = (import.meta as any).env?.GEMINI_API_KEY || (import.meta as any).env?.API_KEY;
    if (envKey && envKey.length > 10) {
      return envKey;
    }
    return null;
  }

  static setKey(key: string): void {
    if (key && key.trim().length > 10) {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
    }
  }

  static clearKey(): void {
    localStorage.removeItem(API_KEY_STORAGE);
  }

  static isValidKey(key?: string | null): boolean {
    const k = key ?? this.getKey();
    return !!(k && k.length > 10);
  }

  static getStatus(): ApiKeyStatus {
    const manualKey = localStorage.getItem(API_KEY_STORAGE);
    const envKey = (import.meta as any).env?.GEMINI_API_KEY || (import.meta as any).env?.API_KEY;

    if (manualKey && manualKey.length > 10) {
      return {
        hasKey: true,
        keySource: "manual",
        tier: "pro",
        isValid: true,
      };
    }

    if (envKey && envKey.length > 10) {
      return {
        hasKey: true,
        keySource: "environment",
        tier: this.detectTier(envKey),
        isValid: true,
      };
    }

    return {
      hasKey: false,
      keySource: "none",
      tier: "free",
      isValid: false,
    };
  }

  private static detectTier(key: string): "free" | "pro" {
    return "pro";
  }

  static async testConnection(key?: string): Promise<{ success: boolean; error?: string }> {
    const apiKey = key ?? this.getKey();
    if (!apiKey) {
      return { success: false, error: "No API key provided" };
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: "test" }] },
        config: { maxOutputTokens: 1 },
      });

      if (response.text !== undefined) {
        return { success: true };
      }
      return { success: false, error: "Invalid response from API" };
    } catch (error: any) {
      return { success: false, error: error.message || "Connection failed" };
    }
  }
}

export class QuotaService {
  static getStorageKey(): string {
    return QUOTA_STORAGE;
  }

  static getQuota(): QuotaInfo {
    const stored = localStorage.getItem(QUOTA_STORAGE);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return {
          requestsUsed: data.requestsUsed || 0,
          requestsLimit: data.requestsLimit || 60,
          lastReset: data.lastReset || Date.now(),
          isUnlimited: data.isUnlimited || false,
        };
      } catch {
        return this.getDefaultQuota();
      }
    }
    return this.getDefaultQuota();
  }

  private static getDefaultQuota(): QuotaInfo {
    return {
      requestsUsed: 0,
      requestsLimit: 60,
      lastReset: Date.now(),
      isUnlimited: false,
    };
  }

  static incrementUsage(): QuotaInfo {
    const quota = this.getQuota();
    
    const now = Date.now();
    const hoursSinceReset = (now - quota.lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 24) {
      quota.requestsUsed = 0;
      quota.lastReset = now;
    }

    quota.requestsUsed += 1;
    localStorage.setItem(QUOTA_STORAGE, JSON.stringify(quota));
    
    return quota;
  }

  static getRemainingRequests(): number {
    const quota = this.getQuota();
    if (quota.isUnlimited) return Infinity;
    return Math.max(0, quota.requestsLimit - quota.requestsUsed);
  }

  static isQuotaExceeded(): boolean {
    const quota = this.getQuota();
    if (quota.isUnlimited) return false;
    return quota.requestsUsed >= quota.requestsLimit;
  }

  static getQuotaPercentage(): number {
    const quota = this.getQuota();
    if (quota.isUnlimited) return 0;
    return Math.min(100, (quota.requestsUsed / quota.requestsLimit) * 100);
  }

  static formatResetTime(): string {
    const quota = this.getQuota();
    const nextReset = quota.lastReset + (24 * 60 * 60 * 1000);
    const now = Date.now();
    const msRemaining = nextReset - now;

    if (msRemaining <= 0) return "Resets soon";

    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `Resets in ${hours}h ${minutes}m`;
    }
    return `Resets in ${minutes}m`;
  }
}
