import { createSignal, createEffect, For, Show } from "solid-js";
import { getFavoriteEntries, toggleFavorite, isLoading, error } from "../store/passwords";
import ItemCard from "../components/ui/ItemCard";
import PasswordForm from "../components/ui/PasswordForm";
import PasswordDetails from "../components/ui/PasswordDetails";
import { showToast } from "../components/StateFeedback/Toast";
import type { PasswordEntry } from "../types";

const FavoritesView = () => {
  const [showAddForm, setShowAddForm] = createSignal(false);
  const [editingEntry, setEditingEntry] = createSignal<PasswordEntry | null>(null);

  const favoriteEntries = () => getFavoriteEntries();

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleEdit = (entry: PasswordEntry) => {
    setEditingEntry(entry);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingEntry(null);
  };

  const handleToggleFavorite = async (id: string) => {
    const success = await toggleFavorite(id);
    if (success) {
      showToast("Favorite status updated", "success");
    } else {
      showToast("Failed to update favorite status", "error");
    }
  };

  return (
    <div class="view-container">
      {/* Header */}
      <div class="view-header">
        <div class="view-title">
          <svg class="view-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
          </svg>
          <h1>Favorites</h1>
          <span class="entry-count">({favoriteEntries().length})</span>
        </div>
        
        <button class="add-button" onClick={handleAddNew}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Add New
        </button>
      </div>

      {/* Content */}
      <div class="view-content">
        <Show when={isLoading()}>
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading favorites...</p>
          </div>
        </Show>

        <Show when={error()}>
          <div class="error-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,7A2,2 0 0,0 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9A2,2 0 0,0 12,7M12,17.5A1.5,1.5 0 0,1 10.5,16A1.5,1.5 0 0,1 12,14.5A1.5,1.5 0 0,1 13.5,16A1.5,1.5 0 0,1 12,17.5Z" />
            </svg>
            <h3>Error Loading Favorites</h3>
            <p>{error()}</p>
          </div>
        </Show>

        <Show when={!isLoading() && favoriteEntries().length === 0}>
          <div class="empty-state">
            <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
            </svg>
            <h3>No Favorites Yet</h3>
            <p>Mark passwords as favorites to see them here. Click the star icon on any password entry to add it to your favorites.</p>
            <button class="primary-button" onClick={handleAddNew}>
              Add Your First Password
            </button>
          </div>
        </Show>

        <Show when={!isLoading() && favoriteEntries().length > 0}>
          <div class="entries-grid">
            <For each={favoriteEntries()}>
              {(entry) => (
                <ItemCard 
                  entry={entry} 
                  onEdit={handleEdit}
                  onToggleFavorite={handleToggleFavorite}
                  showFavoriteButton={true}
                />
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Password Details Panel */}
      <div class="details-panel">
        <PasswordDetails onEdit={handleEdit} />
      </div>

      {/* Add/Edit Form Modal */}
      <Show when={showAddForm()}>
        <PasswordForm 
          onClose={handleCloseForm}
          onSave={handleCloseForm}
          defaultFavorite={true}
        />
      </Show>

      <Show when={editingEntry()}>
        <PasswordForm 
          entry={editingEntry()!}
          onClose={handleCloseForm}
          onSave={handleCloseForm}
        />
      </Show>
    </div>
  );
};

export default FavoritesView;
