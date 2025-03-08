
import { Question, QBank } from "../types/quiz";
import { getItem, setItem, STORES, migrateFromLocalStorage } from '@/utils/indexedDBUtils';

// Initial default question banks
const defaultQBanks: QBank[] = [
  {
    id: "general",
    name: "General Knowledge",
    description: "Test your general knowledge with these questions",
    questions: [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        qbankId: "general",
        tags: ["general"]
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        qbankId: "general",
        tags: ["general", "science"]
      },
      {
        id: 3,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        qbankId: "general",
        tags: ["general"]
      },
      {
        id: 4,
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correctAnswer: 1,
        qbankId: "general",
        tags: ["general", "art"]
      },
      {
        id: 5,
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Fe", "Au", "Cu"],
        correctAnswer: 2,
        qbankId: "general",
        tags: ["general", "science"]
      }
    ]
  },
  {
    id: "science",
    name: "Science",
    description: "Challenge yourself with science questions",
    questions: [
      {
        id: 6,
        question: "What is the chemical symbol for Oxygen?",
        options: ["O", "Ox", "Om", "On"],
        correctAnswer: 0,
        qbankId: "science",
        tags: ["science"]
      },
      {
        id: 7,
        question: "What is the speed of light?",
        options: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"],
        correctAnswer: 0,
        qbankId: "science",
        tags: ["science"]
      }
    ]
  }
];

// Create the qbanks array that will be used throughout the app
export let qbanks: QBank[] = [];

// Load question banks from IndexedDB or use defaults
const loadQBanks = async (): Promise<QBank[]> => {
  try {
    // First try to get from IndexedDB
    const result = await getItem<{ data: QBank[] }>(STORES.QBANKS, 'allQBanks');
    if (result && result.data && result.data.length > 0) {
      console.log('Loaded question banks from IndexedDB');
      return result.data;
    }
    
    // If not in IndexedDB, try localStorage (for backward compatibility)
    try {
      const savedQBanks = localStorage.getItem('questionLibrary');
      if (savedQBanks) {
        console.log('Loaded question banks from localStorage');
        // Migrate data from localStorage to IndexedDB for future use
        const parsed = JSON.parse(savedQBanks);
        if (parsed && parsed.length > 0) {
          saveQBanksToStorage(parsed);
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading question banks from localStorage:', error);
    }
    
    // If all else fails, use defaults
    console.log('Using default question banks');
    return JSON.parse(JSON.stringify(defaultQBanks)); // Return a deep copy of the defaults
  } catch (error) {
    console.error('Error loading question banks:', error);
    return JSON.parse(JSON.stringify(defaultQBanks));
  }
};

// Helper function to save qbanks to storage
export const saveQBanksToStorage = async (banksToSave?: QBank[]): Promise<void> => {
  try {
    const dataToSave = banksToSave || qbanks;
    
    // Save to IndexedDB
    await setItem(STORES.QBANKS, { id: 'allQBanks', data: dataToSave });
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('questionLibrary', JSON.stringify(dataToSave));
    
    console.log('Question banks saved successfully:', dataToSave.length);
    
    // Dispatch an event to notify components that qbanks have been updated
    window.dispatchEvent(new CustomEvent('qbanksUpdated', { detail: dataToSave }));
  } catch (error) {
    console.error('Error saving question banks:', error);
    
    // Fallback to localStorage if IndexedDB fails
    try {
      localStorage.setItem('questionLibrary', JSON.stringify(banksToSave || qbanks));
    } catch (localError) {
      console.error('Error saving to localStorage as fallback:', localError);
    }
  }
};

// Initialize qbanks when the module loads
// We need to make this async-aware
const initQBanks = async () => {
  try {
    // First check if we need to migrate from localStorage to IndexedDB
    await migrateFromLocalStorage();
    
    // Then load qbanks
    qbanks = await loadQBanks();
    
    // Set up a listener for the 'dbUpdated' event for the QBANKS store
    window.addEventListener('dbUpdated', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.store === STORES.QBANKS) {
        // Reload qbanks when the database is updated
        loadQBanks().then(updatedQBanks => {
          qbanks = updatedQBanks;
        });
      }
    });
  } catch (error) {
    console.error('Error initializing qbanks:', error);
    qbanks = JSON.parse(JSON.stringify(defaultQBanks));
  }
};

// Execute the initialization immediately
initQBanks();

// Export a function to get the latest qbanks (useful for components that need the latest data)
export const getQBanks = async (): Promise<QBank[]> => {
  if (qbanks.length === 0) {
    qbanks = await loadQBanks();
  }
  return qbanks;
};
