
import React from 'react';

// A function to convert markdown to React elements
export const renderMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [null];

  // Split text by newlines to handle paragraphs
  const paragraphs = text.split('\n\n').filter(Boolean);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Process markdown formatting
    let processed = paragraph;
    
    // Handle bold text with proper regex replacement
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Process italic text: _text_ -> <em>text</em>
    processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Process code: `text` -> <code>text</code>
    processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Process lists
    if (paragraph.match(/^-\s/m)) {
      const items = paragraph.split(/^-\s/m).filter(Boolean);
      return React.createElement(
        'ul',
        { key: pIndex, className: "list-disc pl-5 my-2" },
        items.map((item, i) => 
          React.createElement('li', { 
            key: i, 
            dangerouslySetInnerHTML: { __html: item } 
          })
        )
      );
    }
    
    // Process numbered lists
    if (paragraph.match(/^\d+\.\s/m)) {
      const items = paragraph.split(/^\d+\.\s/m).filter(Boolean);
      return React.createElement(
        'ol',
        { key: pIndex, className: "list-decimal pl-5 my-2" },
        items.map((item, i) => 
          React.createElement('li', { 
            key: i, 
            dangerouslySetInnerHTML: { __html: item } 
          })
        )
      );
    }
    
    // Return paragraph with inline formatting
    return React.createElement('p', { 
      key: pIndex, 
      dangerouslySetInnerHTML: { __html: processed },
      className: "mb-2" 
    });
  });
};
