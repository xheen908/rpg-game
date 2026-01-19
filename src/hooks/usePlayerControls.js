import { useRef, useState, useEffect, useCallback } from 'react';

export const usePlayerControls = (gameState) => {
  const controlsRef = useRef();
  const [isPaused, setIsPaused] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRightMouseDown, setIsRightMouseDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape' && gameState === 'PLAYING') {
        setIsPaused(prev => !prev);
        if (controlsRef.current?.isLocked) controlsRef.current.unlock();
      }
      if (e.code === 'Enter' && gameState === 'PLAYING' && !isPaused) {
        setIsChatOpen(true);
        if (controlsRef.current?.isLocked) controlsRef.current.unlock();
      }
    };

    const handleMouseDown = (e) => {
      // Nur Rechtsklick (button 2) erlaubt den Lock
      if (e.button === 2 && gameState === 'PLAYING' && !isPaused && !isChatOpen) {
        setIsRightMouseDown(true);
        // Wir fordern den Lock manuell an
        controlsRef.current?.lock();
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        setIsRightMouseDown(false);
        controlsRef.current?.unlock();
      }
    };

    const handleContextMenu = (e) => {
      if (gameState === 'PLAYING') e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown, true); // Use capture to intercept
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameState, isPaused, isChatOpen]);

  const setupPointerLockOnCanvas = useCallback((gl) => {
    // Keine automatischen Listener hier
  }, []);

  return {
    controlsRef,
    isPaused,
    setIsPaused,
    isChatOpen,
    setIsChatOpen,
    isRightMouseDown,
    setupPointerLockOnCanvas,
  };
};