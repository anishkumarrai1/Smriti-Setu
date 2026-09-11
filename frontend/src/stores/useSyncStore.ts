import { create } from 'zustand';
import { SyncState, SyncPendingItem } from '../types';
import { syncApi } from '../services/api';

interface SyncStoreState {
  isOnline: boolean;
  syncState: SyncState;
  pendingItems: SyncPendingItem[];
  setOnlineStatus: (isOnline: boolean) => void;
  addPendingItem: (action: SyncPendingItem['action'], payload: Record<string, any>) => void;
  triggerManualSync: () => Promise<void>;
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  isOnline: true,
  syncState: 'synced',
  pendingItems: [],

  setOnlineStatus: (isOnline) => {
    set({
      isOnline,
      syncState: isOnline ? (get().pendingItems.length > 0 ? 'syncing' : 'synced') : 'offline',
    });

    if (isOnline && get().pendingItems.length > 0) {
      get().triggerManualSync();
    }
  },

  addPendingItem: (action, payload) => {
    const newItem: SyncPendingItem = {
      id: `sync-${Date.now()}`,
      action,
      payload,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedPending = [...state.pendingItems, newItem];
      return {
        pendingItems: updatedPending,
        syncState: state.isOnline ? 'syncing' : 'offline',
      };
    });

    if (get().isOnline) {
      get().triggerManualSync();
    }
  },

  triggerManualSync: async () => {
    const items = get().pendingItems;
    if (!get().isOnline || items.length === 0) return;

    set({ syncState: 'syncing' });

    try {
      // Real network sync to regional gateway endpoint
      const result = await syncApi.syncBatch(items);
      if (result.success || result.processedCount > 0) {
        set({
          pendingItems: [],
          syncState: 'synced',
        });
      }
    } catch (err) {
      console.warn('Network sync failed, keeping items in offline queue', err);
      set({ syncState: 'offline' });
    }
  },
}));
