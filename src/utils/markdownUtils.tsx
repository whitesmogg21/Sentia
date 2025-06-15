
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Parse and render Markdown text as React elements
 */
export const renderMarkdown = (text: string, onImageClick?: (imageName: string) => void): React.ReactNode[] => {
  if (!text) return [null];

  // Extract both types of image references
  const imageReferences: { placeholder: string; imageName: string; type: 'button' | 'inline' }[] = [];
  let processedText = text;
  let placeholderIndex = 0;

  // Find inline images first (//image.png)
  const inlineImageRegex = /\/\/([^\/\s]+\.(png|jpg|jpeg|gif))/gi;
  let match;

  while ((match = inlineImageRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const imageName = match[1];
    const placeholder = `__INLINE_IMAGE_PLACEHOLDER_${placeholderIndex}__`;

    imageReferences.push({
      placeholder,
      imageName,
      type: 'inline'
    });

    // Replace the image reference with a placeholder
    processedText = processedText.replace(fullMatch, placeholder);
    placeholderIndex++;
  }

  // Find clickable image buttons (/image.png) - but not those that are part of //
  const buttonImageRegex = /(?<!\/)\/([^\/\s]+\.(png|jpg|jpeg|gif))/gi;

  while ((match = buttonImageRegex.exec(processedText)) !== null) {
    const fullMatch = match[0];
    const imageName = match[1];
    const placeholder = `__BUTTON_IMAGE_PLACEHOLDER_${placeholderIndex}__`;

    imageReferences.push({
      placeholder,
      imageName,
      type: 'button'
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

    // Convert markdown images: ![alt](url) to <img src="url" alt="alt" loading="lazy" style="max-width: 100%;" />
    formattedText = formattedText.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" loading="lazy" style="max-width: 100%;" />');

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

    // Replace image placeholders
    imageReferences.forEach(ref => {
      if (formattedText.includes(ref.placeholder)) {
        if (ref.type === 'inline') {
          // For inline images, we'll need to handle them differently
          // We'll create a special marker that we'll process after dangerouslySetInnerHTML
          const inlineImageHtml = `<div class="inline-image-container" data-image-name="${ref.imageName}"></div>`;
          formattedText = formattedText.replace(ref.placeholder, inlineImageHtml);
        } else if (ref.type === 'button' && onImageClick) {
          const buttonHtml = `<button class="inline-flex items-center justify-center p-1 mx-1 bg-muted hover:bg-muted/80 rounded-md" data-image-name="${ref.imageName}" aria-label="View image ${ref.imageName}"><span class="sr-only">View image</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>`;
          formattedText = formattedText.replace(ref.placeholder, buttonHtml);
        } else {
          formattedText = formattedText.replace(ref.placeholder, '');
        }
      }
    });

    // Return paragraph with processed markdown
    const element = React.createElement('div', {
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
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }
      },
      onKeyDown: (e) => {
        // Add keyboard accessibility for image buttons
        if (onImageClick && e.key === 'Enter') {
          const target = e.target as HTMLElement;
          if (target.tagName === 'BUTTON' && target.hasAttribute('data-image-name')) {
            const imageName = target.getAttribute('data-image-name');
            if (imageName) {
              onImageClick(imageName);
              e.preventDefault();
            }
          }
        }
      }
    });

    // After creating the element, we need to handle inline images
    // We'll use useEffect in a wrapper component to replace the placeholders
    return React.createElement(InlineImageWrapper, {
      key: pIndex,
      element: element,
      imageReferences: imageReferences.filter(ref => ref.type === 'inline'),
      onImageClick
    });
  });
};

// Wrapper component to handle inline image rendering
const InlineImageWrapper = ({ element, imageReferences, onImageClick }: {
  element: React.ReactElement;
  imageReferences: { placeholder: string; imageName: string; type: 'inline' }[];
  onImageClick?: (imageName: string) => void;
}) => {
  const [mediaMap, setMediaMap] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    // Load media from localStorage
    try {
      const savedMedia = localStorage.getItem('mediaLibrary');
      if (savedMedia) {
        const mediaItems = JSON.parse(savedMedia) as { name: string; data: string }[];
        const map: Record<string, string> = {};
        mediaItems.forEach(item => {
          map[item.name] = item.data;
        });
        setMediaMap(map);
      }
    } catch (err) {
      console.error("Error loading media library:", err);
    }
  }, []);

  React.useEffect(() => {
    if (Object.keys(mediaMap).length === 0) return;

    // Find and replace inline image containers with actual images
    const containers = document.querySelectorAll('.inline-image-container');
    containers.forEach(container => {
      const imageName = container.getAttribute('data-image-name');
      if (imageName && mediaMap[imageName]) {
        const img = document.createElement('img');
        img.src = mediaMap[imageName];
        img.alt = imageName;
        img.loading = 'lazy';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '8px 0';
        img.className = 'rounded-md border';
        
        // Add click handler for modal if provided
        if (onImageClick) {
          img.style.cursor = 'pointer';
          img.onclick = () => onImageClick(imageName);
        }
        
        container.replaceWith(img);
      }
    });
  }, [mediaMap, onImageClick]);

  return element;
};

/**
 * Extract all image references from text
 */
export const extractImageReferences = (text: string): string[] => {
  if (!text) return [];

  const imageRegex = /\/\/?([^\/\s]+\.(png|jpg|jpeg|gif))/gi;
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
  onImageClick: (imageName: string) => void
): React.ReactNode[] => {
  return imageNames.map((imageName, index) => {
    return React.createElement(
      Button,
      {
        key: index,
        onClick: () => onImageClick(imageName),
        variant: "ghost",
        size: "icon",
        className: "mx-1 inline-flex items-center",
        'aria-label': `View image ${imageName}`
      },
      React.createElement(ImageIcon, { className: "h-4 w-4" }),
      React.createElement('span', { className: "sr-only" }, `View image ${imageName}`)
    );
  });
};
