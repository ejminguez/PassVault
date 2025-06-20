import { createSignal, createEffect, For, Show } from "solid-js";
import {
  entries,
  loadEntries,
  searchEntries,
  setSearchQuery,
  isLoading,
  error,
} from "../store/passwords";
import { logout } from "../store/auth";
import { currentView } from "../store/router";
import Sidebar from "../components/Navigation/Sidebar";
import Header from "../components/Navigation/Header";
import ItemCard from "../components/ui/ItemCard";
import PasswordForm from "../components/ui/PasswordForm";
import PasswordDetails from "../components/ui/PasswordDetails";
import FavoritesView from "./FavoritesView";
import CategoryView from "./CategoryView";
import SettingsView from "./SettingsView";
import type { PasswordEntry } from "../types";

const Dashboard = () => {
  const [showAddForm, setShowAddForm] = createSignal(false);
  const [editingEntry, setEditingEntry] = createSignal<PasswordEntry | null>(
    null,
  );

  // Load entries on component mount
  createEffect(() => {
    loadEntries();
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchEntries(query);
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

  const handleLogout = async () => {
    await logout();
  };

  // All Items View (default)
  const AllItemsView = () => (
    <div class="view-container">
      {/* Header */}
      <Header
        title="All Items"
        onSearch={handleSearch}
        onAddNew={handleAddNew}
      />

      {/* Content */}
      <div class="view-content">
        <Show when={isLoading()}>
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading passwords...</p>
          </div>
        </Show>

        <Show when={error()}>
          <div class="error-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,7A2,2 0 0,0 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9A2,2 0 0,0 12,7M12,17.5A1.5,1.5 0 0,1 10.5,16A1.5,1.5 0 0,1 12,14.5A1.5,1.5 0 0,1 13.5,16A1.5,1.5 0 0,1 12,17.5Z" />
            </svg>
            <h3>Error Loading Passwords</h3>
            <p>{error()}</p>
          </div>
        </Show>

        <Show when={!isLoading() && entries().length === 0}>
          <div class="empty-state">
            <svg
              class="empty-icon"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
            <h3>No Passwords Found</h3>
            <p>Get started by adding your first password to the vault.</p>
            <button class="primary-button" onClick={handleAddNew}>
              Add Your First Password
            </button>
          </div>
        </Show>
        <div class="view-content-inner">
          <div class="entries">
            <Show when={!isLoading() && entries().length > 0}>
              <div class="entries-grid">
                <For each={entries()}>
                  {(entry) => <ItemCard entry={entry} onEdit={handleEdit} />}
                </For>
              </div>
            </Show>
          </div>

          {/* Password Details Panel */}
          <div class="details-panel">
            <PasswordDetails onEdit={handleEdit} />
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <Show when={showAddForm()}>
        <PasswordForm
          onClose={handleCloseForm}
          onSave={() => {
            loadEntries();
            handleCloseForm();
          }}
        />
      </Show>

      <Show when={editingEntry()}>
        <PasswordForm
          entry={editingEntry()!}
          onClose={handleCloseForm}
          onSave={() => {
            loadEntries();
            handleCloseForm();
          }}
        />
      </Show>
    </div>
  );

  return (
    <section class="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <div class="main-content">
        <Show when={currentView() === "all"}>
          <AllItemsView />
        </Show>

        <Show when={currentView() === "favorites"}>
          <FavoritesView />
        </Show>

        <Show when={currentView() === "category"}>
          <CategoryView />
        </Show>

        <Show when={currentView() === "settings"}>
          <SettingsView />
        </Show>
      </div>
    </section>
  );
};

export default Dashboard;
