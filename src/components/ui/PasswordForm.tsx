import { createSignal, createEffect, For } from "solid-js";
import { createEntry, updateEntry, generatePassword, isLoading, error, clearError } from "../../store/passwords";
import { categories } from "../../store/categories";
import type { PasswordEntry, CreatePasswordEntry, UpdatePasswordEntry } from "../../types";

interface PasswordFormProps {
  entry?: PasswordEntry;
  onClose: () => void;
  onSave?: () => void;
  defaultCategory?: string;
  defaultFavorite?: boolean;
}

const PasswordForm = (props: PasswordFormProps) => {
  const [formData, setFormData] = createSignal({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
    category: props.defaultCategory || "",
    is_favorite: props.defaultFavorite || false,
  });

  const [showPassword, setShowPassword] = createSignal(false);
  const [validationError, setValidationError] = createSignal("");

  // Initialize form with existing entry data if editing
  createEffect(() => {
    if (props.entry) {
      setFormData({
        title: props.entry.title,
        username: props.entry.username,
        password: props.entry.password,
        url: props.entry.url || "",
        notes: props.entry.notes || "",
        category: props.entry.category || "",
        is_favorite: props.entry.is_favorite || false,
      });
    }
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePassword = async () => {
    const newPassword = await generatePassword(16, true);
    if (newPassword) {
      updateField("password", newPassword);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    clearError();
    setValidationError("");

    const data = formData();

    // Validation
    if (!data.title.trim()) {
      setValidationError("Title is required");
      return;
    }

    if (!data.password.trim()) {
      setValidationError("Password is required");
      return;
    }

    let success = false;

    if (props.entry) {
      // Update existing entry
      const updateData: UpdatePasswordEntry = {};
      if (data.title !== props.entry.title) updateData.title = data.title;
      if (data.username !== props.entry.username) updateData.username = data.username;
      if (data.password !== props.entry.password) updateData.password = data.password;
      if (data.url !== (props.entry.url || "")) updateData.url = data.url || undefined;
      if (data.notes !== (props.entry.notes || "")) updateData.notes = data.notes || undefined;
      if (data.category !== (props.entry.category || "")) updateData.category = data.category || undefined;
      if (data.is_favorite !== (props.entry.is_favorite || false)) updateData.is_favorite = data.is_favorite;

      success = await updateEntry(props.entry.id, updateData);
    } else {
      // Create new entry
      const createData: CreatePasswordEntry = {
        title: data.title,
        username: data.username,
        password: data.password,
        url: data.url || undefined,
        notes: data.notes || undefined,
        category: data.category || undefined,
        is_favorite: data.is_favorite,
      };

      success = await createEntry(createData);
    }

    if (success) {
      props.onSave?.();
      props.onClose();
    }
  };

  const isEditing = () => !!props.entry;

  return (
    <div class="password-form-overlay">
      <div class="password-form">
        <div class="form-header">
          <h2>{isEditing() ? "Edit Entry" : "Add New Entry"}</h2>
          <button class="close-button" onClick={props.onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="form-row">
            <div class="form-group">
              <label for="title">Title *</label>
              <input
                id="title"
                type="text"
                value={formData().title}
                onInput={(e) => updateField("title", e.currentTarget.value)}
                placeholder="e.g., Facebook, Gmail, Bank Account"
                required
              />
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData().is_favorite}
                  onChange={(e) => updateField("is_favorite", e.currentTarget.checked)}
                />
                <span class="checkbox-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                  </svg>
                  Add to Favorites
                </span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="username">Username/Email</label>
            <input
              id="username"
              type="text"
              value={formData().username}
              onInput={(e) => updateField("username", e.currentTarget.value)}
              placeholder="Enter username or email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password *</label>
            <div class="password-input-group">
              <input
                id="password"
                type={showPassword() ? "text" : "password"}
                value={formData().password}
                onInput={(e) => updateField("password", e.currentTarget.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                class="input-button toggle-password"
                onClick={() => setShowPassword(!showPassword())}
                title={showPassword() ? "Hide password" : "Show password"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  {showPassword() ? (
                    <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
                  ) : (
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                  )}
                </svg>
              </button>
              <button
                type="button"
                class="input-button generate-password"
                onClick={handleGeneratePassword}
                title="Generate secure password"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,6V9L16,5L12,1V4A8,8 0 0,0 4,12C4,13.57 4.46,15.03 5.24,16.26L6.7,14.8C6.25,13.97 6,13 6,12A6,6 0 0,1 12,6M18.76,7.74L17.3,9.2C17.74,10.04 18,11 18,12A6,6 0 0,1 12,18V15L8,19L12,23V20A8,8 0 0,0 20,12C20,10.43 19.54,8.97 18.76,7.74Z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="url">Website URL</label>
              <input
                id="url"
                type="url"
                value={formData().url}
                onInput={(e) => updateField("url", e.currentTarget.value)}
                placeholder="https://example.com"
              />
            </div>

            <div class="form-group">
              <label for="category">Category</label>
              <select
                id="category"
                value={formData().category}
                onChange={(e) => updateField("category", e.currentTarget.value)}
              >
                <option value="">Select category</option>
                <For each={categories()}>
                  {(category) => (
                    <option value={category.name}>{category.icon} {category.name}</option>
                  )}
                </For>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              value={formData().notes}
              onInput={(e) => updateField("notes", e.currentTarget.value)}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          {validationError() && (
            <div class="error-message">{validationError()}</div>
          )}

          {error() && (
            <div class="error-message">{error()}</div>
          )}

          <div class="form-actions">
            <button type="button" onClick={props.onClose} class="cancel-button">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading()}
              class="save-button"
            >
              {isLoading() ? (
                <>
                  <svg class="spinner" width="16" height="16" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
                  </svg>
                  Saving...
                </>
              ) : (
                isEditing() ? "Update Entry" : "Save Entry"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordForm;
