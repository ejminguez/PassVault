import { createSignal, createEffect } from "solid-js";
import { PasswordVaultAPI } from "../services/api";
import type { AuthState } from "../types";

// Auth state signals
const [authState, setAuthState] = createSignal<AuthState>({
  isAuthenticated: false,
  hasMasterPassword: false,
});

const [isLoading, setIsLoading] = createSignal(false);
const [error, setError] = createSignal<string | null>(null);

// Wait for Tauri to be ready (Tauri v2 uses __TAURI_INTERNALS__)
const waitForTauri = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && 
        ((window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__)) {
      resolve();
      return;
    }
    
    // Poll for Tauri availability
    const checkTauri = () => {
      if (typeof window !== "undefined" && 
          ((window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__)) {
        resolve();
      } else {
        setTimeout(checkTauri, 100);
      }
    };
    
    checkTauri();
  });
};

// Initialize auth state on app start
export const initializeAuth = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Wait for Tauri to be ready
    await waitForTauri();
    
    const hasMasterPassword = await PasswordVaultAPI.hasMasterPassword();
    setAuthState({
      isAuthenticated: false,
      hasMasterPassword,
    });
  } catch (err) {
    console.error("Auth initialization error:", err);
    setError(err instanceof Error ? err.message : "Failed to initialize auth");
  } finally {
    setIsLoading(false);
  }
};

// Setup master password (first time setup)
export const setupMasterPassword = async (password: string): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    const success = await PasswordVaultAPI.setupMasterPassword(password);
    if (success) {
      setAuthState({
        isAuthenticated: true,
        hasMasterPassword: true,
      });
    }
    return success;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to setup master password");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Login with master password
export const login = async (password: string): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    const success = await PasswordVaultAPI.verifyMasterPassword(password);
    if (success) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
      }));
    } else {
      setError("Invalid master password");
    }
    return success;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to login");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Logout
export const logout = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    await PasswordVaultAPI.logout();
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
    }));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to logout");
  } finally {
    setIsLoading(false);
  }
};

// Clear error
export const clearError = () => setError(null);

// Export reactive signals
export { authState, isLoading, error };
