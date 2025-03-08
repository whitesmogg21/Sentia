
import React from 'react';

// A simple function to convert markdown to React elements
export const renderMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [null];

  // Split text by newlines to handle paragraphs
  const paragraphs = text.split('\n\n').filter(Boolean);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Process bold text: **text** -> <strong>text</strong>
    let processed = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Process italic text: _text_ -> <em>text</em>
    processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Process code: `text` -> <code>text</code>
    processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Process lists
    if (paragraph.match(/^-\s/m)) {
      const items = paragraph.split(/^-\s/m).filter(Boolean);
      return (
        <ul key={pIndex} className="list-disc pl-5 my-2">
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
    }
    
    // Process numbered lists
    if (paragraph.match(/^\d+\.\s/m)) {
      const items = paragraph.split(/^\d+\.\s/m).filter(Boolean);
      return (
        <ol key={pIndex} className="list-decimal pl-5 my-2">
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>
      );
    }
    
    // Return paragraph with inline formatting
    return <p key={pIndex} dangerouslySetInnerHTML={{ __html: processed }} className="mb-2" />;
  });
};
