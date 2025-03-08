
/**
 * IndexedDB utility for handling large amounts of data
 * Replaces localStorage for storing question banks, history, and metrics
 */

// Database configuration
const DB_NAME = 'quizMasterDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  QBANKS: 'questionBanks',
  QUIZ_HISTORY: 'quizHistory',
  QUESTION_METRICS: 'questionMetrics'
};

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Error opening database');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.QBANKS)) {
        db.createObjectStore(STORES.QBANKS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.QUIZ_HISTORY)) {
        db.createObjectStore(STORES.QUIZ_HISTORY, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.QUESTION_METRICS)) {
        db.createObjectStore(STORES.QUESTION_METRICS, { keyPath: 'id' });
      }
    };
  });
};

// Generic function to get a transaction and store
const getStore = (
  storeName: string, 
  mode: IDBTransactionMode = 'readonly'
): Promise<IDBObjectStore> => {
  return new Promise((resolve, reject) => {
    initDB()
      .then(db => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        resolve(store);
      })
      .catch(error => {
        console.error(`Error getting store ${storeName}:`, error);
        reject(error);
      });
  });
};

// Put an item in a store (update or insert)
export const putItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    getStore(storeName, 'readwrite')
      .then(store => {
        const request = store.put(item);
        
        request.onsuccess = () => {
          resolve(item);
        };
        
        request.onerror = (event) => {
          console.error(`Error saving to ${storeName}:`, event);
          reject('Error saving data');
        };
      })
      .catch(reject);
  });
};

// Get an item from a store by ID
export const getItem = <T>(storeName: string, id: string): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    getStore(storeName)
      .then(store => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          console.error(`Error getting item from ${storeName}:`, event);
          reject('Error retrieving data');
        };
      })
      .catch(reject);
  });
};

// Get all items from a store
export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    getStore(storeName)
      .then(store => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        
        request.onerror = (event) => {
          console.error(`Error getting all items from ${storeName}:`, event);
          reject('Error retrieving all data');
        };
      })
      .catch(reject);
  });
};

// Delete an item from a store
export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    getStore(storeName, 'readwrite')
      .then(store => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error(`Error deleting from ${storeName}:`, event);
          reject('Error deleting data');
        };
      })
      .catch(reject);
  });
};

// Clear all items from a store
export const clearStore = (storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    getStore(storeName, 'readwrite')
      .then(store => {
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error(`Error clearing ${storeName}:`, event);
          reject('Error clearing data');
        };
      })
      .catch(reject);
  });
};

// Data migration utilities
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // Migrate question banks
    const questionLibrary = localStorage.getItem('questionLibrary');
    if (questionLibrary) {
      const qbanks = JSON.parse(questionLibrary);
      for (const qbank of qbanks) {
        await putItem(STORES.QBANKS, qbank);
      }
      console.log('Migrated question banks from localStorage to IndexedDB');
    }
    
    // Migrate quiz history
    const quizHistory = localStorage.getItem('quizHistory');
    if (quizHistory) {
      const history = JSON.parse(quizHistory);
      // Store as a single object with an ID for easy retrieval
      await putItem(STORES.QUIZ_HISTORY, { id: 'history', data: history });
      console.log('Migrated quiz history from localStorage to IndexedDB');
    }
    
    // Migrate question metrics
    const questionMetrics = localStorage.getItem('questionMetricsStore');
    if (questionMetrics) {
      const metrics = JSON.parse(questionMetrics);
      await putItem(STORES.QUESTION_METRICS, { id: 'metrics', data: metrics });
      console.log('Migrated question metrics from localStorage to IndexedDB');
    }
  } catch (error) {
    console.error('Error migrating data from localStorage:', error);
    throw error;
  }
};
