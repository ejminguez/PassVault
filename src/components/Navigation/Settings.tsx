import { createSignal, Show } from "solid-js";
import { logout } from "../../store/auth";

interface SettingsProps {
  onClose?: () => void;
}

const Settings = (props: SettingsProps) => {
  const [activeTab, setActiveTab] = createSignal<'general' | 'security' | 'about'>('general');
  const [autoLockEnabled, setAutoLockEnabled] = createSignal(true);
  const [autoLockTime, setAutoLockTime] = createSignal(15); // minutes
  const [showPasswords, setShowPasswords] = createSignal(false);
  const [darkMode, setDarkMode] = createSignal(false);

  const handleLogout = async () => {
    await logout();
    props.onClose?.();
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log("Export data functionality to be implemented");
  };

  const handleImportData = () => {
    // TODO: Implement data import
    console.log("Import data functionality to be implemented");
  };

  const handleChangeMasterPassword = () => {
    // TODO: Implement master password change
    console.log("Change master password functionality to be implemented");
  };

  return (
    <div class="settings-overlay">
      <div class="settings-container">
        <div class="settings-header">
          <h2>Settings</h2>
          <button class="close-button" onClick={props.onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

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
              class={`tab ${activeTab() === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>

          <div class="settings-panel">
            <Show when={activeTab() === 'general'}>
              <div class="settings-section">
                <h3>General Settings</h3>
                
                <div class="setting-item">
                  <label class="setting-label">
                    <input
                      type="checkbox"
                      checked={darkMode()}
                      onChange={(e) => setDarkMode(e.currentTarget.checked)}
                    />
                    <span>Dark Mode</span>
                  </label>
                  <p class="setting-description">Enable dark theme for the application</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">
                    <input
                      type="checkbox"
                      checked={showPasswords()}
                      onChange={(e) => setShowPasswords(e.currentTarget.checked)}
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
              </div>
            </Show>

            <Show when={activeTab() === 'security'}>
              <div class="settings-section">
                <h3>Security Settings</h3>
                
                <div class="setting-item">
                  <label class="setting-label">
                    <input
                      type="checkbox"
                      checked={autoLockEnabled()}
                      onChange={(e) => setAutoLockEnabled(e.currentTarget.checked)}
                    />
                    <span>Auto-lock Vault</span>
                  </label>
                  <p class="setting-description">Automatically lock the vault after a period of inactivity</p>
                </div>

                <Show when={autoLockEnabled()}>
                  <div class="setting-item">
                    <label class="setting-label">Auto-lock Time</label>
                    <select 
                      value={autoLockTime()} 
                      onChange={(e) => setAutoLockTime(parseInt(e.currentTarget.value))}
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
                  <label class="setting-label">Danger Zone</label>
                  <button class="danger-button" onClick={handleLogout}>
                    Logout
                  </button>
                  <p class="setting-description">Sign out and lock the vault</p>
                </div>
              </div>
            </Show>

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
      </div>
    </div>
  );
};

export default Settings;
