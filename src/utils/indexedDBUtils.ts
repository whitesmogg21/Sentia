
// Database configuration
const DB_NAME = 'quizAppDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  QBANKS: 'qbanks',
  QUIZ_HISTORY: 'quizHistory',
  QUESTION_METRICS: 'questionMetrics',
  MEDIA_LIBRARY: 'mediaLibrary',
  QUESTION_FILTERS: 'questionFilters',
  DASHBOARD_WIDGETS: 'dashboardWidgets',
  WIDGET_POSITIONS: 'widgetPositions'
};

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.QBANKS)) {
        db.createObjectStore(STORES.QBANKS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.QUIZ_HISTORY)) {
        db.createObjectStore(STORES.QUIZ_HISTORY, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.QUESTION_METRICS)) {
        db.createObjectStore(STORES.QUESTION_METRICS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.MEDIA_LIBRARY)) {
        db.createObjectStore(STORES.MEDIA_LIBRARY, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.QUESTION_FILTERS)) {
        db.createObjectStore(STORES.QUESTION_FILTERS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.DASHBOARD_WIDGETS)) {
        db.createObjectStore(STORES.DASHBOARD_WIDGETS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.WIDGET_POSITIONS)) {
        db.createObjectStore(STORES.WIDGET_POSITIONS, { keyPath: 'id' });
      }
    };
  });
};

// Generic function to get a store
const getStore = async (storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> => {
  const db = await initDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

// Generic read operation
export const getItem = async <T>(storeName: string, key: string): Promise<T | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error(`Error reading from ${storeName}:`, event);
        reject(`Error reading from ${storeName}`);
      };
    } catch (error) {
      console.error(`Error in getItem for ${storeName}:`, error);
      resolve(null); // Fallback to null if there's an error
    }
  });
};

// Generic write operation
export const setItem = async <T>(storeName: string, value: T): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName, 'readwrite');
      const request = store.put(value);
      
      request.onsuccess = () => {
        // Dispatch an event to notify that data has changed
        window.dispatchEvent(new CustomEvent('dbUpdated', { detail: { store: storeName } }));
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error writing to ${storeName}:`, event);
        reject(`Error writing to ${storeName}`);
      };
    } catch (error) {
      console.error(`Error in setItem for ${storeName}:`, error);
      reject(error);
    }
  });
};

// Generic delete operation
export const removeItem = async (storeName: string, key: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName, 'readwrite');
      const request = store.delete(key);
      
      request.onsuccess = () => {
        // Dispatch an event to notify that data has changed
        window.dispatchEvent(new CustomEvent('dbUpdated', { detail: { store: storeName } }));
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting from ${storeName}:`, event);
        reject(`Error deleting from ${storeName}`);
      };
    } catch (error) {
      console.error(`Error in removeItem for ${storeName}:`, error);
      reject(error);
    }
  });
};

// Get all items from a store
export const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = (event) => {
        console.error(`Error reading all from ${storeName}:`, event);
        reject(`Error reading all from ${storeName}`);
      };
    } catch (error) {
      console.error(`Error in getAllItems for ${storeName}:`, error);
      resolve([]); // Fallback to empty array if there's an error
    }
  });
};

// Clear a store
export const clearStore = async (storeName: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const store = await getStore(storeName, 'readwrite');
      const request = store.clear();
      
      request.onsuccess = () => {
        // Dispatch an event to notify that data has changed
        window.dispatchEvent(new CustomEvent('dbUpdated', { detail: { store: storeName } }));
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error clearing ${storeName}:`, event);
        reject(`Error clearing ${storeName}`);
      };
    } catch (error) {
      console.error(`Error in clearStore for ${storeName}:`, error);
      reject(error);
    }
  });
};

// Migrate data from localStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<void> => {
  // Helper to safely parse JSON from localStorage
  const safeParseJSON = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error parsing localStorage key ${key}:`, error);
      return null;
    }
  };

  try {
    // Migrate qbanks
    const questionLibrary = safeParseJSON('questionLibrary');
    if (questionLibrary) {
      await setItem(STORES.QBANKS, { id: 'allQBanks', data: questionLibrary });
    }

    // Migrate quiz history
    const quizHistory = safeParseJSON('quizHistory');
    if (quizHistory) {
      await setItem(STORES.QUIZ_HISTORY, { id: 'history', data: quizHistory });
    }

    // Migrate question metrics
    const questionMetrics = safeParseJSON('questionMetrics');
    if (questionMetrics) {
      await setItem(STORES.QUESTION_METRICS, { id: 'metrics', data: questionMetrics });
    }

    // Migrate media library
    const mediaLibrary = safeParseJSON('mediaLibrary');
    if (mediaLibrary) {
      await setItem(STORES.MEDIA_LIBRARY, { id: 'media', data: mediaLibrary });
    }

    // Migrate question filters
    const questionFilters = safeParseJSON('questionFilters');
    if (questionFilters) {
      await setItem(STORES.QUESTION_FILTERS, { id: 'filters', data: questionFilters });
    }

    // Migrate dashboard widgets
    const dashboardWidgets = safeParseJSON('dashboardWidgets');
    if (dashboardWidgets) {
      await setItem(STORES.DASHBOARD_WIDGETS, { id: 'widgets', data: dashboardWidgets });
    }

    // Migrate widget positions
    const widgetPositions = safeParseJSON('widgetPositions');
    if (widgetPositions) {
      await setItem(STORES.WIDGET_POSITIONS, { id: 'positions', data: widgetPositions });
    }

    console.log('Migration from localStorage to IndexedDB completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
