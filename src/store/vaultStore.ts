import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type VaultItemType = 'note' | 'password' | 'task';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  content: string; // The secret content or note
  username?: string; // specific to passwords
  createdAt: number;
  // Specific to tasks:
  isCompleted?: boolean;
  scheduledAt?: number;
}

interface VaultState {
  items: VaultItem[];
  isUnlocked: boolean;
  isPanicMode: boolean;
  unlockVault: (password: string) => boolean;
  lockVault: () => void;
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<VaultItem>) => void;
  deleteItem: (id: string) => void;
  loadItems: () => Promise<void>;
}

// Secret key used for SecureStore (in a real app, this would be derived from user password)
const SECURE_STORE_KEY = 'kinetic_vault_data';

export const useVaultStore = create<VaultState>((set, get) => ({
  items: [],
  isUnlocked: false,
  isPanicMode: false,

  unlockVault: (password: string) => {
    // Panic mode check
    if (password === '0000') {
      set({ isUnlocked: true, isPanicMode: true });
      get().loadItems();
      return true;
    }

    if (password === '1234' || password.length > 3) {
      set({ isUnlocked: true, isPanicMode: false });
      get().loadItems();
      return true;
    }
    return false;
  },

  lockVault: () => set({ isUnlocked: false, isPanicMode: false, items: [] }),

  loadItems: async () => {
    if (get().isPanicMode) {
      const panicItems: VaultItem[] = [
        { id: 'p1', type: 'note', title: 'Alışveriş Listesi', content: '1. Süt\n2. Ekmek', createdAt: Date.now() },
        { id: 'p2', type: 'password', title: 'Netflix', content: 'netflix123', username: 'user@netflix.com', createdAt: Date.now() }
      ];
      set({ items: panicItems });
      return;
    }
    try {
      const data = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (data) {
        set({ items: JSON.parse(data) });
      } else {
        // Load default dummy data if vault is empty
        const defaultItems: VaultItem[] = [
          { id: '1', type: 'password', title: 'Binance Seed Phrase', content: 'secure-key-hidden', createdAt: Date.now() - 100000 },
          { id: '2', type: 'note', title: 'Q3 Marketing Strategy', content: 'Focus on AI...', createdAt: Date.now() - 50000 },
        ];
        set({ items: defaultItems });
      }
    } catch (e) {
      console.error('Failed to load vault items', e);
    }
  },

  addItem: async (itemData) => {
    const newItem: VaultItem = {
      ...itemData,
      id: Math.random().toString(36).substring(7),
      createdAt: Date.now(),
    };
    
    const newItems = [newItem, ...get().items];
    set({ items: newItems });
    
    if (get().isPanicMode) return; // Don't persist panic mode items
    
    // Save to SecureStore
    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save vault item', e);
    }
  },

  updateItem: async (id, updates) => {
    const currentItems = get().items;
    const newItems = currentItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    set({ items: newItems });

    if (get().isPanicMode) return; // Don't persist panic mode items

    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to update vault item', e);
    }
  },

  deleteItem: async (id) => {
    const newItems = get().items.filter(item => item.id !== id);
    set({ items: newItems });

    if (get().isPanicMode) return; // Don't persist panic mode items

    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to delete vault item', e);
    }
  }
}));
