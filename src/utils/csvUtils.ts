
import { QBank } from "@/types/quiz";

export const exportToCSV = (qbank: QBank) => {
  const csvRows = [
    ['Serial', 'Question', 'Correct Answer', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6', 'Option 7', 'Image Filename', 'Explanation'],
    ...qbank.questions.map((q, index) => [
      index + 1,
      q.question,
      q.correctAnswer + 1,
      ...q.options,
      ...(Array(7 - q.options.length).fill('')), // Pad with empty strings if less than 7 options
      q.media?.url ? q.media.url.split('/').pop() : '', // Extract filename from URL
      q.explanation || ''
    ])
  ];

  const csvContent = csvRows.map(row => row.map(cell => 
    `"${String(cell).replace(/"/g, '""')}"`
  ).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${qbank.name}.csv`;
  link.click();
};
