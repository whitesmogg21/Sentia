import React from 'react';
import { ImageIcon, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Parse and render Markdown text as React elements
 */
export const renderMarkdown = (text: string, onImageClick?: (imageName: string) => void): React.ReactNode[] => {
  if (!text) return [null];

  // Extract both types of image references and audio references
  const references: { placeholder: string; fileName: string; type: 'button-image' | 'inline-image' | 'audio' }[] = [];
  let processedText = text;
  let placeholderIndex = 0;

  // Find inline images first (//image.png)
  const inlineImageRegex = /\/\/([^\/\s]+\.(png|jpg|jpeg|gif))/gi;
  let match;

  while ((match = inlineImageRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const fileName = match[1];
    const placeholder = `__INLINE_IMAGE_PLACEHOLDER_${placeholderIndex}__`;

    references.push({
      placeholder,
      fileName,
      type: 'inline-image'
    });

    processedText = processedText.replace(fullMatch, placeholder);
    placeholderIndex++;
  }

  // Find clickable image buttons (/image.png) - but not those that are part of //
  const buttonImageRegex = /(?<!\/)\/([^\/\s]+\.(png|jpg|jpeg|gif))/gi;

  while ((match = buttonImageRegex.exec(processedText)) !== null) {
    const fullMatch = match[0];
    const fileName = match[1];
    const placeholder = `__BUTTON_IMAGE_PLACEHOLDER_${placeholderIndex}__`;

    references.push({
      placeholder,
      fileName,
      type: 'button-image'
    });

    processedText = processedText.replace(fullMatch, placeholder);
    placeholderIndex++;
  }

  // Find audio references (/audio.mp3)
  const audioRegex = /\/([^\/\s]+\.(mp3|wav|ogg|m4a))/gi;

  while ((match = audioRegex.exec(processedText)) !== null) {
    const fullMatch = match[0];
    const fileName = match[1];
    const placeholder = `__AUDIO_PLACEHOLDER_${placeholderIndex}__`;

    references.push({
      placeholder,
      fileName,
      type: 'audio'
    });

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

    // Replace placeholders
    references.forEach(ref => {
      if (formattedText.includes(ref.placeholder)) {
        if (ref.type === 'inline-image') {
          const inlineImageHtml = `<div class="inline-image-container" data-image-name="${ref.fileName}"></div>`;
          formattedText = formattedText.replace(ref.placeholder, inlineImageHtml);
        } else if (ref.type === 'button-image' && onImageClick) {
          const buttonHtml = `<button class="inline-flex items-center justify-center p-1 mx-1 bg-muted hover:bg-muted/80 rounded-md" data-image-name="${ref.fileName}" aria-label="View image ${ref.fileName}"><span class="sr-only">View image</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>`;
          formattedText = formattedText.replace(ref.placeholder, buttonHtml);
        } else if (ref.type === 'audio') {
          const audioButtonHtml = `<button class="inline-flex items-center justify-center p-1 mx-1 bg-muted hover:bg-muted/80 rounded-md" data-audio-name="${ref.fileName}" aria-label="Play audio ${ref.fileName}"><span class="sr-only">Play audio</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6,3 20,12 6,21"/></svg></button>`;
          formattedText = formattedText.replace(ref.placeholder, audioButtonHtml);
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

    // Filter to only pass inline image references to the wrapper
    const inlineImageRefs = references.filter(ref => ref.type === 'inline-image') as Array<{ placeholder: string; fileName: string; type: 'inline-image' }>;
    const audioRefs = references.filter(ref => ref.type === 'audio') as Array<{ placeholder: string; fileName: string; type: 'audio' }>;
    
    return React.createElement(MediaWrapper, {
      key: pIndex,
      element: element,
      inlineImageReferences: inlineImageRefs,
      audioReferences: audioRefs,
      onImageClick
    });
  });
};

// Wrapper component to handle inline image and audio rendering
const MediaWrapper = ({ element, inlineImageReferences, audioReferences, onImageClick }: {
  element: React.ReactElement;
  inlineImageReferences: Array<{ placeholder: string; fileName: string; type: 'inline-image' }>;
  audioReferences: Array<{ placeholder: string; fileName: string; type: 'audio' }>;
  onImageClick?: (imageName: string) => void;
}) => {
  const [mediaMap, setMediaMap] = React.useState<Record<string, string>>({});
  const [audioMap, setAudioMap] = React.useState<Record<string, string>>({});
  const [playingAudio, setPlayingAudio] = React.useState<string | null>(null);
  const [pausedAudio, setPausedAudio] = React.useState<string | null>(null);
  const [completedAudio, setCompletedAudio] = React.useState<Set<string>>(new Set());
  const audioElementsRef = React.useRef<{ [key: string]: HTMLAudioElement }>({});

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

      const savedAudio = localStorage.getItem('audioLibrary');
      if (savedAudio) {
        const audioItems = JSON.parse(savedAudio) as { name: string; data: string }[];
        const map: Record<string, string> = {};
        audioItems.forEach(item => {
          map[item.name] = item.data;
        });
        setAudioMap(map);
      }
    } catch (err) {
      console.error("Error loading media/audio library:", err);
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

  React.useEffect(() => {
    if (Object.keys(audioMap).length === 0) return;

    // Handle audio button functionality
    const audioButtons = document.querySelectorAll('button[data-audio-name]');
    audioButtons.forEach(button => {
      const audioName = button.getAttribute('data-audio-name');
      if (audioName && audioMap[audioName]) {
        (button as HTMLButtonElement).onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAudioPlay(audioName);
        };

        // Update button icon based on state
        updateAudioButtonIcon(button as HTMLButtonElement, audioName);
      }
    });
  }, [audioMap, playingAudio, pausedAudio, completedAudio]);

  const handleAudioPlay = (audioName: string) => {
    // Pause all other audio
    Object.values(audioElementsRef.current).forEach(audio => {
      if (!audio.paused) {
        audio.pause();
      }
    });

    if (!audioElementsRef.current[audioName] && audioMap[audioName]) {
      audioElementsRef.current[audioName] = new Audio(audioMap[audioName]);
      
      audioElementsRef.current[audioName].addEventListener('ended', () => {
        setPlayingAudio(null);
        setPausedAudio(null);
        setCompletedAudio(prev => new Set([...prev, audioName]));
      });
    }

    const audio = audioElementsRef.current[audioName];
    if (!audio) return;

    if (playingAudio === audioName) {
      // Pause current audio
      audio.pause();
      setPlayingAudio(null);
      setPausedAudio(audioName);
    } else if (pausedAudio === audioName) {
      // Resume paused audio
      audio.play();
      setPlayingAudio(audioName);
      setPausedAudio(null);
    } else {
      // Start new audio or replay
      audio.currentTime = 0;
      audio.play();
      setPlayingAudio(audioName);
      setPausedAudio(null);
      setCompletedAudio(prev => {
        const newSet = new Set(prev);
        newSet.delete(audioName);
        return newSet;
      });
    }
  };

  const updateAudioButtonIcon = (button: HTMLButtonElement, audioName: string) => {
    const svg = button.querySelector('svg');
    if (!svg) return;

    if (playingAudio === audioName) {
      // Show pause icon
      svg.innerHTML = '<rect x="4" y="4" width="6" height="16" rx="1"/><rect x="14" y="4" width="6" height="16" rx="1"/>';
    } else if (completedAudio.has(audioName)) {
      // Show replay icon
      svg.innerHTML = '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>';
    } else {
      // Show play icon
      svg.innerHTML = '<polygon points="6,3 20,12 6,21"/>';
    }
  };

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
 * Extract all audio references from text
 */
export const extractAudioReferences = (text: string): string[] => {
  if (!text) return [];

  const audioRegex = /\/([^\/\s]+\.(mp3|wav|ogg|m4a))/gi;
  const matches: string[] = [];
  let match;

  while ((match = audioRegex.exec(text)) !== null) {
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
