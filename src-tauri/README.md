# Password Vault Backend

A secure Rust backend for the Tauri password manager application.

## Architecture

### Modules

- **crypto.rs**: Handles encryption/decryption using AES-256-GCM and password hashing with Argon2
- **db.rs**: SQLite database operations with encrypted storage
- **commands.rs**: Tauri commands exposed to the frontend
- **lib.rs**: Main application setup and initialization

### Security Features

- **Master Password**: Argon2 hashing with salt
- **Encryption**: AES-256-GCM for sensitive data
- **Key Derivation**: Argon2 for deriving encryption keys from master password
- **Secure Storage**: All passwords and sensitive data encrypted at rest

### Available Commands

- `setup_master_password(password)` - Set initial master password
- `verify_master_password(password)` - Authenticate user
- `has_master_password()` - Check if master password exists
- `create_password_entry(entry)` - Add new password entry
- `get_all_entries()` - Retrieve all password entries
- `get_entry_by_id(id)` - Get specific entry
- `update_password_entry(id, update)` - Update existing entry
- `delete_password_entry(id)` - Delete entry
- `search_entries(query)` - Search entries by title/category
- `generate_password(length, include_symbols)` - Generate secure password
- `logout()` - Clear session

### Database Schema

**master_passwords**
- id (PRIMARY KEY)
- password_hash (Argon2 hash)
- salt (Base64 encoded)
- created_at

**password_entries**
- id (UUID)
- title (plaintext)
- username_encrypted (AES encrypted)
- password_encrypted (AES encrypted)
- url_encrypted (AES encrypted, optional)
- notes_encrypted (AES encrypted, optional)
- category (plaintext, optional)
- created_at
- updated_at

## Usage

The backend automatically initializes the SQLite database in the app's data directory and creates necessary tables on first run.
