import { createEffect, Show } from "solid-js";
import { authState, initializeAuth, isLoading } from "./store/auth";
import Setup from "./components/Auth/Setup";
import LoginComponent from "./components/Auth/LoginComponent";
import Dashboard from "./views/Dashboard";
import ErrorBoundary from "./components/StateFeedback/ErrorBoundary";
import { ToastContainer } from "./components/StateFeedback/Toast";
import "./App.scss";

function App() {
  // Initialize auth state on app start
  createEffect(() => {
    initializeAuth();
  });

  return (
    <ErrorBoundary>
      <main class="app">
        <Show when={isLoading()}>
          <div class="loading-screen">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </Show>

        <Show when={!isLoading()}>
          <Show 
            when={authState().isAuthenticated}
            fallback={
              <Show 
                when={authState().hasMasterPassword}
                fallback={<Setup />}
              >
                <LoginComponent />
              </Show>
            }
          >
            <Dashboard />
          </Show>
        </Show>

        {/* Global Toast Container */}
        <ToastContainer />
      </main>
    </ErrorBoundary>
  );
}

export default App;
