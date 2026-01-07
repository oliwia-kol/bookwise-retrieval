import { useEffect, useCallback, useState } from 'react';

export function useKeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInputFocused = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
    
    // Focus search with /
    if (e.key === '/' && !isInputFocused) {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      return;
    }

    // Show shortcuts with ?
    if (e.key === '?' && !isInputFocused) {
      e.preventDefault();
      setShowShortcuts(true);
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showShortcuts, setShowShortcuts };
}
