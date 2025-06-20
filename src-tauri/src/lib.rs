mod commands;
mod crypto;
mod db;

use commands::AppState;
use db::Database;
use std::sync::Mutex;
use tauri::Manager;
use dirs::data_local_dir;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get a local OS-specific data directory
            let base_data_dir = data_local_dir().expect("Failed to get local data directory");

            // App-specific folder inside base data dir
            let app_data_dir = base_data_dir.join("PasswordVault");

            // Ensure it exists with better error handling
            std::fs::create_dir_all(&app_data_dir)
                .map_err(|e| format!("Failed to create directory {}: {}", app_data_dir.display(), e))
                .expect("Failed to create app data directory");

            // Create full path to the SQLite DB file
            let db_path = app_data_dir.join("passwordvault.db");
            
            // Debug output
            println!("App data dir: {}", app_data_dir.display());
            println!("DB path: {}", db_path.display());
            println!("Parent dir exists: {}", db_path.parent().unwrap().exists());

            // Test directory write permissions
            let test_file = app_data_dir.join("test_write");
            if let Err(e) = std::fs::write(&test_file, "test") {
                eprintln!("Directory not writable: {}", e);
                panic!("App data directory is not writable");
            }
            std::fs::remove_file(test_file).ok();

            // Initialize DB (block async init at startup)
            let database = tauri::async_runtime::block_on(Database::new(
                db_path.to_str().unwrap(),
            ))
            .expect("Failed to initialize database");

            // Create and register app state
            let app_state = AppState {
                db: database,
                encryption_key: Mutex::new(None),
            };

            app.manage(app_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::setup_master_password,
            commands::verify_master_password,
            commands::has_master_password,
            commands::create_password_entry,
            commands::get_all_entries,
            commands::get_entry_by_id,
            commands::update_password_entry,
            commands::delete_password_entry,
            commands::search_entries,
            commands::generate_password,
            commands::logout
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
