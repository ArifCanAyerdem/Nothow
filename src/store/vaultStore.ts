import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Web Polyfill for SecureStore
const safeSecureStore = {
  getItemAsync: async (key: string) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key: string, value: string) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, value);
    return await SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key: string) => {
    if (Platform.OS === 'web') return localStorage.removeItem(key);
    return await SecureStore.deleteItemAsync(key);
  }
};
import { getDB, initDB, resetDB } from '@/db/database';
import { getOrGenerateMasterKey, encryptData, decryptData, clearMasterKey } from '@/utils/crypto';
import { scheduleTaskNotification, cancelTaskNotification } from '@/utils/notifications';

export type VaultItemType = 'note' | 'password' | 'task';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  content: string; 
  username?: string; 
  createdAt: number;
  isCompleted?: boolean;
  scheduledAt?: number;
  recurrence?: 'none' | 'daily' | 'weekly';
}

interface VaultState {
  items: VaultItem[];
  isUnlocked: boolean;
  isPanicMode: boolean;
  userPin: string | null;
  decoyPin: string | null;
  userName: string | null;
  isBiometricsEnabled: boolean;
  autoLockTimer: number; // in milliseconds, 0 means immediately
  
  initStore: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  setDecoyPin: (pin: string) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  setAutoLockTimer: (ms: number) => Promise<void>;
  unlockVault: (password: string) => boolean;
  unlockWithBiometrics: () => void;
  lockVault: () => void;
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<VaultItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  loadItems: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const SECURE_PIN_KEY = 'kinetic_vault_pin';
const SECURE_DECOY_PIN_KEY = 'kinetic_vault_decoy_pin';
const SECURE_BIO_KEY = 'kinetic_vault_bio';
const SECURE_NAME_KEY = 'kinetic_vault_name';
const SECURE_AUTOLOCK_KEY = 'kinetic_vault_autolock';

export const useVaultStore = create<VaultState>((set, get) => ({
  items: [],
  isUnlocked: false,
  isPanicMode: false,
  userPin: null,
  decoyPin: null,
  userName: null,
  isBiometricsEnabled: false,
  autoLockTimer: 0,

  clearAllData: async () => {
    try {
      await resetDB();
      await clearMasterKey();
      await safeSecureStore.deleteItemAsync(SECURE_PIN_KEY);
      await safeSecureStore.deleteItemAsync(SECURE_DECOY_PIN_KEY);
      await safeSecureStore.deleteItemAsync(SECURE_BIO_KEY);
      await safeSecureStore.deleteItemAsync(SECURE_NAME_KEY);
      await safeSecureStore.deleteItemAsync(SECURE_AUTOLOCK_KEY);
      
      set({
        items: [],
        isUnlocked: false,
        isPanicMode: false,
        userPin: null,
        decoyPin: null,
        userName: null,
        isBiometricsEnabled: false,
        autoLockTimer: 0,
      });
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  },

  setPin: async (pin: string) => {
    try {
      await safeSecureStore.setItemAsync(SECURE_PIN_KEY, pin);
      set({ userPin: pin });
    } catch (e) {
      console.error('Failed to set PIN', e);
    }
  },

  setDecoyPin: async (pin: string) => {
    try {
      await safeSecureStore.setItemAsync(SECURE_DECOY_PIN_KEY, pin);
      set({ decoyPin: pin });
    } catch (e) {
      console.error('Failed to set decoy PIN', e);
    }
  },

  setUserName: async (name: string) => {
    try {
      await safeSecureStore.setItemAsync(SECURE_NAME_KEY, name);
      set({ userName: name });
    } catch (e) {
      console.error('Failed to set username', e);
    }
  },

  setBiometricsEnabled: async (enabled: boolean) => {
    try {
      await safeSecureStore.setItemAsync(SECURE_BIO_KEY, enabled.toString());
      set({ isBiometricsEnabled: enabled });
    } catch (e) {
      console.error('Failed to set biometrics', e);
    }
  },

  setAutoLockTimer: async (ms: number) => {
    try {
      await safeSecureStore.setItemAsync(SECURE_AUTOLOCK_KEY, ms.toString());
      set({ autoLockTimer: ms });
    } catch (e) {
      console.error('Failed to set auto lock timer', e);
    }
  },

  initStore: async () => {
    try {
      await initDB(); // Initialize SQLite tables
      
      const pin = await safeSecureStore.getItemAsync(SECURE_PIN_KEY);
      const decoy = await safeSecureStore.getItemAsync(SECURE_DECOY_PIN_KEY);
      const bio = await safeSecureStore.getItemAsync(SECURE_BIO_KEY);
      const name = await safeSecureStore.getItemAsync(SECURE_NAME_KEY);
      const autoLock = await safeSecureStore.getItemAsync(SECURE_AUTOLOCK_KEY);
      set({ 
        userPin: pin || null, 
        decoyPin: decoy || null,
        userName: name || null,
        isBiometricsEnabled: bio === 'true',
        autoLockTimer: autoLock ? parseInt(autoLock, 10) : 0
      });
    } catch (e) {
      console.error('Failed to init store', e);
    }
  },

  unlockVault: (password: string) => {
    // Check real PIN first
    const currentPin = get().userPin;
    if (currentPin && password === currentPin) {
      set({ isUnlocked: true, isPanicMode: false });
      get().loadItems();
      return true;
    }

    // Check Decoy PIN
    const decoyPin = get().decoyPin;
    if (decoyPin && password === decoyPin) {
      set({ isUnlocked: true, isPanicMode: true });
      get().loadItems();
      return true;
    }

    return false;
  },

  unlockWithBiometrics: () => {
    set({ isUnlocked: true, isPanicMode: false });
    get().loadItems();
  },

  lockVault: () => set({ isUnlocked: false, isPanicMode: false, items: [] }),

  loadItems: async () => {
    const isDecoy = get().isPanicMode ? 1 : 0;
    
    try {
      const db = await getDB();
      const rows = await db.getAllAsync<{id: string, payload: string}>('SELECT id, payload FROM vault_items WHERE isDecoy = ?', [isDecoy]);
      
      const masterKey = await getOrGenerateMasterKey();
      
      const loadedItems: VaultItem[] = rows.map(row => {
        const decryptedStr = decryptData(row.payload, masterKey);
        if (decryptedStr) {
          try {
            return JSON.parse(decryptedStr) as VaultItem;
          } catch(e) { return null; }
        }
        return null;
      }).filter(Boolean) as VaultItem[];

      // Sort by creation time desc
      loadedItems.sort((a, b) => b.createdAt - a.createdAt);
      set({ items: loadedItems });

    } catch (e) {
      console.error('Failed to load vault items from DB', e);
    }
  },

  addItem: async (itemData) => {
    const newItem: VaultItem = {
      ...itemData,
      id: Math.random().toString(36).substring(7),
      createdAt: Date.now(),
    };
    
    // Update local state immediately
    const newItems = [newItem, ...get().items];
    set({ items: newItems });
    
    try {
      const isDecoy = get().isPanicMode ? 1 : 0;
      const masterKey = await getOrGenerateMasterKey();
      const payloadStr = JSON.stringify(newItem);
      const encryptedPayload = encryptData(payloadStr, masterKey);
      
      const db = await getDB();
      await db.runAsync('INSERT INTO vault_items (id, isDecoy, payload) VALUES (?, ?, ?)', [newItem.id, isDecoy, encryptedPayload]);
      
      // Schedule notification if it's a task and has a scheduled date
      if (newItem.type === 'task' && newItem.scheduledAt) {
        await scheduleTaskNotification(newItem.id, newItem.title, newItem.scheduledAt);
      }
    } catch (e) {
      console.error('Failed to save vault item to DB', e);
    }
  },

  updateItem: async (id, updates) => {
    const currentItems = get().items;
    
    let isTaskRecurrenceUpdated = false;
    let nextScheduledAt: number | undefined = undefined;

    // Handle recurrence logic if a task is marked as completed
    if (updates.isCompleted === true) {
      const task = currentItems.find(i => i.id === id);
      if (task && task.type === 'task' && task.recurrence && task.recurrence !== 'none') {
        const nextDate = new Date(task.scheduledAt || Date.now());
        if (task.recurrence === 'daily') {
          nextDate.setDate(nextDate.getDate() + 1);
        } else if (task.recurrence === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        
        updates.isCompleted = false; // keep it unchecked
        updates.scheduledAt = nextDate.getTime();
        nextScheduledAt = nextDate.getTime();
        isTaskRecurrenceUpdated = true;
      }
    }

    const newItems = currentItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    set({ items: newItems });

    try {
      const updatedItem = newItems.find(i => i.id === id);
      if (updatedItem) {
        const masterKey = await getOrGenerateMasterKey();
        const payloadStr = JSON.stringify(updatedItem);
        const encryptedPayload = encryptData(payloadStr, masterKey);
        
        const db = await getDB();
        await db.runAsync('UPDATE vault_items SET payload = ? WHERE id = ?', [encryptedPayload, id]);
        
        // Reschedule notification
        if (updatedItem.type === 'task') {
          if (updatedItem.isCompleted) {
            await cancelTaskNotification(id);
          } else if (updatedItem.scheduledAt) {
            await scheduleTaskNotification(id, updatedItem.title, updatedItem.scheduledAt);
          }
        }
      }
    } catch (e) {
      console.error('Failed to update vault item in DB', e);
    }
  },

  deleteItem: async (id) => {
    const newItems = get().items.filter(item => item.id !== id);
    set({ items: newItems });

    try {
      const db = await getDB();
      await db.runAsync('DELETE FROM vault_items WHERE id = ?', [id]);
      
      // Cancel notification
      await cancelTaskNotification(id);
    } catch (e) {
      console.error('Failed to delete vault item from DB', e);
    }
  },
  
  clearAllData: async () => {
    set({ items: [], isUnlocked: false, userPin: null, decoyPin: null, userName: null, isBiometricsEnabled: false });
    try {
      // 1. Reset SQLite Database completely
      await resetDB();
      
      // 2. Destroy Master Key
      await clearMasterKey();
      
      // 3. Clear settings in SecureStore
      await SecureStore.deleteItemAsync('kinetic_vault_data'); // legacy cleanup
      await SecureStore.deleteItemAsync(SECURE_PIN_KEY);
      await SecureStore.deleteItemAsync(SECURE_DECOY_PIN_KEY);
      await SecureStore.deleteItemAsync(SECURE_BIO_KEY);
      await SecureStore.deleteItemAsync(SECURE_NAME_KEY);
      await SecureStore.deleteItemAsync(SECURE_AUTOLOCK_KEY);
    } catch(e) {
      console.error('Failed to clear data', e);
    }
  }
}));
