import { Show } from "solid-js";
import type { PasswordEntry } from "../../types";
import { selectEntry, selectedEntry, toggleFavorite } from "../../store/passwords";
import { getCategoryByName } from "../../store/categories";

interface ItemCardProps {
  entry: PasswordEntry;
  onEdit?: (entry: PasswordEntry) => void;
  onToggleFavorite?: (id: string) => void;
  showFavoriteButton?: boolean;
  showCategory?: boolean;
}

const ItemCard = (props: ItemCardProps) => {
  const {
    entry,
    onEdit,
    onToggleFavorite,
    showFavoriteButton = true,
    showCategory = true
  } = props;

  const handleClick = () => {
    selectEntry(entry);
  };

  const handleEdit = (e: Event) => {
    e.stopPropagation();
    onEdit?.(entry);
  };

  const handleToggleFavorite = async (e: Event) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(entry.id);
    } else {
      await toggleFavorite(entry.id);
    }
  };

  const isSelected = () => selectedEntry()?.id === entry.id;

  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatUrl = (url?: string) => {
    if (!url) return '';
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getCategoryInfo = () => {
    if (!entry.category) return null;
    return getCategoryByName(entry.category);
  };

  const categoryInfo = () => getCategoryInfo();

  return (
    <div 
      class={`item-container ${isSelected() ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div class="item-content">
        <div class="item-image">
          {getInitials(entry.title)}
        </div>
        
        <div class="item-details">
          <div class="item-header">
            <p class="item-title">{entry.title}</p>
            <div class="item-actions">
              <Show when={showFavoriteButton}>
                <button
                  class={`favorite-button ${entry.is_favorite ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                  title={entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                  </svg>
                </button>
              </Show>
              
              <Show when={onEdit}>
                <button
                  class="edit-button"
                  onClick={handleEdit}
                  title="Edit password"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
              </Show>
            </div>
          </div>
          
          <p class="item-subtitle">
            {entry.username || formatUrl(entry.url) || 'No username'}
          </p>
          
          <Show when={entry.url}>
            <p class="item-url">{formatUrl(entry.url)}</p>
          </Show>
        </div>
      </div>
      
      <div class="item-footer">
        <Show when={showCategory && entry.category}>
          <div class="item-category">
            <Show when={categoryInfo()}>
              <span 
                class="category-icon" 
                style={{ color: categoryInfo()?.color }}
              >
                {categoryInfo()?.icon}
              </span>
            </Show>
            <span class="category-name">{entry.category}</span>
          </div>
        </Show>
        
        <Show when={entry.is_favorite}>
          <div class="favorite-indicator" title="Favorite">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
            </svg>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default ItemCard;
