import { createSignal, createEffect } from "solid-js";
import { login, isLoading, error, clearError } from "../../store/auth";

interface LockscreenProps {
  onUnlock?: () => void;
  autoLockTimeout?: number; // in minutes
}

const Lockscreen = (props: LockscreenProps) => {
  const [password, setPassword] = createSignal("");
  const [attempts, setAttempts] = createSignal(0);
  const [isBlocked, setIsBlocked] = createSignal(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = createSignal(0);

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 300; // 5 minutes in seconds

  // Handle failed attempts and blocking
  createEffect(() => {
    if (attempts() >= MAX_ATTEMPTS && !isBlocked()) {
      setIsBlocked(true);
      setBlockTimeRemaining(BLOCK_DURATION);
      
      const interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsBlocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (isBlocked()) return;
    
    clearError();
    const pwd = password();
    if (!pwd) return;

    const success = await login(pwd);
    if (success) {
      setAttempts(0);
      setPassword("");
      props.onUnlock?.();
    } else {
      setAttempts(prev => prev + 1);
      setPassword("");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section class="lockscreen-container">
      <div class="lockscreen-overlay">
        <div class="lockscreen-content">
          <div class="lockscreen-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10A2,2 0 0,1 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
          </div>
          
          <h1>Vault Locked</h1>
          <p>Enter your master password to unlock your vault</p>
          
          <form onSubmit={handleSubmit} class="lockscreen-form">
            <div class="form-group">
              <input
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                placeholder="Master password"
                disabled={isBlocked() || isLoading()}
                autofocus
                class="lockscreen-input"
              />
            </div>

            {isBlocked() && (
              <div class="block-message">
                <p>Too many failed attempts. Try again in {formatTime(blockTimeRemaining())}</p>
              </div>
            )}

            {attempts() > 0 && attempts() < MAX_ATTEMPTS && !isBlocked() && (
              <div class="attempts-warning">
                <p>Invalid password. {MAX_ATTEMPTS - attempts()} attempts remaining.</p>
              </div>
            )}

            {error() && !isBlocked() && (
              <div class="error-message">{error()}</div>
            )}

            <button 
              type="submit" 
              disabled={isBlocked() || isLoading() || !password()}
              class="unlock-button"
            >
              {isLoading() ? "Unlocking..." : "Unlock Vault"}
            </button>
          </form>

          <div class="lockscreen-footer">
            <p>Password Vault - Secure Password Manager</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Lockscreen;
