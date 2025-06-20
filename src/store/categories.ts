import { createSignal } from "solid-js";
import type { Category, CreateCategory } from "../types";

// Categories state
const [categories, setCategories] = createSignal<Category[]>([]);
const [isLoading, setIsLoading] = createSignal(false);
const [error, setError] = createSignal<string | null>(null);

// Default categories
const defaultCategories: CreateCategory[] = [
  { name: "Social Media", color: "#3b82f6", icon: "👥" },
  { name: "Banking", color: "#10b981", icon: "🏦" },
  { name: "Email", color: "#f59e0b", icon: "📧" },
  { name: "Work", color: "#8b5cf6", icon: "💼" },
  { name: "Shopping", color: "#ef4444", icon: "🛒" },
  { name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { name: "Utilities", color: "#6b7280", icon: "⚡" },
  { name: "Other", color: "#64748b", icon: "📁" }
];

// Initialize with default categories (in a real app, this would come from the backend)
const initializeCategories = () => {
  const initialCategories: Category[] = defaultCategories.map((cat, index) => ({
    id: `cat-${index + 1}`,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    created_at: new Date().toISOString()
  }));
  
  setCategories(initialCategories);
};

// Load categories (placeholder for backend integration)
export const loadCategories = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // TODO: Replace with actual API call
    // const categoriesData = await PasswordVaultAPI.getCategories();
    // setCategories(categoriesData);
    
    // For now, initialize with defaults if empty
    if (categories().length === 0) {
      initializeCategories();
    }
  } catch (err) {
    console.error("Load categories error:", err);
    setError(err instanceof Error ? err.message : "Failed to load categories");
  } finally {
    setIsLoading(false);
  }
};

// Create category
export const createCategory = async (category: CreateCategory): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    // TODO: Replace with actual API call
    // const id = await PasswordVaultAPI.createCategory(category);
    
    // For now, create locally
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: category.name,
      color: category.color || "#64748b",
      icon: category.icon || "📁",
      created_at: new Date().toISOString()
    };
    
    setCategories(prev => [...prev, newCategory]);
    return true;
  } catch (err) {
    console.error("Create category error:", err);
    setError(err instanceof Error ? err.message : "Failed to create category");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Update category
export const updateCategory = async (id: string, updates: Partial<CreateCategory>): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    // TODO: Replace with actual API call
    // await PasswordVaultAPI.updateCategory(id, updates);
    
    // For now, update locally
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    return true;
  } catch (err) {
    console.error("Update category error:", err);
    setError(err instanceof Error ? err.message : "Failed to update category");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  
  try {
    // TODO: Replace with actual API call
    // await PasswordVaultAPI.deleteCategory(id);
    
    // For now, delete locally
    setCategories(prev => prev.filter(cat => cat.id !== id));
    return true;
  } catch (err) {
    console.error("Delete category error:", err);
    setError(err instanceof Error ? err.message : "Failed to delete category");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Get category by ID
export const getCategoryById = (id: string): Category | undefined => {
  return categories().find(cat => cat.id === id);
};

// Get category by name
export const getCategoryByName = (name: string): Category | undefined => {
  return categories().find(cat => cat.name.toLowerCase() === name.toLowerCase());
};

// Clear error
export const clearError = () => setError(null);

// Initialize categories on module load
loadCategories();

// Export reactive signals
export { categories, isLoading, error };
