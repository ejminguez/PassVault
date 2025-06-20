import { createSignal, Show } from "solid-js";
import { deleteEntry, selectedEntry, selectEntry } from "../../store/passwords";
import type { PasswordEntry } from "../../types";

interface PasswordDetailsProps {
  onEdit: (entry: PasswordEntry) => void;
}

const PasswordDetails = (props: PasswordDetailsProps) => {
  const [showPassword, setShowPassword] = createSignal(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);

  const entry = selectedEntry;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleDelete = async () => {
    const currentEntry = entry();
    if (!currentEntry) return;

    const success = await deleteEntry(currentEntry.id);
    if (success) {
      setShowDeleteConfirm(false);
      selectEntry(null); // Clear selection
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <Show when={entry()} fallback={
      <div class="password-details-empty">
        <p>Select an entry to view details</p>
      </div>
    }>
      {(currentEntry) => (
        <div class="password-details">
          <div class="details-header">
            <h2>{currentEntry().title}</h2>
            <div class="details-actions">
              <button 
                class="edit-button"
                onClick={() => props.onEdit(currentEntry())}
              >
                Edit
              </button>
              <button 
                class="delete-button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </div>
          </div>

          <div class="details-content">
            <div class="detail-field">
              <label>Username/Email</label>
              <div class="field-value">
                <span>{currentEntry().username || "Not set"}</span>
                {currentEntry().username && (
                  <button 
                    class="copy-button"
                    onClick={() => copyToClipboard(currentEntry().username, "Username")}
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>

            <div class="detail-field">
              <label>Password</label>
              <div class="field-value">
                <span class="password-field">
                  {showPassword() ? currentEntry().password : "••••••••"}
                </span>
                <button 
                  class="toggle-button"
                  onClick={() => setShowPassword(!showPassword())}
                >
                  {showPassword() ? "Hide" : "Show"}
                </button>
                <button 
                  class="copy-button"
                  onClick={() => copyToClipboard(currentEntry().password, "Password")}
                >
                  Copy
                </button>
              </div>
            </div>

            {currentEntry().url && (
              <div class="detail-field">
                <label>Website</label>
                <div class="field-value">
                  <a 
                    href={formatUrl(currentEntry().url!)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {currentEntry().url}
                  </a>
                  <button 
                    class="copy-button"
                    onClick={() => copyToClipboard(currentEntry().url!, "URL")}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {currentEntry().category && (
              <div class="detail-field">
                <label>Category</label>
                <div class="field-value">
                  <span class="category-tag">{currentEntry().category}</span>
                </div>
              </div>
            )}

            {currentEntry().notes && (
              <div class="detail-field">
                <label>Notes</label>
                <div class="field-value">
                  <p class="notes-text">{currentEntry().notes}</p>
                </div>
              </div>
            )}

            <div class="detail-field">
              <label>Created</label>
              <div class="field-value">
                <span>{formatDate(currentEntry().created_at)}</span>
              </div>
            </div>

            <div class="detail-field">
              <label>Last Modified</label>
              <div class="field-value">
                <span>{formatDate(currentEntry().updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <Show when={showDeleteConfirm()}>
            <div class="modal-overlay">
              <div class="modal">
                <h3>Delete Entry</h3>
                <p>Are you sure you want to delete "{currentEntry().title}"? This action cannot be undone.</p>
                <div class="modal-actions">
                  <button 
                    class="cancel-button"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    class="delete-confirm-button"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
};

export default PasswordDetails;
