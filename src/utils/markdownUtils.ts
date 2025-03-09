
import React from 'react';

// A simplified function to render text as plain HTML
export const renderMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [null];

  // Split text by newlines to handle paragraphs
  const paragraphs = text.split('\n\n').filter(Boolean);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Return paragraph as plain text
    return React.createElement('p', { 
      key: pIndex,
      dangerouslySetInnerHTML: { __html: paragraph },
      className: "mb-2" 
    });
  });
};
