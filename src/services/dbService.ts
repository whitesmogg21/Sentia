
import { Question, QBank, MediaItem } from "../types/quiz";

// Database configuration
const DB_NAME = "QuizDatabase";
const DB_VERSION = 1;
const STORES = {
  QBANKS: "qbanks",
  MEDIA: "media"
};

// Initialize the database
export const initializeDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log("Database opened successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.QBANKS)) {
        db.createObjectStore(STORES.QBANKS, { keyPath: "id" });
        console.log("QBanks store created");
      }
      
      if (!db.objectStoreNames.contains(STORES.MEDIA)) {
        const mediaStore = db.createObjectStore(STORES.MEDIA, { keyPath: "url" });
        mediaStore.createIndex("type", "type", { unique: false });
        console.log("Media store created");
      }
    };
  });
};

// QBanks operations
export const saveQBanks = async (qbanks: QBank[]): Promise<void> => {
  const db = await initializeDatabase();
  const transaction = db.transaction(STORES.QBANKS, "readwrite");
  const store = transaction.objectStore(STORES.QBANKS);
  
  // Clear existing data
  store.clear();
  
  // Add each qbank
  qbanks.forEach(qbank => {
    store.add(qbank);
  });
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      console.log("QBanks saved successfully");
      db.close();
      resolve();
    };
    
    transaction.onerror = (event) => {
      console.error("Error saving QBanks:", transaction.error);
      db.close();
      reject(transaction.error);
    };
  });
};

export const loadQBanks = async (): Promise<QBank[]> => {
  const db = await initializeDatabase();
  const transaction = db.transaction(STORES.QBANKS, "readonly");
  const store = transaction.objectStore(STORES.QBANKS);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      console.log("QBanks loaded successfully");
      db.close();
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error("Error loading QBanks:", request.error);
      db.close();
      reject(request.error);
    };
  });
};

// Media operations
export const saveMedia = async (media: { url: string, data: Blob, type: string }): Promise<void> => {
  const db = await initializeDatabase();
  const transaction = db.transaction(STORES.MEDIA, "readwrite");
  const store = transaction.objectStore(STORES.MEDIA);
  
  store.put(media);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      console.log("Media saved successfully");
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      console.error("Error saving media:", transaction.error);
      db.close();
      reject(transaction.error);
    };
  });
};

export const loadMedia = async (url: string): Promise<Blob | null> => {
  const db = await initializeDatabase();
  const transaction = db.transaction(STORES.MEDIA, "readonly");
  const store = transaction.objectStore(STORES.MEDIA);
  const request = store.get(url);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      if (request.result) {
        resolve(request.result.data);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      console.error("Error loading media:", request.error);
      db.close();
      reject(request.error);
    };
  });
};

export const getAllMedia = async (): Promise<MediaItem[]> => {
  const db = await initializeDatabase();
  const transaction = db.transaction(STORES.MEDIA, "readonly");
  const store = transaction.objectStore(STORES.MEDIA);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      console.log("Media items loaded successfully");
      db.close();
      const mediaItems = request.result.map(item => ({
        url: item.url,
        type: item.type
      }));
      resolve(mediaItems);
    };
    
    request.onerror = () => {
      console.error("Error loading media items:", request.error);
      db.close();
      reject(request.error);
    };
  });
};
