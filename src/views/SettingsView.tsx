import { createSignal, Show, For } from "solid-js";
import { 
  settings, 
  updateSetting, 
  updateSettings, 
  resetSettings,
  isLoading as settingsLoading,
  error as settingsError 
} from "../store/settings";
import { categories, createCategory, updateCategory, deleteCategory } from "../store/categories";
import { logout } from "../store/auth";
import { showToast } from "../components/StateFeedback/Toast";
import { useConfirmDialog } from "../components/StateFeedback/ConfirmDialog";
import type { CreateCategory } from "../types";

const SettingsView = () => {
  const [activeTab, setActiveTab] = createSignal<'general' | 'security' | 'categories' | 'about'>('general');
  const [showCategoryForm, setShowCategoryForm] = createSignal(false);
  const [editingCategory, setEditingCategory] = createSignal<string | null>(null);
  const [newCategoryName, setNewCategoryName] = createSignal("");
  const [newCategoryColor, setNewCategoryColor] = createSignal("#3b82f6");
  const [newCategoryIcon, setNewCategoryIcon] = createSignal("📁");

  const { dialogState, showConfirm, ConfirmDialog } = useConfirmDialog();

  const handleSettingChange = async (key: keyof typeof settings, value: any) => {
    const success = await updateSetting(key, value);
    if (success) {
      showToast(`${key} updated successfully`, "success");
    } else {
      showToast(`Failed to update ${key}`, "error");
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: "Logout",
      message: "Are you sure you want to logout? You'll need to enter your master password again.",
      confirmText: "Logout",
      type: "warning"
    });

    if (confirmed) {
      await logout();
    }
  };

  const handleResetSettings = async () => {
    const confirmed = await showConfirm({
      title: "Reset Settings",
      message: "Are you sure you want to reset all settings to their default values? This action cannot be undone.",
      confirmText: "Reset",
      type: "danger"
    });

    if (confirmed) {
      const success = await resetSettings();
      if (success) {
        showToast("Settings reset successfully", "success");
      } else {
        showToast("Failed to reset settings", "error");
      }
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export
    showToast("Export functionality coming soon", "info");
  };

  const handleImportData = () => {
    // TODO: Implement data import
    showToast("Import functionality coming soon", "info");
  };

  const handleChangeMasterPassword = () => {
    // TODO: Implement master password change
    showToast("Change master password functionality coming soon", "info");
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setNewCategoryColor("#3b82f6");
    setNewCategoryIcon("📁");
    setShowCategoryForm(true);
  };

  const handleEditCategory = (categoryId: string) => {
    const category = categories().find(c => c.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
      setNewCategoryName(category.name);
      setNewCategoryColor(category.color || "#3b82f6");
      setNewCategoryIcon(category.icon || "📁");
      setShowCategoryForm(true);
    }
  };

  const handleSaveCategory = async () => {
    const name = newCategoryName().trim();
    if (!name) {
      showToast("Category name is required", "error");
      return;
    }

    const categoryData: CreateCategory = {
      name,
      color: newCategoryColor(),
      icon: newCategoryIcon()
    };

    let success = false;
    if (editingCategory()) {
      success = await updateCategory(editingCategory()!, categoryData);
    } else {
      success = await createCategory(categoryData);
    }

    if (success) {
      showToast(`Category ${editingCategory() ? 'updated' : 'created'} successfully`, "success");
      setShowCategoryForm(false);
    } else {
      showToast(`Failed to ${editingCategory() ? 'update' : 'create'} category`, "error");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories().find(c => c.id === categoryId);
    if (!category) return;

    const confirmed = await showConfirm({
      title: "Delete Category",
      message: `Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`,
      confirmText: "Delete",
      type: "danger"
    });

    if (confirmed) {
      const success = await deleteCategory(categoryId);
      if (success) {
        showToast("Category deleted successfully", "success");
      } else {
        showToast("Failed to delete category", "error");
      }
    }
  };

  const commonIcons = ["📁", "🏦", "📧", "💼", "🛒", "🎬", "⚡", "👥", "🔒", "🌐", "📱", "💳"];

  return (
    <div class="view-container settings-view">
      {/* Header */}
      <div class="view-header">
        <div class="view-title">
          <svg class="view-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
          </svg>
          <h1>Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div class="settings-content">
        <div class="settings-tabs">
          <button 
            class={`tab ${activeTab() === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            class={`tab ${activeTab() === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            class={`tab ${activeTab() === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            class={`tab ${activeTab() === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div class="settings-panel">
          {/* General Tab */}
          <Show when={activeTab() === 'general'}>
            <div class="settings-section">
              <h3>General Settings</h3>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input
                    type="checkbox"
                    checked={settings().darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.currentTarget.checked)}
                  />
                  <span>Dark Mode</span>
                </label>
                <p class="setting-description">Enable dark theme for the application</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input
                    type="checkbox"
                    checked={settings().showPasswordsByDefault}
                    onChange={(e) => handleSettingChange('showPasswordsByDefault', e.currentTarget.checked)}
                  />
                  <span>Show Passwords by Default</span>
                </label>
                <p class="setting-description">Automatically reveal passwords in the list view</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">Data Management</label>
                <div class="setting-actions">
                  <button class="secondary-button" onClick={handleExportData}>
                    Export Data
                  </button>
                  <button class="secondary-button" onClick={handleImportData}>
                    Import Data
                  </button>
                </div>
                <p class="setting-description">Export or import your password data</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">Reset Settings</label>
                <button class="danger-button" onClick={handleResetSettings}>
                  Reset to Defaults
                </button>
                <p class="setting-description">Reset all settings to their default values</p>
              </div>
            </div>
          </Show>

          {/* Security Tab */}
          <Show when={activeTab() === 'security'}>
            <div class="settings-section">
              <h3>Security Settings</h3>
              
              <div class="setting-item">
                <label class="setting-label">
                  <input
                    type="checkbox"
                    checked={settings().autoLockEnabled}
                    onChange={(e) => handleSettingChange('autoLockEnabled', e.currentTarget.checked)}
                  />
                  <span>Auto-lock Vault</span>
                </label>
                <p class="setting-description">Automatically lock the vault after a period of inactivity</p>
              </div>

              <Show when={settings().autoLockEnabled}>
                <div class="setting-item">
                  <label class="setting-label">Auto-lock Time</label>
                  <select 
                    value={settings().autoLockTime} 
                    onChange={(e) => handleSettingChange('autoLockTime', parseInt(e.currentTarget.value))}
                    class="setting-select"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                  <p class="setting-description">Time before the vault automatically locks</p>
                </div>
              </Show>

              <div class="setting-item">
                <label class="setting-label">Master Password</label>
                <button class="secondary-button" onClick={handleChangeMasterPassword}>
                  Change Master Password
                </button>
                <p class="setting-description">Update your master password</p>
              </div>

              <div class="setting-item danger-zone">
                <label class="setting-label">Session</label>
                <button class="danger-button" onClick={handleLogout}>
                  Logout
                </button>
                <p class="setting-description">Sign out and lock the vault</p>
              </div>
            </div>
          </Show>

          {/* Categories Tab */}
          <Show when={activeTab() === 'categories'}>
            <div class="settings-section">
              <div class="section-header">
                <h3>Manage Categories</h3>
                <button class="primary-button" onClick={handleAddCategory}>
                  Add Category
                </button>
              </div>
              
              <div class="categories-list">
                <For each={categories()}>
                  {(category) => (
                    <div class="category-item">
                      <div class="category-info">
                        <span class="category-icon" style={{ color: category.color }}>
                          {category.icon}
                        </span>
                        <span class="category-name">{category.name}</span>
                      </div>
                      <div class="category-actions">
                        <button 
                          class="icon-button"
                          onClick={() => handleEditCategory(category.id)}
                          title="Edit category"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                          </svg>
                        </button>
                        <button 
                          class="icon-button danger"
                          onClick={() => handleDeleteCategory(category.id)}
                          title="Delete category"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* About Tab */}
          <Show when={activeTab() === 'about'}>
            <div class="settings-section">
              <h3>About Password Vault</h3>
              
              <div class="about-info">
                <div class="app-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                  </svg>
                </div>
                
                <h4>Password Vault</h4>
                <p class="version">Version 0.1.0</p>
                <p class="description">
                  A secure, desktop password manager built with Tauri and SolidJS. 
                  Your passwords are encrypted locally and never leave your device.
                </p>

                <div class="features-list">
                  <h5>Features:</h5>
                  <ul>
                    <li>🔒 End-to-end encryption</li>
                    <li>🔍 Fast search and filtering</li>
                    <li>⭐ Favorites and categories</li>
                    <li>🎯 Password generation</li>
                    <li>📱 Cross-platform support</li>
                    <li>🚫 No cloud storage required</li>
                  </ul>
                </div>

                <div class="links">
                  <a href="#" class="link-button">Documentation</a>
                  <a href="#" class="link-button">Report Issue</a>
                  <a href="#" class="link-button">Source Code</a>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* Category Form Modal */}
      <Show when={showCategoryForm()}>
        <div class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{editingCategory() ? 'Edit Category' : 'Add Category'}</h3>
              <button class="close-button" onClick={() => setShowCategoryForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategoryName()}
                  onInput={(e) => setNewCategoryName(e.currentTarget.value)}
                  placeholder="Enter category name"
                />
              </div>
              
              <div class="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={newCategoryColor()}
                  onInput={(e) => setNewCategoryColor(e.currentTarget.value)}
                />
              </div>
              
              <div class="form-group">
                <label>Icon</label>
                <div class="icon-picker">
                  <For each={commonIcons}>
                    {(icon) => (
                      <button
                        class={`icon-option ${newCategoryIcon() === icon ? 'selected' : ''}`}
                        onClick={() => setNewCategoryIcon(icon)}
                      >
                        {icon}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="secondary-button" onClick={() => setShowCategoryForm(false)}>
                Cancel
              </button>
              <button class="primary-button" onClick={handleSaveCategory}>
                {editingCategory() ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </Show>

      <ConfirmDialog />
    </div>
  );
};

export default SettingsView;
