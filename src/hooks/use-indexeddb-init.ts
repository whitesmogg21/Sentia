
import { useEffect, useState } from 'react';
import { initDB, migrateFromLocalStorage } from '@/utils/indexedDB';
import { loadQBanks } from '@/data/questions';

export function useIndexedDBInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Initialize the IndexedDB
        await initDB();
        console.log('IndexedDB initialized successfully');
        
        // Migrate data from localStorage if needed
        await migrateFromLocalStorage();
        
        // Load initial qbanks data 
        await loadQBanks();
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing IndexedDB:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initializeDB();
  }, []);

  return { isInitialized, error };
}

export default useIndexedDBInit;
