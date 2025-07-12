import { useState, useEffect } from 'react';

interface OfflineData {
  id: string;
  data: any;
  timestamp: number;
  synced: boolean;
  userId?: string;
}

interface SassaCardOffline {
  id: string;
  userId: string;
  grantType: string;
  cardPhotoBlob: Blob;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  synced: boolean;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize IndexedDB
    initializeDB();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeDB = () => {
    const request = indexedDB.open('PoortLinkOffline', 1);

    request.onerror = (event) => {
      console.error('Database error:', event);
    };

    request.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      setDb(database);
      console.log('Database initialized successfully');
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // SASSA Cards store
      if (!database.objectStoreNames.contains('sassaCards')) {
        const sassaStore = database.createObjectStore('sassaCards', { keyPath: 'id' });
        sassaStore.createIndex('userId', 'userId', { unique: false });
        sassaStore.createIndex('synced', 'synced', { unique: false });
        sassaStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Ride history store
      if (!database.objectStoreNames.contains('rideHistory')) {
        const rideStore = database.createObjectStore('rideHistory', { keyPath: 'id' });
        rideStore.createIndex('userId', 'userId', { unique: false });
        rideStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Driver reputation cache
      if (!database.objectStoreNames.contains('driverReputation')) {
        const reputationStore = database.createObjectStore('driverReputation', { keyPath: 'id' });
        reputationStore.createIndex('driverId', 'driverId', { unique: false });
        reputationStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      console.log('Database schema created');
    };
  };

  const saveSassaCardOffline = async (sassaCard: Omit<SassaCardOffline, 'id' | 'timestamp' | 'synced'>): Promise<string> => {
    if (!db) throw new Error('Database not initialized');

    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineCard: SassaCardOffline = {
      ...sassaCard,
      id,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sassaCards'], 'readwrite');
      const store = transaction.objectStore('sassaCards');
      const request = store.add(offlineCard);

      request.onsuccess = () => {
        console.log('SASSA card saved offline:', id);
        // Register for background sync if available
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            if ('sync' in registration) {
              (registration as any).sync.register('sassa-upload');
            }
          }).catch(err => console.log('Background sync registration failed:', err));
        }
        resolve(id);
      };

      request.onerror = () => {
        console.error('Failed to save SASSA card offline');
        reject(request.error);
      };
    });
  };

  const getSassaCardsOffline = async (userId: string): Promise<SassaCardOffline[]> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sassaCards'], 'readonly');
      const store = transaction.objectStore('sassaCards');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const markSassaCardSynced = async (id: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sassaCards'], 'readwrite');
      const store = transaction.objectStore('sassaCards');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const card = getRequest.result;
        if (card) {
          card.synced = true;
          const putRequest = store.put(card);
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Card not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  };

  const saveRideHistoryOffline = async (ride: any): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['rideHistory'], 'readwrite');
      const store = transaction.objectStore('rideHistory');
      const offlineRide = {
        ...ride,
        timestamp: Date.now(),
        cached: true
      };
      const request = store.put(offlineRide);

      request.onsuccess = () => {
        console.log('Ride history cached offline');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const getRideHistoryOffline = async (userId: string): Promise<any[]> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['rideHistory'], 'readonly');
      const store = transaction.objectStore('rideHistory');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const cacheDriverReputation = async (reputation: any): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['driverReputation'], 'readwrite');
      const store = transaction.objectStore('driverReputation');
      const cachedReputation = {
        ...reputation,
        timestamp: Date.now(),
        cached: true
      };
      const request = store.put(cachedReputation);

      request.onsuccess = () => {
        console.log('Driver reputation cached offline');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const clearOfflineData = async (): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    const stores = ['sassaCards', 'rideHistory', 'driverReputation'];
    
    return Promise.all(stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    })).then(() => {
      console.log('All offline data cleared');
    });
  };

  return {
    isOnline,
    saveSassaCardOffline,
    getSassaCardsOffline,
    markSassaCardSynced,
    saveRideHistoryOffline,
    getRideHistoryOffline,
    cacheDriverReputation,
    clearOfflineData,
    dbReady: !!db
  };
};