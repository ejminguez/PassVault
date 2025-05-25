// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    println!("{}", name);
    format!("{}", name)
}

#[tauri::command]
fn password_show(password: &str) -> String {
    println!("{}", password);
    format!("{}", password)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![password_show])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Test cases
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let name = "Love";
        let result = greet(name);
        assert_eq!(result, "Love");
    }

    #[test]
    fn test_password_show() {
        let password = "errol5079";
        let result = password_show(password);
        assert_eq!(result, "errol5079");
    }
}
