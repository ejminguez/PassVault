import { createSignal } from "solid-js";
import type { ViewMode } from "../types";

// Router state
const [currentView, setCurrentView] = createSignal<ViewMode>('all');
const [selectedCategory, setSelectedCategory] = createSignal<string | null>(null);

// Navigation functions
export const navigateToAll = () => {
  setCurrentView('all');
  setSelectedCategory(null);
};

export const navigateToFavorites = () => {
  setCurrentView('favorites');
  setSelectedCategory(null);
};

export const navigateToCategory = (categoryId: string) => {
  setCurrentView('category');
  setSelectedCategory(categoryId);
};

export const navigateToSettings = () => {
  setCurrentView('settings');
  setSelectedCategory(null);
};

// Getters
export const getCurrentView = () => currentView();
export const getSelectedCategory = () => selectedCategory();

// Export reactive signals
export { currentView, selectedCategory };
