import { Search, BookOpen } from 'lucide-react';
import { EvidenceCard } from './EvidenceCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { EvidenceHit } from '@/lib/types';

interface EvidenceListProps {
  hits: EvidenceHit[];
  nearMiss?: EvidenceHit[];
  isLoading?: boolean;
  selectedId?: string;
  onSelect?: (hit: EvidenceHit) => void;
  pinnedIds?: Set<string>;
  onPin?: (id: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="rounded-xl p-3 sm:p-4 card-premium animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <Skeleton className="h-5 w-14 sm:w-16 rounded-md" />
            <Skeleton className="h-4 w-32 sm:w-48" />
          </div>
          <Skeleton className="h-3 w-24 sm:w-32 mb-2" />
          <Skeleton className="h-14 sm:h-16 w-full mb-3" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 sm:h-80 text-center animate-fade-in">
      <div className="relative mb-4 sm:mb-6">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl gradient-premium border border-border/30 flex items-center justify-center">
          <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full gradient-gold flex items-center justify-center glow-gold-subtle">
          <Search className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-background" />
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-medium mb-2">Ready to explore</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-xs px-4">
        Enter a query above to search across O'Reilly, Manning, and Pearson technical books.
      </p>
      <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
        <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/50 font-mono">/</kbd>
        <span>to focus search</span>
        <span className="mx-2">•</span>
        <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/50 font-mono">?</kbd>
        <span>for shortcuts</span>
      </div>
    </div>
  );
}

export function EvidenceList({
  hits,
  nearMiss,
  isLoading = false,
  selectedId,
  onSelect,
  pinnedIds = new Set(),
  onPin,
}: EvidenceListProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (hits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Main results */}
      <div className="space-y-2 sm:space-y-3">
        {hits.map((hit, index) => (
          <EvidenceCard
            key={hit.id}
            hit={hit}
            isSelected={selectedId === hit.id}
            onSelect={() => onSelect?.(hit)}
            isPinned={pinnedIds.has(hit.id)}
            onPin={() => onPin?.(hit.id)}
            animationDelay={index * 50}
          />
        ))}
      </div>

      {/* Near-miss results */}
      {nearMiss && nearMiss.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: `${hits.length * 50 + 100}ms` }}>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Near Misses</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          </div>
          <div className="space-y-2 sm:space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
            {nearMiss.map((hit, index) => (
              <EvidenceCard
                key={hit.id}
                hit={hit}
                isSelected={selectedId === hit.id}
                onSelect={() => onSelect?.(hit)}
                isPinned={pinnedIds.has(hit.id)}
                onPin={() => onPin?.(hit.id)}
                animationDelay={(hits.length + index) * 50 + 150}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
