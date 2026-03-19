import { useState, useCallback, useEffect } from "react"
import { ProviderId, PROVIDER_INFO, ImageService } from "../services/imageService"
import { ApiKeyService, ApiKeyStatus, ProviderStatus } from "../services/apiKeyService"

export interface UseProviderReturn {
  activeProvider: ProviderId | null
  providerKeys: Record<ProviderId, ProviderStatus>
  currentKey: string | null
  currentKeyInput: string
  hasAnyConfiguredProvider: boolean
  isTesting: boolean
  testResult: { success: boolean; error?: string } | null
  setActiveProvider: (providerId: ProviderId) => void
  setCurrentKeyInput: (key: string) => void
  saveCurrentKey: () => void
  clearCurrentKey: () => void
  testConnection: () => Promise<void>
  getProviderInfo: (providerId: ProviderId) => typeof PROVIDER_INFO.google
}

export function useProvider(): UseProviderReturn {
  const [activeProvider, setActiveProviderState] = useState<ProviderId | null>(
    ApiKeyService.getActiveProvider()
  )
  const [providerKeys, setProviderKeys] = useState<Record<ProviderId, ProviderStatus>>(
    ApiKeyService.getStatus().providers
  )
  const [currentKeyInput, setCurrentKeyInput] = useState<string>("")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(
    null
  )

  const refreshStatus = useCallback(() => {
    const status = ApiKeyService.getStatus()
    setProviderKeys(status.providers)
    if (status.activeProvider) {
      setActiveProviderState(status.activeProvider)
    }
  }, [])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  const currentKey = activeProvider ? ApiKeyService.getKey(activeProvider) : null

  const setActiveProvider = useCallback(
    (providerId: ProviderId) => {
      ApiKeyService.setActiveProvider(providerId)
      setActiveProviderState(providerId)
      setTestResult(null)
    },
    []
  )

  const saveCurrentKey = useCallback(() => {
    if (activeProvider && currentKeyInput.trim().length > 10) {
      ApiKeyService.setKey(activeProvider, currentKeyInput)
      refreshStatus()
      setCurrentKeyInput("")
      setTestResult(null)
    }
  }, [activeProvider, currentKeyInput, refreshStatus])

  const clearCurrentKey = useCallback(() => {
    if (activeProvider) {
      ApiKeyService.clearKey(activeProvider)
      refreshStatus()
      setTestResult(null)
    }
  }, [activeProvider, refreshStatus])

  const testConnection = useCallback(async () => {
    if (!activeProvider || currentKeyInput.length < 10) return

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await ImageService.testConnection(activeProvider, currentKeyInput)
      setTestResult(result)

      if (result.success) {
        ApiKeyService.setKey(activeProvider, currentKeyInput)
        refreshStatus()
        setCurrentKeyInput("")
      }
    } finally {
      setIsTesting(false)
    }
  }, [activeProvider, currentKeyInput, refreshStatus])

  const hasAnyConfiguredProvider = Object.values(providerKeys).some(
    (p: ProviderStatus) => p.hasKey && p.keyEnabled
  )

  const getProviderInfo = (providerId: ProviderId) => {
    return PROVIDER_INFO[providerId]
  }

  return {
    activeProvider,
    providerKeys,
    currentKey,
    currentKeyInput,
    hasAnyConfiguredProvider,
    isTesting,
    testResult,
    setActiveProvider,
    setCurrentKeyInput,
    saveCurrentKey,
    clearCurrentKey,
    testConnection,
    getProviderInfo,
  }
}
