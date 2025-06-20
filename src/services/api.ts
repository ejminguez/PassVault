import { invoke } from "@tauri-apps/api/core";
import type {
  PasswordEntry,
  CreatePasswordEntry,
  UpdatePasswordEntry,
} from "../types";

// Check if we're in a Tauri environment (Tauri v2 uses __TAURI_INTERNALS__)
const isTauriEnvironment = () => {
  return typeof window !== "undefined" && 
         ((window as any).__TAURI_INTERNALS__ !== undefined || (window as any).__TAURI__ !== undefined);
};

export class PasswordVaultAPI {
  // Debug function to check Tauri environment
  static debugTauriContext() {
    console.log("=== Tauri Debug Info ===");
    console.log("window object:", typeof window);
    console.log(
      "window.__TAURI__:",
      typeof window !== "undefined" ? window.__TAURI__ : "undefined",
    );
    console.log("invoke function:", typeof invoke);
    console.log("invoke value:", invoke);

    // Check if we can access other Tauri APIs
    try {
      console.log(
        "Tauri API object:",
        typeof window !== "undefined"
          ? window.__TAURI_INTERNALS__
          : "undefined",
      );
    } catch (e) {
      console.log("Error accessing Tauri internals:", e);
    }

    // Try to see what's available in the window object
    if (typeof window !== "undefined") {
      console.log(
        "Window keys containing 'tauri':",
        Object.keys(window).filter((key) =>
          key.toLowerCase().includes("tauri"),
        ),
      );
    }
  }

  // Enhanced error handling
  private static async safeInvoke<T>(command: string, args?: any): Promise<T> {
    console.log(`Attempting to invoke: ${command}`, args);

    // Check if we're in a Tauri environment
    if (!isTauriEnvironment()) {
      console.error("Not running in Tauri environment");
      this.debugTauriContext();
      throw new Error("Application must be run in Tauri environment");
    }

    if (typeof invoke === "undefined") {
      console.error("invoke is undefined");
      this.debugTauriContext();
      throw new Error("Tauri invoke function is not available");
    }

    try {
      const result = await invoke<T>(command, args);
      console.log(`Successfully invoked ${command}:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to invoke ${command}:`, error);
      throw error;
    }
  }

  // Master password management
  static async setupMasterPassword(password: string): Promise<boolean> {
    return this.safeInvoke<boolean>("setup_master_password", { password });
  }

  static async verifyMasterPassword(password: string): Promise<boolean> {
    return this.safeInvoke<boolean>("verify_master_password", { password });
  }

  static async hasMasterPassword(): Promise<boolean> {
    return this.safeInvoke<boolean>("has_master_password");
  }

  static async logout(): Promise<void> {
    return this.safeInvoke<void>("logout");
  }

  // Password entry management
  static async createPasswordEntry(
    entry: CreatePasswordEntry,
  ): Promise<string> {
    return this.safeInvoke<string>("create_password_entry", { entry });
  }

  static async getAllEntries(): Promise<PasswordEntry[]> {
    return this.safeInvoke<PasswordEntry[]>("get_all_entries");
  }

  static async getEntryById(id: string): Promise<PasswordEntry> {
    return this.safeInvoke<PasswordEntry>("get_entry_by_id", { id });
  }

  static async updatePasswordEntry(
    id: string,
    update: UpdatePasswordEntry,
  ): Promise<void> {
    return this.safeInvoke<void>("update_password_entry", { id, update });
  }

  static async deletePasswordEntry(id: string): Promise<void> {
    return this.safeInvoke<void>("delete_password_entry", { id });
  }

  static async searchEntries(query: string): Promise<PasswordEntry[]> {
    return this.safeInvoke<PasswordEntry[]>("search_entries", { query });
  }

  // Utility functions
  static async generatePassword(
    length: number = 16,
    includeSymbols: boolean = true,
  ): Promise<string> {
    return this.safeInvoke<string>("generate_password", {
      length,
      includeSymbols,
    });
  }
}
