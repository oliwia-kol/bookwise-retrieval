import { BookOpen } from 'lucide-react';
import type { SearchMeta, EvidenceHit } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusStripProps {
  meta: SearchMeta | null;
  hitCount: number;
  isLoading?: boolean;
}

export function StatusStrip({ 
  meta, 
  hitCount, 
  isLoading = false 
}: StatusStripProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm text-muted-foreground gradient-hero-text">Searching...</span>
      </div>
    );
  }

  if (!meta || hitCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3 py-2 animate-fade-in">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-subtle">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          <span className="text-primary">{hitCount}</span>
          <span className="text-muted-foreground ml-1.5">
            {hitCount === 1 ? 'source found' : 'sources found'}
          </span>
        </span>
      </div>
    </div>
  );
}
