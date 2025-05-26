# 🤝 Contributing to [VaultName] 🔐

Thanks for checking out the project — you're awesome! 🎉  
This app is a secure, offline-first password vault built with **SolidJS**, **Tauri**, **SQLite**, and **Rust**. We value **clean code**, **minimalism**, and **security-first thinking**.

---


## 🛠️ Local Setup

1. **Clone the repo**

```bash
git clone https://github.com/ejminguez/PassVault.git
cd your-vault-app

```
cd src
npm install
```

#### Run Frontend
```
npm run dev
```

#### Run Backend
```
cargo tauri dev
```

## 🧱 Project Structure
```
├── src/                # SolidJS frontend
│   ├── components/     # UI Components
│   ├── routes/         # App views

│   ├── utils/          # Helpers, password gen, etc.
│   └── App.tsx         # Main entry point
├── src-tauri/          # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs     # Tauri setup
│   │   ├── crypto.rs   # Argon2 hashing, AES logic

│   │   ├── db.rs       # SQLite CRUD

│   │   └── commands.rs # Tauri commands exposed to frontend
└── tauri.conf.json     # Tauri configuration

## 🎨 Code Style Guide
#### Frontend (SolidJS + Vanilla CSS)
- Use functional components.
- Keep components small and reusable.
- Use camelCase for variables, PascalCase for components.
- Use vanilla CSS, or inline styles. Avoid bloated frameworks.

#### Backend (Rust)
- Keep functions small and named clearly.
- Use Result<T, String> for errors returned to the frontend.
- Keep sensitive operations like hashing & encryption in crypto.rs.

## ✅ Commit Message Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 
```
feat: add password strength meter
fix: handle unlock error on empty input
refactor: extract encryption logic to utils
docs: update README and CONTRIBUTION
```

## 🧪 Submitting a Pull Request
1. Fork and clone the repo.
2. Create a new branch: git checkout -b feat/my-cool-thing
3. Make your changes.
4. Test your feature.
5. Commit using conventional messages.
6. Push and open a pull request!

## 🔐 Security Guidelines
Since this is a password vault:
- Never log sensitive data (e.g., passwords, keys).
- Hash passwords using Argon2, not MD5/SHA1/etc.
- All passwords should be encrypted before being written to SQLite.
- Never expose Tauri commands that could be abused.

## 💬 Questions?
Open an issue or start a discussion. We’re building this for fun, learning, and the love of minimal secure apps.
Stay safe, stay curious 🧠✨
— ejminguez 🔐
