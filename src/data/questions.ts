
export const qbanks = [
  {
    id: "qbank1",
    name: "Basic Math",
    description: "Basic arithmetic operations",
    questions: [
      {
        id: 1,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        qbankId: "qbank1",
        tags: [], // Added empty tags array to satisfy TypeScript
        attempts: [],
        isFlagged: false,
      },
      {
        id: 2,
        question: "What is 5 - 3?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        qbankId: "qbank1",
        tags: [],
        attempts: [],
        isFlagged: false,
      },
      {
        id: 3,
        question: "What is 3 × 4?",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        qbankId: "qbank1",
        tags: [],
        attempts: [],
        isFlagged: false,
      },
      {
        id: 4,
        question: "What is 8 ÷ 2?",
        options: ["2", "4", "6", "8"],
        correctAnswer: 1,
        qbankId: "qbank1",
        tags: [],
        attempts: [],
        isFlagged: false,
      },
      {
        id: 5,
        question: "What is 10 - 7?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 2,
        qbankId: "qbank1",
        tags: [],
        attempts: [],
        isFlagged: false,
      }
    ]
  },
  {
    id: "qbank2",
    name: "Science",
    description: "Basic science concepts",
    questions: [
      {
        id: 6,
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "N2"],
        correctAnswer: 0,
        qbankId: "qbank2",
        tags: [],
        attempts: [],
        isFlagged: false,
      },
      {
        id: 7,
        question: "What is the closest planet to the Sun?",
        options: ["Venus", "Mars", "Mercury", "Earth"],
        correctAnswer: 2,
        qbankId: "qbank2",
        tags: [],
        attempts: [],
        isFlagged: false,
      }
    ]
  }
];
