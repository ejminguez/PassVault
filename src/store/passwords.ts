import { createSignal } from "solid-js";
import { PasswordVaultAPI } from "../services/api";
import type { PasswordEntry, CreatePasswordEntry, UpdatePasswordEntry } from "../types";

// Password entries state
const [entries, setEntries] = createSignal<PasswordEntry[]>([]);
const [selectedEntry, setSelectedEntry] = createSignal<PasswordEntry | null>(null);
const [searchQuery, setSearchQuery] = createSignal("");
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

// Load all entries
export const loadEntries = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Wait for Tauri to be ready
    await waitForTauri();
    
    const allEntries = await PasswordVaultAPI.getAllEntries();
    setEntries(allEntries);
  } catch (err) {
    console.error("Load entries error:", err);
    setError(err instanceof Error ? err.message : "Failed to load entries");
  } finally {
    setIsLoading(false);
  }
};

// Create new entry
export const createEntry = async (entry: CreatePasswordEntry): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    const id = await PasswordVaultAPI.createPasswordEntry(entry);
    // Reload entries to get the new one with full data
    await loadEntries();
    return true;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create entry");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Update entry
export const updateEntry = async (id: string, update: UpdatePasswordEntry): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    await PasswordVaultAPI.updatePasswordEntry(id, update);
    // Reload entries to get updated data
    await loadEntries();
    return true;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update entry");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Delete entry
export const deleteEntry = async (id: string): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    await PasswordVaultAPI.deletePasswordEntry(id);
    // Remove from local state
    setEntries(prev => prev.filter(entry => entry.id !== id));
    // Clear selection if deleted entry was selected
    if (selectedEntry()?.id === id) {
      setSelectedEntry(null);
    }
    return true;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to delete entry");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Toggle favorite status
export const toggleFavorite = async (id: string): Promise<boolean> => {
  const entry = entries().find(e => e.id === id);
  if (!entry) return false;
  
  return await updateEntry(id, { is_favorite: !entry.is_favorite });
};

// Search entries
export const searchEntries = async (query: string) => {
  setSearchQuery(query);
  
  if (!query.trim()) {
    await loadEntries();
    return;
  }
  
  setIsLoading(true);
  setError(null);
  
  try {
    const searchResults = await PasswordVaultAPI.searchEntries(query);
    setEntries(searchResults);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to search entries");
  } finally {
    setIsLoading(false);
  }
};

// Filter entries by category
export const getEntriesByCategory = (categoryName: string): PasswordEntry[] => {
  return entries().filter(entry => 
    entry.category?.toLowerCase() === categoryName.toLowerCase()
  );
};

// Get favorite entries
export const getFavoriteEntries = (): PasswordEntry[] => {
  return entries().filter(entry => entry.is_favorite === true);
};

// Get entries without category
export const getUncategorizedEntries = (): PasswordEntry[] => {
  return entries().filter(entry => !entry.category || entry.category.trim() === '');
};

// Get all unique categories from entries
export const getUsedCategories = (): string[] => {
  const categories = entries()
    .map(entry => entry.category)
    .filter((cat): cat is string => Boolean(cat && cat.trim()));
  
  return [...new Set(categories)];
};

// Generate password
export const generatePassword = async (length: number = 16, includeSymbols: boolean = true): Promise<string> => {
  try {
    return await PasswordVaultAPI.generatePassword(length, includeSymbols);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to generate password");
    return "";
  }
};

// Select entry
export const selectEntry = (entry: PasswordEntry | null) => {
  setSelectedEntry(entry);
};

// Clear error
export const clearError = () => setError(null);

// Export reactive signals
export { 
  entries, 
  selectedEntry, 
  searchQuery, 
  isLoading, 
  error,
  setSearchQuery
};
