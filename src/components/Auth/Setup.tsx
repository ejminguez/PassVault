import { createSignal } from "solid-js";
import { setupMasterPassword, isLoading, error, clearError } from "../../store/auth";

const Setup = () => {
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [validationError, setValidationError] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    clearError();
    setValidationError("");

    const pwd = password();
    const confirmPwd = confirmPassword();

    // Validation
    if (pwd.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    if (pwd !== confirmPwd) {
      setValidationError("Passwords do not match");
      return;
    }

    const success = await setupMasterPassword(pwd);
    if (success) {
      // Setup successful, the auth state will handle navigation
      console.log("Master password setup successful");
    }
  };

  return (
    <section class="setup-container">
      <div class="setup-form">
        <h1>Setup Master Password</h1>
        <p>Create a strong master password to secure your vault. This password will be used to encrypt all your data.</p>
        
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="password">Master Password</label>
            <input
              id="password"
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="Enter master password"
              required
              minLength={8}
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              placeholder="Confirm master password"
              required
              minLength={8}
            />
          </div>

          {validationError() && (
            <div class="error-message">{validationError()}</div>
          )}

          {error() && (
            <div class="error-message">{error()}</div>
          )}

          <button 
            type="submit" 
            disabled={isLoading() || !password() || !confirmPassword()}
            class="setup-button"
          >
            {isLoading() ? "Setting up..." : "Create Master Password"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Setup;