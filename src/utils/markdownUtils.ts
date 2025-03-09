
import React from 'react';
import katex from 'katex';

// A function to convert markdown to React elements
export const renderMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [null];

  // Process LaTeX formulas first
  // Look for $$ ... $$ (display math) and $ ... $ (inline math)
  text = text.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
    try {
      return `<div class="katex-display">${katex.renderToString(formula, { displayMode: true, throwOnError: false })}</div>`;
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return match; // Return the original text on error
    }
  });

  text = text.replace(/\$(.*?)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: false, throwOnError: false });
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return match; // Return the original text on error
    }
  });

  // Split text by newlines to handle paragraphs
  const paragraphs = text.split('\n\n').filter(Boolean);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Process bold text: **text** -> <strong>text</strong>
    let processed = paragraph;
    
    // Handle bold text with proper regex replacement
    processed = processed.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      return `<strong>${content}</strong>`;
    });
    
    // Process italic text: _text_ -> <em>text</em>
    processed = processed.replace(/_(.*?)_/g, (match, content) => {
      return `<em>${content}</em>`;
    });
    
    // Process code: `text` -> <code>text</code>
    processed = processed.replace(/`(.*?)`/g, (match, content) => {
      return `<code>${content}</code>`;
    });
    
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
    
    // Handle line breaks within paragraphs
    processed = processed.replace(/\n/g, '<br />');
    
    // Return paragraph with inline formatting
    return React.createElement('p', { 
      key: pIndex, 
      dangerouslySetInnerHTML: { __html: processed },
      className: "mb-2" 
    });
  });
};

// Helper function to extract and render images from text
export const extractImages = (text: string, mediaLibrary: any[], onImageClick: (data: string, name: string) => void) => {
  if (!text || !text.includes('/')) return { content: text, imageButtons: [] };
  
  const parts = text.split('/');
  const imageButtons: React.ReactNode[] = [];
  
  parts.forEach((part, index) => {
    if (part.match(/\.(png|jpg|jpeg|gif)$/i)) {
      const mediaItem = mediaLibrary.find(m => m.name === part);
      if (mediaItem) {
        imageButtons.push(
          React.createElement('button', {
            key: index,
            className: "mx-1 inline-flex items-center p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            onClick: () => onImageClick(mediaItem.data, mediaItem.name),
          }, '📎 ' + part)
        );
      }
    }
  });
  
  return { content: text, imageButtons };
};
