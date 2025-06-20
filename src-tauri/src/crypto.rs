use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use argon2::{
    password_hash::{
        rand_core::OsRng as ArgonOsRng, 
        PasswordHash, 
        PasswordHasher, 
        PasswordVerifier, 
        SaltString
    },
    Argon2,
};
use base64::{engine::general_purpose, Engine as _};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Encryption failed: {0}")]
    EncryptionError(String),
    #[error("Decryption failed: {0}")]
    DecryptionError(String),
    #[error("Hashing failed: {0}")]
    HashingError(String),
    #[error("Base64 decode error: {0}")]
    Base64Error(#[from] base64::DecodeError),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedData {
    pub ciphertext: String,
    pub nonce: String,
}

pub struct CryptoService;

impl CryptoService {
    /// Hash a password using Argon2
    pub fn hash_password(password: &str) -> Result<String, CryptoError> {
        let salt = SaltString::generate(&mut ArgonOsRng);
        let argon2 = Argon2::default();
        
        argon2
            .hash_password(password.as_bytes(), &salt)
            .map(|hash| hash.to_string())
            .map_err(|e| CryptoError::HashingError(e.to_string()))
    }

    /// Verify a password against its hash
    pub fn verify_password(password: &str, hash: &str) -> Result<bool, CryptoError> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| CryptoError::HashingError(e.to_string()))?;
        
        let argon2 = Argon2::default();
        Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
    }

    /// Derive an encryption key from a password using Argon2
    pub fn derive_key_from_password(password: &str, salt: &[u8]) -> Result<[u8; 32], CryptoError> {
        let salt_string = SaltString::encode_b64(salt)
            .map_err(|e| CryptoError::HashingError(e.to_string()))?;
        
        let argon2 = Argon2::default();
        let mut key = [0u8; 32];
        
        argon2
            .hash_password_into(password.as_bytes(), salt_string.as_salt().as_str().as_bytes(), &mut key)
            .map_err(|e| CryptoError::HashingError(e.to_string()))?;
        
        Ok(key)
    }

    /// Generate a random salt
    pub fn generate_salt() -> [u8; 16] {
        let mut salt = [0u8; 16];
        OsRng.fill_bytes(&mut salt);
        salt
    }

    /// Encrypt data using AES-256-GCM
    pub fn encrypt(data: &str, key: &[u8; 32]) -> Result<EncryptedData, CryptoError> {
        let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
        
        let ciphertext = cipher
            .encrypt(&nonce, data.as_bytes())
            .map_err(|e| CryptoError::EncryptionError(e.to_string()))?;

        Ok(EncryptedData {
            ciphertext: general_purpose::STANDARD.encode(&ciphertext),
            nonce: general_purpose::STANDARD.encode(&nonce),
        })
    }

    /// Decrypt data using AES-256-GCM
    pub fn decrypt(encrypted_data: &EncryptedData, key: &[u8; 32]) -> Result<String, CryptoError> {
        let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
        
        let ciphertext = general_purpose::STANDARD
            .decode(&encrypted_data.ciphertext)?;
        let nonce_bytes = general_purpose::STANDARD
            .decode(&encrypted_data.nonce)?;
        
        if nonce_bytes.len() != 12 {
            return Err(CryptoError::DecryptionError("Invalid nonce length".to_string()));
        }
        
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let plaintext = cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|e| CryptoError::DecryptionError(e.to_string()))?;

        String::from_utf8(plaintext)
            .map_err(|e| CryptoError::DecryptionError(format!("Invalid UTF-8: {}", e)))
    }

    /// Generate a secure random password
    pub fn generate_password(length: usize, include_symbols: bool) -> String {
        let lowercase = "abcdefghijklmnopqrstuvwxyz";
        let uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let numbers = "0123456789";
        let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        
        let mut charset = String::new();
        charset.push_str(lowercase);
        charset.push_str(uppercase);
        charset.push_str(numbers);
        
        if include_symbols {
            charset.push_str(symbols);
        }
        
        let charset_bytes = charset.as_bytes();
        let mut password = String::new();
        let mut rng = OsRng;
        
        for _ in 0..length {
            let idx = (rng.next_u32() as usize) % charset_bytes.len();
            password.push(charset_bytes[idx] as char);
        }
        
        password
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_password_hashing() {
        let password = "test_password_123";
        let hash = CryptoService::hash_password(password).unwrap();
        
        assert!(CryptoService::verify_password(password, &hash).unwrap());
        assert!(!CryptoService::verify_password("wrong_password", &hash).unwrap());
    }

    #[test]
    fn test_encryption_decryption() {
        let data = "sensitive_password_data";
        let key = [1u8; 32]; // Test key
        
        let encrypted = CryptoService::encrypt(data, &key).unwrap();
        let decrypted = CryptoService::decrypt(&encrypted, &key).unwrap();
        
        assert_eq!(data, decrypted);
    }

    #[test]
    fn test_key_derivation() {
        let password = "master_password";
        let salt = CryptoService::generate_salt();
        
        let key1 = CryptoService::derive_key_from_password(password, &salt).unwrap();
        let key2 = CryptoService::derive_key_from_password(password, &salt).unwrap();
        
        assert_eq!(key1, key2);
    }

    #[test]
    fn test_password_generation() {
        let password = CryptoService::generate_password(16, true);
        assert_eq!(password.len(), 16);
        
        let password_no_symbols = CryptoService::generate_password(12, false);
        assert_eq!(password_no_symbols.len(), 12);
    }
}
