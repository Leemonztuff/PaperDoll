import { ProviderId, PROVIDER_INFO } from "./providers"

const PROVIDERS_STORAGE = "PAPERDOLL_PROVIDERS"
const ACTIVE_PROVIDER_STORAGE = "PAPERDOLL_ACTIVE_PROVIDER"

export interface ProviderKeyData {
  key: string
  enabled: boolean
}

export interface ProviderKeys {
  google?: ProviderKeyData
  huggingface?: ProviderKeyData
  openrouter?: ProviderKeyData
}

export interface ProviderStatus {
  providerId: ProviderId
  hasKey: boolean
  keyEnabled: boolean
  isValid: boolean
}

export interface ApiKeyStatus {
  activeProvider: ProviderId | null
  providers: Record<ProviderId, ProviderStatus>
  hasAnyKey: boolean
  currentKey: string | null
}

export class ApiKeyService {
  static getAllKeys(): ProviderKeys {
    const stored = localStorage.getItem(PROVIDERS_STORAGE)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return {}
      }
    }
    return {}
  }

  static getActiveProvider(): ProviderId | null {
    const stored = localStorage.getItem(ACTIVE_PROVIDER_STORAGE) as ProviderId | null
    if (stored && ["google", "huggingface", "openrouter"].includes(stored)) {
      return stored
    }
    return null
  }

  static setActiveProvider(providerId: ProviderId): void {
    localStorage.setItem(ACTIVE_PROVIDER_STORAGE, providerId)
  }

  static getKey(providerId: ProviderId): string | null {
    const keys = this.getAllKeys()
    const providerKey = keys[providerId]
    if (providerKey?.enabled && providerKey?.key?.length > 10) {
      return providerKey.key
    }
    return null
  }

  static setKey(providerId: ProviderId, key: string): void {
    if (!key || key.trim().length < 10) return

    const keys = this.getAllKeys()
    keys[providerId] = {
      key: key.trim(),
      enabled: true,
    }
    localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify(keys))

    if (!this.getActiveProvider()) {
      this.setActiveProvider(providerId)
    }
  }

  static enableProvider(providerId: ProviderId): void {
    const keys = this.getAllKeys()
    if (keys[providerId]) {
      keys[providerId].enabled = true
      localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify(keys))
    }
  }

  static disableProvider(providerId: ProviderId): void {
    const keys = this.getAllKeys()
    if (keys[providerId]) {
      keys[providerId].enabled = false
      localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify(keys))
    }
  }

  static clearKey(providerId: ProviderId): void {
    const keys = this.getAllKeys()
    delete keys[providerId]
    localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify(keys))
  }

  static clearAllKeys(): void {
    localStorage.removeItem(PROVIDERS_STORAGE)
    localStorage.removeItem(ACTIVE_PROVIDER_STORAGE)
  }

  static getStatus(): ApiKeyStatus {
    const keys = this.getAllKeys()
    const activeProvider = this.getActiveProvider()
    const allProviders: ProviderId[] = ["google", "huggingface", "openrouter"]

    const providerStatuses: Record<ProviderId, ProviderStatus> = {
      google: { providerId: "google", hasKey: false, keyEnabled: false, isValid: false },
      huggingface: { providerId: "huggingface", hasKey: false, keyEnabled: false, isValid: false },
      openrouter: { providerId: "openrouter", hasKey: false, keyEnabled: false, isValid: false },
    }

    let hasAnyKey = false
    let currentKey: string | null = null

    for (const providerId of allProviders) {
      const keyData = keys[providerId]
      if (keyData?.key && keyData.key.length > 10) {
        providerStatuses[providerId].hasKey = true
        providerStatuses[providerId].keyEnabled = keyData.enabled
        providerStatuses[providerId].isValid = true
        hasAnyKey = true

        if (activeProvider === providerId && keyData.enabled) {
          currentKey = keyData.key
        }
      }
    }

    return {
      activeProvider,
      providers: providerStatuses,
      hasAnyKey,
      currentKey,
    }
  }

  static getCurrentKey(): string | null {
    const activeProvider = this.getActiveProvider()
    if (!activeProvider) return null
    return this.getKey(activeProvider)
  }

  static isCurrentProviderConfigured(): boolean {
    const key = this.getCurrentKey()
    return !!key
  }
}

export class QuotaService {
  private static readonly STORAGE_KEY = "PAPERDOLL_QUOTA"

  static getQuota(): { requestsUsed: number; requestsLimit: number; lastReset: number; isUnlimited: boolean } {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return this.getDefaultQuota()
      }
    }
    return this.getDefaultQuota()
  }

  private static getDefaultQuota() {
    return {
      requestsUsed: 0,
      requestsLimit: 120,
      lastReset: Date.now(),
      isUnlimited: true,
    }
  }

  static incrementUsage(): void {
    const quota = this.getQuota()
    quota.requestsUsed += 1
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quota))
  }

  static getRemainingRequests(): number {
    const quota = this.getQuota()
    if (quota.isUnlimited) return Infinity
    return Math.max(0, quota.requestsLimit - quota.requestsUsed)
  }

  static isQuotaExceeded(): boolean {
    const quota = this.getQuota()
    if (quota.isUnlimited) return false
    return quota.requestsUsed >= quota.requestsLimit
  }

  static getQuotaPercentage(): number {
    const quota = this.getQuota()
    if (quota.isUnlimited) return 0
    return Math.min(100, (quota.requestsUsed / quota.requestsLimit) * 100)
  }
}
