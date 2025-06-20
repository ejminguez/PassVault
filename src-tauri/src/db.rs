use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePool, Row, SqlitePool as Pool};
use std::path::Path;
use thiserror::Error;
use uuid::Uuid;
use base64::Engine;
use crate::crypto::{CryptoService, EncryptedData};

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Database connection error: {0}")]
    ConnectionError(#[from] sqlx::Error),
    #[error("Encryption error: {0}")]
    EncryptionError(#[from] crate::crypto::CryptoError),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Base64 decode error: {0}")]
    Base64Error(#[from] base64::DecodeError),
    #[error("Date parsing error: {0}")]
    DateParsingError(String),
    #[error("Entry not found")]
    EntryNotFound,
    #[error("Invalid master password")]
    InvalidMasterPassword,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordEntry {
    pub id: String,
    pub title: String,
    pub username: String,
    pub password: String,
    pub url: Option<String>,
    pub notes: Option<String>,
    pub category: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedPasswordEntry {
    pub id: String,
    pub title: String,
    pub username_encrypted: String,
    pub password_encrypted: String,
    pub url_encrypted: Option<String>,
    pub notes_encrypted: Option<String>,
    pub category: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePasswordEntry {
    pub title: String,
    pub username: String,
    pub password: String,
    pub url: Option<String>,
    pub notes: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePasswordEntry {
    pub title: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub url: Option<String>,
    pub notes: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MasterPassword {
    pub id: i32,
    pub password_hash: String,
    pub salt: String,
    pub created_at: DateTime<Utc>,
}

pub struct Database {
    pool: Pool,
}

impl Database {
    /// Initialize the database connection and create tables
    pub async fn new(database_path: &str) -> Result<Self, DatabaseError> {
        // Ensure the directory exists
        if let Some(parent) = Path::new(database_path).parent() {
            tokio::fs::create_dir_all(parent).await.map_err(|e| {
                DatabaseError::ConnectionError(sqlx::Error::Io(e))
            })?;
        }

        // Use proper SQLite URL format with mode=rwc to create file if it doesn't exist
        let database_url = format!("sqlite:{}?mode=rwc", database_path);
        println!("Connecting to database: {}", database_url);
        
        let pool = SqlitePool::connect(&database_url).await?;
        
        let db = Database { pool };
        db.create_tables().await?;
        
        Ok(db)
    }

    /// Create necessary database tables
    async fn create_tables(&self) -> Result<(), DatabaseError> {
        // Create master_passwords table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS master_passwords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create password_entries table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS password_entries (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                username_encrypted TEXT NOT NULL,
                password_encrypted TEXT NOT NULL,
                url_encrypted TEXT,
                notes_encrypted TEXT,
                category TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Set the master password (only if none exists)
    pub async fn set_master_password(&self, password: &str) -> Result<(), DatabaseError> {
        // Check if master password already exists
        let existing = sqlx::query("SELECT COUNT(*) as count FROM master_passwords")
            .fetch_one(&self.pool)
            .await?;
        
        let count: i64 = existing.get("count");
        if count > 0 {
            return Err(DatabaseError::ConnectionError(sqlx::Error::RowNotFound));
        }

        let salt = CryptoService::generate_salt();
        let password_hash = CryptoService::hash_password(password)?;
        let salt_b64 = base64::engine::general_purpose::STANDARD.encode(&salt);
        let now = Utc::now();

        sqlx::query(
            "INSERT INTO master_passwords (password_hash, salt, created_at) VALUES (?, ?, ?)"
        )
        .bind(&password_hash)
        .bind(&salt_b64)
        .bind(now.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Verify the master password and return the encryption key
    pub async fn verify_master_password(&self, password: &str) -> Result<[u8; 32], DatabaseError> {
        let row = sqlx::query("SELECT password_hash, salt FROM master_passwords LIMIT 1")
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(row) => {
                let password_hash: String = row.get("password_hash");
                let salt_b64: String = row.get("salt");
                
                if !CryptoService::verify_password(password, &password_hash)? {
                    return Err(DatabaseError::InvalidMasterPassword);
                }

                let salt = base64::engine::general_purpose::STANDARD.decode(&salt_b64)?;
                let key = CryptoService::derive_key_from_password(password, &salt)?;
                
                Ok(key)
            }
            None => Err(DatabaseError::EntryNotFound),
        }
    }

    /// Check if master password is set
    pub async fn has_master_password(&self) -> Result<bool, DatabaseError> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM master_passwords")
            .fetch_one(&self.pool)
            .await?;
        
        let count: i64 = row.get("count");
        Ok(count > 0)
    }

    /// Create a new password entry
    pub async fn create_entry(
        &self,
        entry: CreatePasswordEntry,
        encryption_key: &[u8; 32],
    ) -> Result<String, DatabaseError> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();

        // Encrypt sensitive fields
        let username_encrypted = CryptoService::encrypt(&entry.username, encryption_key)?;
        let password_encrypted = CryptoService::encrypt(&entry.password, encryption_key)?;
        let url_encrypted = if let Some(url) = &entry.url {
            Some(CryptoService::encrypt(url, encryption_key)?)
        } else {
            None
        };
        let notes_encrypted = if let Some(notes) = &entry.notes {
            Some(CryptoService::encrypt(notes, encryption_key)?)
        } else {
            None
        };

        sqlx::query(
            r#"
            INSERT INTO password_entries 
            (id, title, username_encrypted, password_encrypted, url_encrypted, notes_encrypted, category, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(&entry.title)
        .bind(serde_json::to_string(&username_encrypted)?)
        .bind(serde_json::to_string(&password_encrypted)?)
        .bind(url_encrypted.as_ref().map(|u| serde_json::to_string(u)).transpose()?)
        .bind(notes_encrypted.as_ref().map(|n| serde_json::to_string(n)).transpose()?)
        .bind(&entry.category)
        .bind(now.to_rfc3339())
        .bind(now.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(id)
    }

    /// Get all password entries (decrypted)
    pub async fn get_all_entries(&self, encryption_key: &[u8; 32]) -> Result<Vec<PasswordEntry>, DatabaseError> {
        let rows = sqlx::query("SELECT * FROM password_entries ORDER BY title")
            .fetch_all(&self.pool)
            .await?;

        let mut entries = Vec::new();
        for row in rows {
            let entry = self.row_to_password_entry(row, encryption_key)?;
            entries.push(entry);
        }

        Ok(entries)
    }

    /// Get a password entry by ID
    pub async fn get_entry_by_id(
        &self,
        id: &str,
        encryption_key: &[u8; 32],
    ) -> Result<PasswordEntry, DatabaseError> {
        let row = sqlx::query("SELECT * FROM password_entries WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(row) => self.row_to_password_entry(row, encryption_key),
            None => Err(DatabaseError::EntryNotFound),
        }
    }

    /// Update a password entry
    pub async fn update_entry(
        &self,
        id: &str,
        update: UpdatePasswordEntry,
        encryption_key: &[u8; 32],
    ) -> Result<(), DatabaseError> {
        let now = Utc::now();
        let mut query_parts = Vec::new();
        let mut params: Vec<String> = Vec::new();

        if let Some(title) = &update.title {
            query_parts.push("title = ?");
            params.push(title.clone());
        }

        if let Some(username) = &update.username {
            let encrypted = CryptoService::encrypt(username, encryption_key)?;
            query_parts.push("username_encrypted = ?");
            params.push(serde_json::to_string(&encrypted)?);
        }

        if let Some(password) = &update.password {
            let encrypted = CryptoService::encrypt(password, encryption_key)?;
            query_parts.push("password_encrypted = ?");
            params.push(serde_json::to_string(&encrypted)?);
        }

        if let Some(url) = &update.url {
            let encrypted = CryptoService::encrypt(url, encryption_key)?;
            query_parts.push("url_encrypted = ?");
            params.push(serde_json::to_string(&encrypted)?);
        }

        if let Some(notes) = &update.notes {
            let encrypted = CryptoService::encrypt(notes, encryption_key)?;
            query_parts.push("notes_encrypted = ?");
            params.push(serde_json::to_string(&encrypted)?);
        }

        if let Some(category) = &update.category {
            query_parts.push("category = ?");
            params.push(category.clone());
        }

        if query_parts.is_empty() {
            return Ok(());
        }

        query_parts.push("updated_at = ?");
        params.push(now.to_rfc3339());

        let query_str = format!(
            "UPDATE password_entries SET {} WHERE id = ?",
            query_parts.join(", ")
        );

        let mut query = sqlx::query(&query_str);
        for param in params {
            query = query.bind(param);
        }
        query = query.bind(id);

        let result = query.execute(&self.pool).await?;
        
        if result.rows_affected() == 0 {
            return Err(DatabaseError::EntryNotFound);
        }

        Ok(())
    }

    /// Delete a password entry
    pub async fn delete_entry(&self, id: &str) -> Result<(), DatabaseError> {
        let result = sqlx::query("DELETE FROM password_entries WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;

        if result.rows_affected() == 0 {
            return Err(DatabaseError::EntryNotFound);
        }

        Ok(())
    }

    /// Search password entries by title or category
    pub async fn search_entries(
        &self,
        query: &str,
        encryption_key: &[u8; 32],
    ) -> Result<Vec<PasswordEntry>, DatabaseError> {
        let search_pattern = format!("%{}%", query);
        let rows = sqlx::query(
            "SELECT * FROM password_entries WHERE title LIKE ? OR category LIKE ? ORDER BY title"
        )
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&self.pool)
        .await?;

        let mut entries = Vec::new();
        for row in rows {
            let entry = self.row_to_password_entry(row, encryption_key)?;
            entries.push(entry);
        }

        Ok(entries)
    }

    /// Helper function to convert database row to PasswordEntry
    fn row_to_password_entry(
        &self,
        row: sqlx::sqlite::SqliteRow,
        encryption_key: &[u8; 32],
    ) -> Result<PasswordEntry, DatabaseError> {
        let id: String = row.get("id");
        let title: String = row.get("title");
        let username_encrypted_str: String = row.get("username_encrypted");
        let password_encrypted_str: String = row.get("password_encrypted");
        let url_encrypted_str: Option<String> = row.get("url_encrypted");
        let notes_encrypted_str: Option<String> = row.get("notes_encrypted");
        let category: Option<String> = row.get("category");
        let created_at_str: String = row.get("created_at");
        let updated_at_str: String = row.get("updated_at");

        // Decrypt fields
        let username_encrypted: EncryptedData = serde_json::from_str(&username_encrypted_str)?;
        let password_encrypted: EncryptedData = serde_json::from_str(&password_encrypted_str)?;
        
        let username = CryptoService::decrypt(&username_encrypted, encryption_key)?;
        let password = CryptoService::decrypt(&password_encrypted, encryption_key)?;
        
        let url = if let Some(url_str) = url_encrypted_str {
            let url_encrypted: EncryptedData = serde_json::from_str(&url_str)?;
            Some(CryptoService::decrypt(&url_encrypted, encryption_key)?)
        } else {
            None
        };

        let notes = if let Some(notes_str) = notes_encrypted_str {
            let notes_encrypted: EncryptedData = serde_json::from_str(&notes_str)?;
            Some(CryptoService::decrypt(&notes_encrypted, encryption_key)?)
        } else {
            None
        };

        Ok(PasswordEntry {
            id,
            title,
            username,
            password,
            url,
            notes,
            category,
            created_at: DateTime::parse_from_rfc3339(&created_at_str)
                .map_err(|e| DatabaseError::DateParsingError(e.to_string()))?
                .with_timezone(&Utc),
            updated_at: DateTime::parse_from_rfc3339(&updated_at_str)
                .map_err(|e| DatabaseError::DateParsingError(e.to_string()))?
                .with_timezone(&Utc),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_database_operations() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db = Database::new(db_path.to_str().unwrap()).await.unwrap();

        // Test master password
        let master_password = "test_master_password";
        db.set_master_password(master_password).await.unwrap();
        
        assert!(db.has_master_password().await.unwrap());
        
        let key = db.verify_master_password(master_password).await.unwrap();

        // Test password entry operations
        let entry = CreatePasswordEntry {
            title: "Test Entry".to_string(),
            username: "testuser".to_string(),
            password: "testpass".to_string(),
            url: Some("https://example.com".to_string()),
            notes: Some("Test notes".to_string()),
            category: Some("Test".to_string()),
        };

        let entry_id = db.create_entry(entry, &key).await.unwrap();
        
        let retrieved_entry = db.get_entry_by_id(&entry_id, &key).await.unwrap();
        assert_eq!(retrieved_entry.title, "Test Entry");
        assert_eq!(retrieved_entry.username, "testuser");

        let all_entries = db.get_all_entries(&key).await.unwrap();
        assert_eq!(all_entries.len(), 1);

        db.delete_entry(&entry_id).await.unwrap();
        
        let all_entries_after_delete = db.get_all_entries(&key).await.unwrap();
        assert_eq!(all_entries_after_delete.len(), 0);
    }
}
