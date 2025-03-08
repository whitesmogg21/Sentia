
import { useEffect, useState } from 'react';
import { initDB, migrateFromLocalStorage } from '@/utils/indexedDBUtils';

export function useDBInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Initialize the database
        await initDB();
        
        // Migrate data from localStorage if needed
        await migrateFromLocalStorage();
        
        setIsInitialized(true);
        console.log('IndexedDB initialized successfully');
      } catch (err) {
        console.error('Failed to initialize IndexedDB:', err);
        setError(err instanceof Error ? err : new Error('Unknown error initializing IndexedDB'));
      }
    };

    initializeDB();
  }, []);

  return { isInitialized, error };
}
