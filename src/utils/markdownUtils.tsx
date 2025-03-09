
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Parse and render Markdown text as React elements
 */
export const renderMarkdown = (text: string, onImageClick?: (imageName: string) => void): React.ReactNode[] => {
  if (!text) return [null];

  // Extract image references with /path format first
  const imageReferences: { placeholder: string; imageName: string }[] = [];
  let processedText = text;
  
  // Find all standalone image references like /image.png
  const imageRegex = /\/([^\/\s]+\.(png|jpg|jpeg|gif))/gi;
  let match;
  let placeholderIndex = 0;
  
  while ((match = imageRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const imageName = match[1];
    const placeholder = `__IMAGE_PLACEHOLDER_${placeholderIndex}__`;
    
    imageReferences.push({ 
      placeholder, 
      imageName 
    });
    
    // Replace the image reference with a placeholder
    processedText = processedText.replace(fullMatch, placeholder);
    placeholderIndex++;
  }

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
    
    // Replace image placeholders with buttons
    imageReferences.forEach(ref => {
      if (formattedText.includes(ref.placeholder)) {
        if (onImageClick) {
          const buttonHtml = `<button class="inline-flex items-center justify-center p-1 mx-1 bg-muted hover:bg-muted/80 rounded-md" data-image-name="${ref.imageName}" aria-label="View image"><span class="sr-only">View image</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>`;
          formattedText = formattedText.replace(ref.placeholder, buttonHtml);
        } else {
          formattedText = formattedText.replace(ref.placeholder, '');
        }
      }
    });
    
    // Return paragraph with processed markdown
    const el = React.createElement('div', { 
      key: pIndex,
      dangerouslySetInnerHTML: { __html: formattedText },
      className: "mb-2",
      onClick: (e) => {
        // Handle clicks on image buttons
        if (onImageClick) {
          const target = e.target as HTMLElement;
          const button = target.closest('button[data-image-name]');
          if (button) {
            const imageName = button.getAttribute('data-image-name');
            if (imageName) {
              onImageClick(imageName);
            }
          }
        }
      }
    });
    
    return el;
  });
};

/**
 * Extract all image references from text
 */
export const extractImageReferences = (text: string): string[] => {
  if (!text) return [];
  
  const imageRegex = /\/([^\/\s]+\.(png|jpg|jpeg|gif))/gi;
  const matches: string[] = [];
  let match;
  
  while ((match = imageRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
};

/**
 * Create image buttons from image references
 */
export const createImageButtons = (
  imageNames: string[], 
  mediaLibrary: any[], 
  onImageClick: (imageName: string) => void
): React.ReactNode[] => {
  return imageNames.map((imageName, index) => {
    const mediaItem = mediaLibrary.find(m => m.name === imageName);
    if (mediaItem) {
      return React.createElement(
        'button',
        {
          key: index,
          onClick: () => onImageClick(imageName),
          className: "inline-flex items-center justify-center p-1 mx-1 bg-muted hover:bg-muted/80 rounded-md",
          'aria-label': `View image ${imageName}`
        },
        React.createElement('span', { className: "sr-only" }, "View image"),
        React.createElement(ImageIcon, { className: "h-4 w-4" })
      );
    }
    return null;
  }).filter(Boolean);
};
