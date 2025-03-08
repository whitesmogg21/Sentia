
import { Question, QBank } from "../types/quiz";
import { STORES, putItem, getAllItems, getItem } from "@/utils/indexedDB";

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
export const loadQBanks = async (): Promise<QBank[]> => {
  try {
    // Try to get qbanks from IndexedDB
    const banksFromDB = await getAllItems<QBank>(STORES.QBANKS);
    
    if (banksFromDB && banksFromDB.length > 0) {
      console.log('Loaded question banks from IndexedDB:', banksFromDB.length);
      // Ensure questions are arrays, not promises
      qbanks = banksFromDB.map(bank => ({
        ...bank,
        questions: Array.isArray(bank.questions) ? bank.questions : []
      }));
      return qbanks;
    }
    
    // If not in IndexedDB, try localStorage for migration
    try {
      const savedQBanks = localStorage.getItem('questionLibrary');
      if (savedQBanks) {
        const parsedBanks = JSON.parse(savedQBanks);
        console.log('Loaded question banks from localStorage for migration');
        
        // Migrate to IndexedDB
        for (const bank of parsedBanks) {
          await putItem(STORES.QBANKS, bank);
        }
        
        qbanks = parsedBanks;
        return qbanks;
      }
    } catch (error) {
      console.error('Error loading question banks from localStorage:', error);
    }
    
    // If no stored qbanks found, use defaults
    console.log('Using default question banks');
    const defaultCopy = JSON.parse(JSON.stringify(defaultQBanks)); // Return a deep copy of the defaults
    
    // Save defaults to IndexedDB for future use
    for (const bank of defaultCopy) {
      await putItem(STORES.QBANKS, bank);
    }
    
    qbanks = defaultCopy;
    return qbanks;
  } catch (error) {
    console.error('Error in loadQBanks:', error);
    
    // Last resort - use default question banks without saving
    qbanks = JSON.parse(JSON.stringify(defaultQBanks));
    return qbanks;
  }
};

// Helper function to save qbanks to IndexedDB
export const saveQBanksToStorage = async (): Promise<void> => {
  try {
    // Save each qbank to IndexedDB
    for (const bank of qbanks) {
      // Make sure questions is an array before saving
      const bankToSave = {
        ...bank,
        questions: Array.isArray(bank.questions) ? bank.questions : []
      };
      await putItem(STORES.QBANKS, bankToSave);
    }
    
    // Also update localStorage for backward compatibility
    localStorage.setItem('questionLibrary', JSON.stringify(qbanks));
    console.log('Question banks saved successfully:', qbanks.length);
  } catch (error) {
    console.error('Error saving question banks:', error);
    
    // Fallback to localStorage
    try {
      localStorage.setItem('questionLibrary', JSON.stringify(qbanks));
    } catch (e) {
      console.error('Failed to save to localStorage too:', e);
    }
  }
};

// We'll initialize on-demand now instead of on load
if (qbanks.length === 0) {
  loadQBanks().then(loaded => {
    qbanks = loaded;
  }).catch(error => {
    console.error("Error initializing qbanks:", error);
    qbanks = JSON.parse(JSON.stringify(defaultQBanks)); // Fallback to defaults
  });
}
