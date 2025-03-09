
import { useState, useEffect } from 'react';

export interface MediaItem {
  name: string;
  data: string;
}

export const useMediaLibrary = () => {
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mediaMap, setMediaMap] = useState<Record<string, MediaItem>>({});

  useEffect(() => {
    try {
      setIsLoading(true);
      const savedMedia = localStorage.getItem('mediaLibrary');
      if (savedMedia) {
        const mediaItems = JSON.parse(savedMedia) as MediaItem[];
        setMediaLibrary(mediaItems);
        
        // Create a map for faster lookups
        const map: Record<string, MediaItem> = {};
        mediaItems.forEach(item => {
          map[item.name] = item;
        });
        setMediaMap(map);
      }
      setError(null);
    } catch (err) {
      console.error("Error loading media library:", err);
      setError(err instanceof Error ? err : new Error('Unknown error loading media library'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMediaItem = (imageName: string): MediaItem | undefined => {
    return mediaMap[imageName];
  };

  return {
    mediaLibrary,
    isLoading,
    error,
    getMediaItem
  };
};
