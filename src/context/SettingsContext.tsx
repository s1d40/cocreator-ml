import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSettings, DEFAULT_SETTINGS, MlSellerAccountInfo } from '../types/settings';
import { getLocalSettings, saveLocalSettings, validateMlToken, ValidateTokenResult } from '../services/mlApi';

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  saveSettings: () => void;
  testApiKey: (tokenToTest?: string) => Promise<ValidateTokenResult>;
  isTesting: boolean;
  activeSeller: MlSellerAccountInfo | null;
  isApiConnected: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [activeSeller, setActiveSeller] = useState<MlSellerAccountInfo | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = getLocalSettings();
    setSettings(loaded);
    if (loaded.api.accountInfo) {
      setActiveSeller(loaded.api.accountInfo);
    }
  }, []);

  const updateSettings = (updater: (prev: AppSettings) => AppSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveLocalSettings(next);
      return next;
    });
  };

  const saveSettings = () => {
    saveLocalSettings(settings);
  };

  const testApiKey = async (tokenToTest?: string): Promise<ValidateTokenResult> => {
    setIsTesting(true);
    const token = tokenToTest !== undefined ? tokenToTest : settings.api.accessToken;

    const result = await validateMlToken(token);
    setIsTesting(false);

    updateSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        accessToken: token,
        connectionStatus: result.status,
        lastTestedAt: new Date().toISOString(),
        accountInfo: result.accountInfo,
        errorMessage: result.errorMessage,
      },
    }));

    if (result.accountInfo) {
      setActiveSeller(result.accountInfo);
    }

    return result;
  };

  const isApiConnected = settings.api.connectionStatus === 'connected' || settings.api.connectionStatus === 'simulation';

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        saveSettings,
        testApiKey,
        isTesting,
        activeSeller,
        isApiConnected,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
