import { useEffect, useCallback, useState } from 'react';
import type { EvidenceHit } from '@/lib/types';

interface UseKeyboardShortcutsProps {
  hits: EvidenceHit[];
  selectedHit: EvidenceHit | null;
  onSelectHit: (hit: EvidenceHit) => void;
  onPinHit: (id: string) => void;
  onClearSelection: () => void;
}

export function useKeyboardShortcuts({
  hits,
  selectedHit,
  onSelectHit,
  onPinHit,
  onClearSelection,
}: UseKeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInputFocused = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
    
    // Global shortcuts
    if (e.key === '/' && !isInputFocused) {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      return;
    }
    
    if (e.key === 'Escape') {
      onClearSelection();
      return;
    }

    if (e.key === '?' && !isInputFocused) {
      e.preventDefault();
      setShowShortcuts(true);
      return;
    }

    // Shortcuts that require hits
    if (hits.length === 0 || isInputFocused) return;

    const currentIndex = selectedHit ? hits.findIndex(h => h.id === selectedHit.id) : -1;

    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        if (currentIndex < hits.length - 1) {
          onSelectHit(hits[currentIndex + 1]);
        } else if (currentIndex === -1 && hits.length > 0) {
          onSelectHit(hits[0]);
        }
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        if (currentIndex > 0) {
          onSelectHit(hits[currentIndex - 1]);
        }
        break;
      case 'p':
        if (selectedHit) {
          e.preventDefault();
          onPinHit(selectedHit.id);
        }
        break;
      case 'c':
        if (selectedHit) {
          e.preventDefault();
          navigator.clipboard.writeText(selectedHit.snippet);
        }
        break;
      case 'Enter':
        if (selectedHit) {
          e.preventDefault();
          // Already selected, could open full view
        }
        break;
    }
  }, [hits, selectedHit, onSelectHit, onPinHit, onClearSelection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showShortcuts, setShowShortcuts };
}
