import { useState, useRef, useEffect, useCallback, useMemo } from "react";

interface UseReceiptViewerProps {
  imageUrls: string[];
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
}

export const useReceiptViewer = ({
  imageUrls,
  onClose,
  onIndexChange,
}: UseReceiptViewerProps) => {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });

  // Filter valid URLs
  const validUrls = useMemo(() => imageUrls.filter((u) => u), [imageUrls]);

  // Reset functionality
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Navigation Logic
  const handleNext = useCallback(() => {
    if (validUrls.length === 0) return;
    const newIndex = (index + 1) % validUrls.length;
    setIndex(newIndex);
    onIndexChange?.(newIndex);
    handleReset();
  }, [index, validUrls.length, onIndexChange, handleReset]);

  const handlePrev = useCallback(() => {
    if (validUrls.length === 0) return;
    const newIndex = (index - 1 + validUrls.length) % validUrls.length;
    setIndex(newIndex);
    onIndexChange?.(newIndex);
    handleReset();
  }, [index, validUrls.length, onIndexChange, handleReset]);

  // Zoom Logic
  const handleZoomIn = useCallback(
    () => setScale((s) => Math.min(s + 0.5, 5)),
    []
  );
  const handleZoomOut = useCallback(
    () => setScale((s) => Math.max(s - 0.5, 0.5)),
    []
  );

  // Mouse / Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleReset();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "Escape":
          e.preventDefault();
          onClose?.();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleNext,
    handlePrev,
    onClose,
  ]);

  // Sync index if urls change drastically
  useEffect(() => {
    if (index >= validUrls.length && validUrls.length > 0) {
      setIndex(0);
      onIndexChange?.(0);
    }
  }, [validUrls.length, index, onIndexChange]);

  return {
    state: {
      index,
      scale,
      position,
      validUrls,
      hasMultipleImages: validUrls.length > 1,
      currentUrl: validUrls[index],
    },
    handlers: {
      handleNext,
      handlePrev,
      handleZoomIn,
      handleZoomOut,
      handleReset,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleWheel,
    },
  };
};
