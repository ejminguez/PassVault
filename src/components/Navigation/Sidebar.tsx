import { For, Show, createSignal } from "solid-js";
import { 
  currentView, 
  navigateToAll, 
  navigateToFavorites, 
  navigateToCategory, 
  navigateToSettings 
} from "../../store/router";
import { categories } from "../../store/categories";
import { entries, getFavoriteEntries, getEntriesByCategory } from "../../store/passwords";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = (props: SidebarProps) => {
  const [showCategories, setShowCategories] = createSignal(true);

  const getEntryCount = () => entries().length;
  const getFavoriteCount = () => getFavoriteEntries().length;
  const getCategoryCount = (categoryName: string) => getEntriesByCategory(categoryName).length;

  return (
    <div class="sidebar-container">
      <div class="sidebar-header">
        <h2>Password Vault</h2>
      </div>
      
      <nav class="sidebar-nav">
        {/* Main Navigation */}
        <ul class="sidebar-items">
          <li class={`sidebar-item ${currentView() === 'all' ? 'active' : ''}`}>
            <button onClick={navigateToAll} class="sidebar-button">
              <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
              </svg>
              <span>All Items</span>
              <span class="item-count">{getEntryCount()}</span>
            </button>
          </li>
          
          <li class={`sidebar-item ${currentView() === 'favorites' ? 'active' : ''}`}>
            <button onClick={navigateToFavorites} class="sidebar-button">
              <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <span>Favorites</span>
              <Show when={getFavoriteCount() > 0}>
                <span class="item-count">{getFavoriteCount()}</span>
              </Show>
            </button>
          </li>
        </ul>

        {/* Categories Section */}
        <div class="sidebar-section">
          <div class="sidebar-section-header">
            <button 
              class="section-toggle"
              onClick={() => setShowCategories(!showCategories())}
            >
              <svg 
                class={`toggle-icon ${showCategories() ? 'expanded' : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
              </svg>
              <span>Categories</span>
            </button>
          </div>

          <Show when={showCategories()}>
            <ul class="sidebar-subcategories">
              <For each={categories()}>
                {(category) => (
                  <li class={`sidebar-item subcategory ${
                    currentView() === 'category' && 
                    window.location.hash.includes(category.id) ? 'active' : ''
                  }`}>
                    <button 
                      onClick={() => navigateToCategory(category.id)} 
                      class="sidebar-button"
                    >
                      <span class="category-icon" style={{ color: category.color }}>
                        {category.icon}
                      </span>
                      <span>{category.name}</span>
                      <Show when={getCategoryCount(category.name) > 0}>
                        <span class="item-count">{getCategoryCount(category.name)}</span>
                      </Show>
                    </button>
                  </li>
                )}
              </For>
              
              {/* Show uncategorized if there are any */}
              <Show when={entries().some(e => !e.category)}>
                <li class="sidebar-item subcategory">
                  <button 
                    onClick={() => navigateToCategory('uncategorized')} 
                    class="sidebar-button"
                  >
                    <span class="category-icon">📁</span>
                    <span>Uncategorized</span>
                    <span class="item-count">
                      {entries().filter(e => !e.category).length}
                    </span>
                  </button>
                </li>
              </Show>
            </ul>
          </Show>
        </div>

        {/* Settings */}
        <ul class="sidebar-items sidebar-bottom">
          <li class={`sidebar-item ${currentView() === 'settings' ? 'active' : ''}`}>
            <button onClick={navigateToSettings} class="sidebar-button">
              <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
              </svg>
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-button" onClick={props.onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
