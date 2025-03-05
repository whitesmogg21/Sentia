
import { Question, QBank } from "../types/quiz";

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

// Load question banks from localStorage or use defaults
const loadQBanks = (): QBank[] => {
  try {
    const savedQBanks = localStorage.getItem('questionLibrary');
    if (savedQBanks) {
      console.log('Loaded question banks from localStorage');
      return JSON.parse(savedQBanks);
    }
  } catch (error) {
    console.error('Error loading question banks from localStorage:', error);
  }
  console.log('Using default question banks');
  return JSON.parse(JSON.stringify(defaultQBanks)); // Return a deep copy of the defaults
};

// Helper function to save qbanks to localStorage
export const saveQBanksToStorage = (): void => {
  try {
    localStorage.setItem('questionLibrary', JSON.stringify(qbanks));
    console.log('Question banks saved to localStorage:', qbanks.length);
  } catch (error) {
    console.error('Error saving question banks to localStorage:', error);
  }
};

// Initialize qbanks when the module loads
qbanks = loadQBanks();

// This function ensures all tags are represented as question banks
export const ensureTagsAsQBanks = (): void => {
  // Get all unique tags from all questions
  const allTags = new Set<string>();
  
  // First collect all tags
  qbanks.forEach(qbank => {
    qbank.questions.forEach(question => {
      question.tags.forEach(tag => allTags.add(tag));
    });
  });
  
  // Then ensure each tag has a corresponding QBank
  allTags.forEach(tag => {
    if (!qbanks.some(qbank => qbank.id === tag)) {
      // Create a new QBank for this tag
      const newQBank: QBank = {
        id: tag,
        name: tag.charAt(0).toUpperCase() + tag.slice(1),
        description: `Questions tagged with ${tag}`,
        questions: []
      };
      
      // Add all questions with this tag to the new QBank
      qbanks.forEach(qbank => {
        qbank.questions.forEach(question => {
          if (question.tags.includes(tag)) {
            // Create a copy of the question for the new QBank
            newQBank.questions.push({...question, qbankId: tag});
          }
        });
      });
      
      // Add the new QBank to the list
      qbanks.push(newQBank);
    }
  });
  
  // Save the updated qbanks
  saveQBanksToStorage();
  console.log('Ensured all tags have QBanks:', qbanks.length);
};

// Call this function after loading QBanks to ensure all tags have QBanks
ensureTagsAsQBanks();
