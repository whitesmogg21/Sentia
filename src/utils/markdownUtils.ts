
import React from 'react';

/**
 * Parse and render Markdown text as React elements
 */
export const renderMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [null];

  // Pre-process text to avoid processing image references with /path format
  const imageReferences: { index: number; match: string }[] = [];
  let processedText = text.replace(/\/([^\/\s]+\.(png|jpg|jpeg|gif))/gi, (match, _, __, offset) => {
    imageReferences.push({ index: offset, match });
    return `__IMAGE_PLACEHOLDER_${imageReferences.length - 1}__`;
  });

  // Split text by newlines to handle paragraphs
  const paragraphs = processedText.split('\n\n').filter(Boolean);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Process paragraph text with markdown formatting
    let formattedText = paragraph;
    
    // Convert bold: **text** to <strong>text</strong>
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic: *text* to <em>text</em>
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert strikethrough: ~~text~~ to <del>text</del>
    formattedText = formattedText.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Convert inline code: `code` to <code>code</code>
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert blockquotes: > text to <blockquote>text</blockquote>
    if (formattedText.startsWith('> ')) {
      formattedText = `<blockquote>${formattedText.substring(2)}</blockquote>`;
    }
    
    // Convert unordered lists
    if (formattedText.includes('\n- ')) {
      const listItems = formattedText.split('\n- ');
      const listContent = listItems.slice(1).map(item => `<li>${item}</li>`).join('');
      formattedText = `${listItems[0]}<ul>${listContent}</ul>`;
    } else if (formattedText.startsWith('- ')) {
      const listItems = formattedText.split('- ');
      const listContent = listItems.slice(1).map(item => `<li>${item}</li>`).join('');
      formattedText = `<ul>${listContent}</ul>`;
    }
    
    // Convert ordered lists
    const orderedListRegex = /^\d+\.\s/;
    if (formattedText.includes('\n') && orderedListRegex.test(formattedText.split('\n')[1])) {
      const listItems = formattedText.split('\n');
      let listContent = '';
      let nonListContent = '';
      
      listItems.forEach(item => {
        if (orderedListRegex.test(item)) {
          listContent += `<li>${item.replace(/^\d+\.\s/, '')}</li>`;
        } else {
          nonListContent += item;
        }
      });
      
      formattedText = `${nonListContent}<ol>${listContent}</ol>`;
    } else if (orderedListRegex.test(formattedText)) {
      const listItems = formattedText.split('\n');
      const listContent = listItems.map(item => {
        if (orderedListRegex.test(item)) {
          return `<li>${item.replace(/^\d+\.\s/, '')}</li>`;
        }
        return item;
      }).join('');
      
      formattedText = `<ol>${listContent}</ol>`;
    }
    
    // Convert links: [title](url) to <a href="url">title</a>
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert markdown images: ![alt](url) to <img src="url" alt="alt" />
    formattedText = formattedText.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />');
    
    // Convert headings: # Heading to <h1>Heading</h1>
    if (formattedText.startsWith('# ')) {
      formattedText = `<h1>${formattedText.substring(2)}</h1>`;
    } else if (formattedText.startsWith('## ')) {
      formattedText = `<h2>${formattedText.substring(3)}</h2>`;
    } else if (formattedText.startsWith('### ')) {
      formattedText = `<h3>${formattedText.substring(4)}</h3>`;
    }

    // Horizontal rule
    if (formattedText === '---') {
      formattedText = '<hr />';
    }
    
    // Replace image placeholders with their original notation
    imageReferences.forEach((ref, i) => {
      formattedText = formattedText.replace(`__IMAGE_PLACEHOLDER_${i}__`, `/${ref.match}`);
    });
    
    // Return paragraph with processed markdown
    return React.createElement('div', { 
      key: pIndex,
      dangerouslySetInnerHTML: { __html: formattedText },
      className: "mb-2" 
    });
  });
};
