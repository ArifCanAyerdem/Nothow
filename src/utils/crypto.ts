import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DB_KEY_IDENTIFIER = 'NOTHOW_DB_MASTER_KEY';

/**
 * Gets or generates a random 256-bit encryption key stored in SecureStore.
 */
export const getOrGenerateMasterKey = async (): Promise<string> => {
  let key: string | null = null;
  
  if (Platform.OS === 'web') {
    key = localStorage.getItem(DB_KEY_IDENTIFIER);
  } else {
    key = await SecureStore.getItemAsync(DB_KEY_IDENTIFIER);
  }

  if (!key) {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (Platform.OS === 'web') {
      localStorage.setItem(DB_KEY_IDENTIFIER, key);
    } else {
      await SecureStore.setItemAsync(DB_KEY_IDENTIFIER, key);
    }
  }
  return key as string;
};

/**
 * Clears the master key from SecureStore (Used during full wipe).
 */
export const clearMasterKey = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(DB_KEY_IDENTIFIER);
  } else {
    await SecureStore.deleteItemAsync(DB_KEY_IDENTIFIER);
  }
};

/**
 * Encrypts a plaintext string using the secret key.
 */
export const encryptData = (text: string, secretKey: string): string => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

/**
 * Decrypts a ciphertext string using the secret key.
 */
export const decryptData = (ciphertext: string, secretKey: string): string => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Decryption failed', e);
    return '';
  }
};
