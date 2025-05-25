import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  async function password_show() {
    setShowPassword(await invoke("password_show", { password: password() }));
  }

  return (
    <main class="container">
      <h1>Welcome, {greetMsg()}!</h1>
      <p>This is a password manager.</p>

      <form
        class="row"
        onSubmit={async (e) => {
          e.preventDefault();
          await greet();
          await password_show();
        }}
      >
        <div>
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
            class="inputs"
            autocomplete="name"
          />
          <input
            id="password-input"
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Enter a password..."
            class="inputs"
            type="password"
            autocomplete="current-password"
          />
        </div>

        <button type="submit">Greet</button>
      </form>
      <p>Your password: {showPassword()}</p>
    </main>
  );
}

export default App;
