// Types matching the Rust backend structures

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
}

export interface CreatePasswordEntry {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  is_favorite?: boolean;
}

export interface UpdatePasswordEntry {
  title?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  category?: string;
  is_favorite?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface CreateCategory {
  name: string;
  color?: string;
  icon?: string;
}

export interface AppError {
  message: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  hasMasterPassword: boolean;
}

export interface AppSettings {
  autoLockEnabled: boolean;
  autoLockTime: number; // minutes
  showPasswordsByDefault: boolean;
  darkMode: boolean;
  defaultCategory?: string;
}

export type ViewMode = 'all' | 'favorites' | 'category' | 'settings';
