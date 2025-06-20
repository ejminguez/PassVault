import { createSignal, Show } from "solid-js";
import { logout } from "../../store/auth";
import { searchQuery, setSearchQuery } from "../../store/passwords";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onAddNew?: () => void;
  showSearch?: boolean;
  showAddButton?: boolean;
  title?: string;
}

const Header = (props: HeaderProps = {}) => {
  const [showUserMenu, setShowUserMenu] = createSignal(false);
  const [localSearchQuery, setLocalSearchQuery] = createSignal("");

  const {
    onSearch,
    onAddNew,
    showSearch = true,
    showAddButton = true,
    title = "Password Vault"
  } = props;

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu());
  };

  return (
    <header class="header-container">
      <div class="header-content">
        {/* Left section - Logo and title */}
        <div class="header-left">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
          </div>
          <h1 class="header-title">{title}</h1>
        </div>

        {/* Center section - Search */}
        <Show when={showSearch}>
          <div class="header-center">
            <div class="search-container">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
              <input
                type="text"
                placeholder="Search passwords..."
                value={localSearchQuery()}
                onInput={(e) => handleSearch(e.currentTarget.value)}
                class="search-input"
              />
              <Show when={localSearchQuery()}>
                <button 
                  class="clear-search"
                  onClick={() => handleSearch("")}
                  title="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
              </Show>
            </div>
          </div>
        </Show>

        {/* Right section - Actions and user menu */}
        <div class="header-right">
          <Show when={showAddButton}>
            <button class="add-button" onClick={onAddNew} title="Add new password">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              <span>Add New</span>
            </button>
          </Show>

          <div class="user-menu-container">
            <button class="user-menu-trigger" onClick={toggleUserMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </button>

            <Show when={showUserMenu()}>
              <div class="user-menu-dropdown">
                <div class="user-menu-item">
                  <button onClick={() => setShowUserMenu(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                    </svg>
                    Settings
                  </button>
                </div>
                <div class="user-menu-divider"></div>
                <div class="user-menu-item">
                  <button onClick={handleLogout} class="logout-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
