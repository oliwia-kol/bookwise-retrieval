import { Search, BookOpen, Sparkles } from 'lucide-react';
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
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className="rounded-2xl p-5 glass-card animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-5 w-16 rounded-lg" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-16 w-full mb-3" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-2xl glass-card flex items-center justify-center">
          <BookOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full gradient-primary flex items-center justify-center glow-primary-subtle">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-medium mb-2 gradient-hero-text">Ready to explore</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Enter a query above to search across your technical library.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <kbd className="px-2 py-1 rounded-lg bg-secondary/50 border border-border/30 font-mono text-[10px]">/</kbd>
        <span>to focus</span>
        <span className="mx-2 opacity-50">•</span>
        <kbd className="px-2 py-1 rounded-lg bg-secondary/50 border border-border/30 font-mono text-[10px]">?</kbd>
        <span>shortcuts</span>
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
}: EvidenceListProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (hits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Main results */}
      <div className="space-y-3">
        {hits.map((hit, index) => (
          <EvidenceCard
            key={hit.id}
            hit={hit}
            isSelected={selectedId === hit.id}
            onSelect={() => onSelect?.(hit)}
            animationDelay={index * 60}
          />
        ))}
      </div>

      {/* Near-miss results */}
      {nearMiss && nearMiss.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: `${hits.length * 60 + 100}ms` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Related</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>
          <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {nearMiss.map((hit, index) => (
              <EvidenceCard
                key={hit.id}
                hit={hit}
                isSelected={selectedId === hit.id}
                onSelect={() => onSelect?.(hit)}
                animationDelay={(hits.length + index) * 60 + 150}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
