use crate::crypto::CryptoService;
use crate::db::{CreatePasswordEntry, Database, PasswordEntry, UpdatePasswordEntry};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppError {
    pub message: String,
}

impl From<crate::db::DatabaseError> for AppError {
    fn from(err: crate::db::DatabaseError) -> Self {
        AppError {
            message: err.to_string(),
        }
    }
}

impl From<crate::crypto::CryptoError> for AppError {
    fn from(err: crate::crypto::CryptoError) -> Self {
        AppError {
            message: err.to_string(),
        }
    }
}

pub struct AppState {
    pub db: Database,
    pub encryption_key: Mutex<Option<[u8; 32]>>,
}

#[tauri::command]
pub async fn setup_master_password(
    password: String,
    state: State<'_, AppState>,
) -> Result<bool, AppError> {
    state.db.set_master_password(&password).await?;
    
    let key = state.db.verify_master_password(&password).await?;
    *state.encryption_key.lock().unwrap() = Some(key);
    
    Ok(true)
}

#[tauri::command]
pub async fn verify_master_password(
    password: String,
    state: State<'_, AppState>,
) -> Result<bool, AppError> {
    match state.db.verify_master_password(&password).await {
        Ok(key) => {
            *state.encryption_key.lock().unwrap() = Some(key);
            Ok(true)
        }
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub async fn has_master_password(state: State<'_, AppState>) -> Result<bool, AppError> {
    Ok(state.db.has_master_password().await?)
}

#[tauri::command]
pub async fn create_password_entry(
    entry: CreatePasswordEntry,
    state: State<'_, AppState>,
) -> Result<String, AppError> {
    let key = state.encryption_key.lock().unwrap()
        .ok_or_else(|| AppError { message: "Not authenticated".to_string() })?;
    
    let id = state.db.create_entry(entry, &key).await?;
    Ok(id)
}

#[tauri::command]
pub async fn get_all_entries(state: State<'_, AppState>) -> Result<Vec<PasswordEntry>, AppError> {
    let key = state.encryption_key.lock().unwrap()
        .ok_or_else(|| AppError { message: "Not authenticated".to_string() })?;
    
    let entries = state.db.get_all_entries(&key).await?;
    Ok(entries)
}

#[tauri::command]
pub async fn get_entry_by_id(
    id: String,
    state: State<'_, AppState>,
) -> Result<PasswordEntry, AppError> {
    let key = state.encryption_key.lock().unwrap()
        .ok_or_else(|| AppError { message: "Not authenticated".to_string() })?;
    
    let entry = state.db.get_entry_by_id(&id, &key).await?;
    Ok(entry)
}

#[tauri::command]
pub async fn update_password_entry(
    id: String,
    update: UpdatePasswordEntry,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    let key = state.encryption_key.lock().unwrap()
        .ok_or_else(|| AppError { message: "Not authenticated".to_string() })?;
    
    state.db.update_entry(&id, update, &key).await?;
    Ok(())
}

#[tauri::command]
pub async fn delete_password_entry(
    id: String,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    state.db.delete_entry(&id).await?;
    Ok(())
}

#[tauri::command]
pub async fn search_entries(
    query: String,
    state: State<'_, AppState>,
) -> Result<Vec<PasswordEntry>, AppError> {
    let key = state.encryption_key.lock().unwrap()
        .ok_or_else(|| AppError { message: "Not authenticated".to_string() })?;
    
    let entries = state.db.search_entries(&query, &key).await?;
    Ok(entries)
}

#[tauri::command]
pub fn generate_password(length: usize, include_symbols: bool) -> String {
    CryptoService::generate_password(length, include_symbols)
}

#[tauri::command]
pub fn logout(state: State<'_, AppState>) -> Result<(), AppError> {
    *state.encryption_key.lock().unwrap() = None;
    Ok(())
}
