import { createSignal, createEffect, For, Show } from "solid-js";
import { getEntriesByCategory, getUncategorizedEntries, isLoading, error } from "../store/passwords";
import { getCategoryById } from "../store/categories";
import { getSelectedCategory } from "../store/router";
import ItemCard from "../components/ui/ItemCard";
import PasswordForm from "../components/ui/PasswordForm";
import PasswordDetails from "../components/ui/PasswordDetails";
import { showToast } from "../components/StateFeedback/Toast";
import type { PasswordEntry } from "../types";

const CategoryView = () => {
  const [showAddForm, setShowAddForm] = createSignal(false);
  const [editingEntry, setEditingEntry] = createSignal<PasswordEntry | null>(null);

  const selectedCategoryId = () => getSelectedCategory();
  const category = () => selectedCategoryId() ? getCategoryById(selectedCategoryId()!) : null;
  
  const categoryEntries = () => {
    const categoryId = selectedCategoryId();
    if (!categoryId) return [];
    
    if (categoryId === 'uncategorized') {
      return getUncategorizedEntries();
    }
    
    const cat = getCategoryById(categoryId);
    return cat ? getEntriesByCategory(cat.name) : [];
  };

  const getCategoryTitle = () => {
    const categoryId = selectedCategoryId();
    if (categoryId === 'uncategorized') {
      return 'Uncategorized';
    }
    return category()?.name || 'Category';
  };

  const getCategoryIcon = () => {
    const categoryId = selectedCategoryId();
    if (categoryId === 'uncategorized') {
      return '📁';
    }
    return category()?.icon || '📁';
  };

  const getCategoryColor = () => {
    const categoryId = selectedCategoryId();
    if (categoryId === 'uncategorized') {
      return '#64748b';
    }
    return category()?.color || '#64748b';
  };

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

  return (
    <div class="view-container">
      {/* Header */}
      <div class="view-header">
        <div class="view-title">
          <span 
            class="view-icon category-icon" 
            style={{ color: getCategoryColor() }}
          >
            {getCategoryIcon()}
          </span>
          <h1>{getCategoryTitle()}</h1>
          <span class="entry-count">({categoryEntries().length})</span>
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
            <p>Loading {getCategoryTitle().toLowerCase()}...</p>
          </div>
        </Show>

        <Show when={error()}>
          <div class="error-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,7A2,2 0 0,0 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9A2,2 0 0,0 12,7M12,17.5A1.5,1.5 0 0,1 10.5,16A1.5,1.5 0 0,1 12,14.5A1.5,1.5 0 0,1 13.5,16A1.5,1.5 0 0,1 12,17.5Z" />
            </svg>
            <h3>Error Loading Category</h3>
            <p>{error()}</p>
          </div>
        </Show>

        <Show when={!isLoading() && categoryEntries().length === 0}>
          <div class="empty-state">
            <span 
              class="empty-icon category-icon" 
              style={{ color: getCategoryColor(), "font-size": "4rem" }}
            >
              {getCategoryIcon()}
            </span>
            <h3>No {getCategoryTitle()} Passwords</h3>
            <p>
              {selectedCategoryId() === 'uncategorized' 
                ? "No uncategorized passwords found. Organize your passwords by assigning them to categories."
                : `No passwords in the ${getCategoryTitle()} category yet. Add some passwords to get started.`
              }
            </p>
            <button class="primary-button" onClick={handleAddNew}>
              Add Password to {getCategoryTitle()}
            </button>
          </div>
        </Show>

        <Show when={!isLoading() && categoryEntries().length > 0}>
          <div class="entries-grid">
            <For each={categoryEntries()}>
              {(entry) => (
                <ItemCard 
                  entry={entry} 
                  onEdit={handleEdit}
                  showCategory={false}
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
          defaultCategory={selectedCategoryId() !== 'uncategorized' ? category()?.name : undefined}
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

export default CategoryView;
