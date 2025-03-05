import { Question, QuestionAttempt, QuestionCategory, QuestionMetricsEntry, QuestionMetricsStore } from "@/types/quiz";
import { qbanks } from "@/data/questions";

const METRICS_STORAGE_KEY = 'questionMetricsStore';

// Initialize metrics for all questions
export const initializeMetrics = (): void => {
  const existingMetrics = getMetricsStore();
  let updated = false;
  
  // Initialize all questions
  qbanks.forEach(qbank => {
    qbank.questions.forEach(question => {
      if (!existingMetrics[question.id]) {
        existingMetrics[question.id] = {
          status: 'unused',
          isFlagged: Boolean(question.isFlagged)
        };
        updated = true;
      }
    });
  });
  
  // Clean up metrics for deleted questions
  const allQuestionIds = new Set<number>();
  qbanks.forEach(qbank => {
    qbank.questions.forEach(question => {
      allQuestionIds.add(question.id);
    });
  });
  
  Object.keys(existingMetrics).forEach(idStr => {
    const id = parseInt(idStr);
    if (!allQuestionIds.has(id)) {
      delete existingMetrics[id];
      updated = true;
    }
  });
  
  if (updated) {
    saveMetricsStore(existingMetrics);
  }
};

// Get the full metrics store
export const getMetricsStore = (): QuestionMetricsStore => {
  const storedMetrics = localStorage.getItem(METRICS_STORAGE_KEY);
  return storedMetrics ? JSON.parse(storedMetrics) : {};
};

// Save the metrics store
export const saveMetricsStore = (metrics: QuestionMetricsStore): void => {
  localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
};

// Update metrics for a single question
export const updateQuestionMetrics = (
  questionId: number,
  status: QuestionCategory,
  isFlagged?: boolean
): void => {
  const metrics = getMetricsStore();
  
  // Get existing entry or create a new one
  const entry = metrics[questionId] || {
    status: 'unused',
    isFlagged: false
  };
  
  // Update status
  entry.status = status;
  entry.lastAttemptDate = new Date().toISOString();
  
  // Only update flag status if explicitly provided
  if (isFlagged !== undefined) {
    entry.isFlagged = isFlagged;
  }
  
  metrics[questionId] = entry;
  saveMetricsStore(metrics);
};

// Update metrics after a quiz attempt
export const updateMetricsFromAttempt = (attempt: QuestionAttempt): void => {
  let status: QuestionCategory;
  
  if (attempt.selectedAnswer === null) {
    status = 'omitted';
  } else if (attempt.isCorrect) {
    status = 'correct';
  } else {
    status = 'incorrect';
  }
  
  updateQuestionMetrics(attempt.questionId, status, attempt.isFlagged);
};

// Update flag status for a question
export const updateQuestionFlag = (questionId: number, isFlagged: boolean): void => {
  const metrics = getMetricsStore();
  
  if (!metrics[questionId]) {
    metrics[questionId] = {
      status: 'unused',
      isFlagged
    };
  } else {
    metrics[questionId].isFlagged = isFlagged;
  }
  
  saveMetricsStore(metrics);
};

// Reset all metrics to unused (but keep flags)
export const resetMetrics = (): void => {
  const metrics = getMetricsStore();
  
  Object.keys(metrics).forEach(questionId => {
    const flagged = metrics[questionId].isFlagged;
    metrics[questionId] = {
      status: 'unused',
      isFlagged: flagged
    };
  });
  
  saveMetricsStore(metrics);
};

// Calculate metrics counts
export const calculateMetrics = () => {
  const metrics = getMetricsStore();
  
  const counts = {
    unused: 0,
    used: 0,
    correct: 0,
    incorrect: 0,
    omitted: 0,
    flagged: 0
  };
  
  // Count questions in each category
  Object.values(metrics).forEach(entry => {
    counts[entry.status]++;
    if (entry.status !== 'unused') {
      counts.used++;
    }
    if (entry.isFlagged) {
      counts.flagged++;
    }
  });
  
  return counts;
};

// Get filtered questions based on active filters
export const getFilteredQuestions = (questions: Question[], activeFilters: string[]): Question[] => {
  // If no filters are active, return all questions
  if (activeFilters.length === 0) return questions;
  
  const metrics = getMetricsStore();
  
  return questions.filter(question => {
    // If no metrics for this question yet, it's unused
    const questionMetrics = metrics[question.id] || { status: 'unused', isFlagged: false };
    
    // Check if this question matches any of the active filters
    return activeFilters.some(filter => {
      switch (filter) {
        case 'unused':
          return questionMetrics.status === 'unused';
        case 'used':
          return questionMetrics.status !== 'unused';
        case 'correct':
          return questionMetrics.status === 'correct';
        case 'incorrect':
          return questionMetrics.status === 'incorrect';
        case 'omitted':
          return questionMetrics.status === 'omitted';
        case 'flagged':
          return questionMetrics.isFlagged;
        default:
          return false;
      }
    });
  });
};
