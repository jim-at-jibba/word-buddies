/**
 * Database service for IndexedDB operations
 * Handles initialization, upgrades, and basic CRUD operations
 */

// Database configuration
const DB_NAME = 'wordBuddiesDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  PROFILES: 'profiles',
  SETTINGS: 'settings',
  PROGRESS: 'progress',
};

/**
 * Check if code is running in browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Initialize the database
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error('Cannot access IndexedDB during server-side rendering'));
      return;
    }
    
    if (!window.indexedDB) {
      reject(new Error('Your browser does not support IndexedDB'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create profiles store
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        const profilesStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
        profilesStore.createIndex('name', 'name', { unique: false });
        profilesStore.createIndex('yearGroup', 'yearGroup', { unique: false });
        profilesStore.createIndex('createdAt', 'createdAt', { unique: false });
        profilesStore.createIndex('lastUsed', 'lastUsed', { unique: false });
      }
      
      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
      
      // Create progress store
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'id', autoIncrement: true });
        progressStore.createIndex('profileId', 'profileId', { unique: false });
        progressStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Generic function to perform a database operation
const dbOperation = <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDatabase();
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      const request = operation(store);
      
      request.onsuccess = () => {
        resolve(request.result);
        db.close();
      };
      
      request.onerror = () => {
        reject(request.error);
        db.close();
      };
      
    } catch (error) {
      reject(error);
    }
  });
};

// Generic CRUD operations
export const add = <T>(storeName: string, item: T): Promise<IDBValidKey> => {
  return dbOperation(storeName, 'readwrite', (store) => store.add(item));
};

export const get = <T>(storeName: string, key: IDBValidKey): Promise<T> => {
  return dbOperation(storeName, 'readonly', (store) => store.get(key));
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
  return dbOperation(storeName, 'readonly', (store) => store.getAll());
};

export const update = <T>(storeName: string, item: T): Promise<IDBValidKey> => {
  return dbOperation(storeName, 'readwrite', (store) => store.put(item));
};

export const remove = (storeName: string, key: IDBValidKey): Promise<undefined> => {
  return dbOperation(storeName, 'readwrite', (store) => store.delete(key));
};

// Query by index
export const getByIndex = <T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDatabase();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => {
        resolve(request.result);
        db.close();
      };
      
      request.onerror = () => {
        reject(request.error);
        db.close();
      };
      
    } catch (error) {
      reject(error);
    }
  });
};

// Export store names for use in other services
export { STORES };
