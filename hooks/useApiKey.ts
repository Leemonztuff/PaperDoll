import { useState, useCallback, useEffect } from "react";
import { ApiKeyService, QuotaService, ApiKeyStatus, QuotaInfo } from "../services/apiKeyService";

export interface UseApiKeyReturn {
  status: ApiKeyStatus;
  quota: QuotaInfo;
  manualKey: string;
  showKey: boolean;
  isTesting: boolean;
  testResult: { success: boolean; error?: string } | null;
  setManualKey: (key: string) => void;
  saveKey: () => void;
  clearKey: () => void;
  toggleShowKey: () => void;
  testConnection: () => Promise<void>;
  refreshStatus: () => void;
  remainingRequests: number;
  isQuotaExceeded: boolean;
  quotaPercentage: number;
}

export function useApiKey(): UseApiKeyReturn {
  const [status, setStatus] = useState<ApiKeyStatus>(ApiKeyService.getStatus());
  const [quota, setQuota] = useState<QuotaInfo>(QuotaService.getQuota());
  const [manualKey, setManualKey] = useState<string>(
    localStorage.getItem(ApiKeyService.getStorageKey()) || ""
  );
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const refreshStatus = useCallback(() => {
    setStatus(ApiKeyService.getStatus());
    setQuota(QuotaService.getQuota());
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const saveKey = useCallback(() => {
    if (manualKey.trim().length > 10) {
      ApiKeyService.setKey(manualKey);
      refreshStatus();
      setTestResult(null);
    }
  }, [manualKey, refreshStatus]);

  const clearKey = useCallback(() => {
    ApiKeyService.clearKey();
    setManualKey("");
    setTestResult(null);
    refreshStatus();
  }, [refreshStatus]);

  const toggleShowKey = useCallback(() => {
    setShowKey((prev) => !prev);
  }, []);

  const testConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const result = await ApiKeyService.testConnection(manualKey);
    
    setTestResult(result);
    setIsTesting(false);
    
    if (result.success) {
      ApiKeyService.setKey(manualKey);
      refreshStatus();
    }
  }, [manualKey, refreshStatus]);

  const remainingRequests = QuotaService.getRemainingRequests();
  const isQuotaExceeded = QuotaService.isQuotaExceeded();
  const quotaPercentage = QuotaService.getQuotaPercentage();

  return {
    status,
    quota,
    manualKey,
    showKey,
    isTesting,
    testResult,
    setManualKey,
    saveKey,
    clearKey,
    toggleShowKey,
    testConnection,
    refreshStatus,
    remainingRequests,
    isQuotaExceeded,
    quotaPercentage,
  };
}
