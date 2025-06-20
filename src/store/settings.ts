import { createSignal, createEffect } from "solid-js";
import type { AppSettings } from "../types";

// Default settings
const defaultSettings: AppSettings = {
  autoLockEnabled: true,
  autoLockTime: 15, // minutes
  showPasswordsByDefault: false,
  darkMode: false,
  defaultCategory: undefined
};

// Settings state
const [settings, setSettings] = createSignal<AppSettings>(defaultSettings);
const [isLoading, setIsLoading] = createSignal(false);
const [error, setError] = createSignal<string | null>(null);

// Local storage key
const SETTINGS_STORAGE_KEY = 'passwordvault-settings';

// Load settings from localStorage
const loadSettingsFromStorage = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (err) {
    console.error("Failed to load settings from storage:", err);
  }
  return defaultSettings;
};

// Save settings to localStorage
const saveSettingsToStorage = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings to storage:", err);
  }
};

// Initialize settings
export const initializeSettings = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Load from localStorage first
    const storedSettings = loadSettingsFromStorage();
    setSettings(storedSettings);
    
    // TODO: In the future, sync with backend
    // const backendSettings = await PasswordVaultAPI.getSettings();
    // setSettings({ ...storedSettings, ...backendSettings });
    
  } catch (err) {
    console.error("Settings initialization error:", err);
    setError(err instanceof Error ? err.message : "Failed to initialize settings");
  } finally {
    setIsLoading(false);
  }
};

// Update a specific setting
export const updateSetting = async <K extends keyof AppSettings>(
  key: K, 
  value: AppSettings[K]
): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    const newSettings = { ...settings(), [key]: value };
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    
    // TODO: Sync with backend
    // await PasswordVaultAPI.updateSettings({ [key]: value });
    
    return true;
  } catch (err) {
    console.error("Update setting error:", err);
    setError(err instanceof Error ? err.message : "Failed to update setting");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Update multiple settings
export const updateSettings = async (updates: Partial<AppSettings>): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    const newSettings = { ...settings(), ...updates };
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    
    // TODO: Sync with backend
    // await PasswordVaultAPI.updateSettings(updates);
    
    return true;
  } catch (err) {
    console.error("Update settings error:", err);
    setError(err instanceof Error ? err.message : "Failed to update settings");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Reset settings to defaults
export const resetSettings = async (): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    setSettings(defaultSettings);
    saveSettingsToStorage(defaultSettings);
    
    // TODO: Sync with backend
    // await PasswordVaultAPI.resetSettings();
    
    return true;
  } catch (err) {
    console.error("Reset settings error:", err);
    setError(err instanceof Error ? err.message : "Failed to reset settings");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Apply dark mode to document
createEffect(() => {
  if (settings().darkMode) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
});

// Clear error
export const clearError = () => setError(null);

// Initialize settings on module load
initializeSettings();

// Export reactive signals and getters
export { settings, isLoading, error };

// Convenience getters
export const isDarkMode = () => settings().darkMode;
export const isAutoLockEnabled = () => settings().autoLockEnabled;
export const getAutoLockTime = () => settings().autoLockTime;
export const shouldShowPasswordsByDefault = () => settings().showPasswordsByDefault;
export const getDefaultCategory = () => settings().defaultCategory;
