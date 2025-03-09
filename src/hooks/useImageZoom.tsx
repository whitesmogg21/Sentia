
import { useState } from 'react';

interface UseImageZoomProps {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
}

export const useImageZoom = ({
  initialScale = 1,
  minScale = 0.5,
  maxScale = 3,
  scaleStep = 0.2
}: UseImageZoomProps = {}) => {
  const [scale, setScale] = useState(initialScale);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + scaleStep, maxScale));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - scaleStep, minScale));
  };

  const resetZoom = () => {
    setScale(initialScale);
  };

  return {
    scale,
    handleZoomIn,
    handleZoomOut,
    resetZoom
  };
};
