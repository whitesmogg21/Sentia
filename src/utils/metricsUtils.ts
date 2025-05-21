import { Question, QuestionAttempt, QuestionCategory, QuestionMetricsEntry, QuestionMetricsStore, QuestionFilter } from "@/types/quiz";
import { qbanks } from "@/data/questions";

const METRICS_STORAGE_KEY = 'questionMetricsStore';

// Initialize metrics for all questions
export const initializeMetrics = (): void => {
  const existingMetrics = getMetricsStore();
  let updated = false;

  // Initialize all questions
  qbanks.forEach(qbank => {
    qbank.questions.forEach(question => {
      // Check if this question exists in metrics
      if (!existingMetrics[question.id]) {
        // If not, initialize it as unused (or set based on attempts if they exist)
        if (question.attempts && question.attempts.length > 0) {
          // This question has been attempted but metrics were lost - reconstruct from attempts
          const lastAttempt = question.attempts[question.attempts.length - 1];
          let status: QuestionCategory = 'unused';

          if (lastAttempt.selectedAnswer === null) {
            status = 'omitted';
          } else if (lastAttempt.isCorrect) {
            status = 'correct';
          } else {
            status = 'incorrect';
          }

          existingMetrics[question.id] = {
            status,
            lastAttemptDate: lastAttempt.date,
            isFlagged: Boolean(question.isFlagged)
          };
        } else {
          // No attempts, initialize as unused
          existingMetrics[question.id] = {
            status: 'unused',
            isFlagged: Boolean(question.isFlagged)
          };
        }
        updated = true;
      } else {
        // Question exists in metrics, do not sync isFlagged from qbanks
        // This prevents overwriting user flag actions
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

    // Also check question attempts directly in case metrics are out of sync
    const hasBeenAttempted = question.attempts && question.attempts.length > 0;
    const lastAttempt = hasBeenAttempted ? question.attempts[question.attempts.length - 1] : null;

    // Check if this question matches any of the active filters
    return activeFilters.some(filter => {
      switch (filter) {
        case 'unused':
          return questionMetrics.status === 'unused' || !hasBeenAttempted;
        case 'used':
          return questionMetrics.status !== 'unused' || hasBeenAttempted;
        case 'correct':
          return questionMetrics.status === 'correct' ||
                 (lastAttempt && lastAttempt.isCorrect);
        case 'incorrect':
          return questionMetrics.status === 'incorrect' ||
                 (lastAttempt && !lastAttempt.isCorrect && lastAttempt.selectedAnswer !== null);
        case 'omitted':
          return questionMetrics.status === 'omitted' ||
                 (lastAttempt && lastAttempt.selectedAnswer === null);
        case 'flagged':
          return questionMetrics.isFlagged || question.isFlagged;
        default:
          return false;
      }
    });
  });
};

// Add this new function to metricsUtils.ts
export function syncFiltersWithLocalStorage(): QuestionFilter {
  // Default state - all filters off
  const defaultFilters: QuestionFilter = {
    unused: false,
    used: false,
    incorrect: false,
    correct: false,
    flagged: false,
    omitted: false,
  };

  // Check if we have a filtered QBank stored
  const filteredQBankString = localStorage.getItem("filteredQBank");
  if (!filteredQBankString) {
    return defaultFilters;
  }

  try {
    // Get the filtered QBank and the active filters from localStorage
    const savedFilters = localStorage.getItem('questionFilters');
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }

    // If no saved filters but we have a filtered QBank,
    // we need to determine which filters were active
    const filteredQBank = JSON.parse(filteredQBankString);
    const metrics = getMetricsStore();

    // Create a map to track if we've found questions for each filter
    const foundFilters: QuestionFilter = { ...defaultFilters };

    // Check each question in the filtered QBank to determine which filters are active
    filteredQBank.questions.forEach((question: Question) => {
      const questionId = question.id;
      const metric = metrics[questionId] || { status: 'unused', isFlagged: false };

      // Set filters based on question status
      switch (metric.status) {
        case 'unused':
          foundFilters.unused = true;
          break;
        case 'correct':
          foundFilters.correct = true;
          foundFilters.used = true;
          break;
        case 'incorrect':
          foundFilters.incorrect = true;
          foundFilters.used = true;
          break;
        case 'omitted':
          foundFilters.omitted = true;
          foundFilters.used = true;
          break;
      }

      if (question.isFlagged || metric.isFlagged) {
        foundFilters.flagged = true;
      }
    });

    return foundFilters;
  } catch (error) {
    console.error("Error syncing filters with localStorage:", error);
    return defaultFilters;
  }
};

// Remove metrics for a deleted question
export const removeQuestionMetrics = (questionId: number): void => {
  const metrics = getMetricsStore();
  if (metrics[questionId]) {
    delete metrics[questionId];
    saveMetricsStore(metrics);
  }
};

// Helper to get flag state from metrics store
export const isQuestionFlagged = (questionId: number): boolean => {
  const metrics = getMetricsStore();
  return metrics[questionId]?.isFlagged ?? false;
};