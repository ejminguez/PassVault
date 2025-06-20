import { createSignal } from "solid-js";
import { login, isLoading, error, clearError } from "../../store/auth";

const LoginComponent = () => {
  const [password, setPassword] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    clearError();

    const pwd = password();
    if (!pwd) return;

    const success = await login(pwd);
    if (success) {
      // Login successful, the auth state will handle navigation
      console.log("Login successful");
    }
  };

  return (
    <section class="login-container">
      <div class="login-form">
        <h1>Unlock Your Vault</h1>
        <p>Enter your master password to access your passwords.</p>
        
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="master-password">Master Password</label>
            <input
              id="master-password"
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="Enter your master password"
              required
              autofocus
            />
          </div>

          {error() && (
            <div class="error-message">{error()}</div>
          )}

          <button 
            type="submit" 
            disabled={isLoading() || !password()}
            class="login-button"
          >
            {isLoading() ? "Unlocking..." : "Unlock Vault"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginComponent;
