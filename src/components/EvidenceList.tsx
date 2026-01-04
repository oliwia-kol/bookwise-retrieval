import { EvidenceCard } from './EvidenceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Sparkles } from 'lucide-react';
import type { EvidenceHit } from '@/lib/types';

interface EvidenceListProps {
  hits: EvidenceHit[];
  nearMiss?: EvidenceHit[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (hit: EvidenceHit) => void;
  pinnedIds: Set<string>;
  onPin: (id: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card/50 rounded-xl p-4 space-y-3 border border-border/20 shimmer">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-md bg-secondary" />
            <Skeleton className="h-4 w-48 rounded bg-secondary" />
          </div>
          <Skeleton className="h-3 w-32 rounded bg-secondary" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded bg-secondary" />
            <Skeleton className="h-3 w-4/5 rounded bg-secondary" />
            <Skeleton className="h-3 w-3/5 rounded bg-secondary" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-md bg-secondary" />
            <Skeleton className="h-5 w-16 rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl gradient-gold flex items-center justify-center mb-4 glow-gold">
        <Sparkles className="h-8 w-8 text-background" />
      </div>
      <h3 className="text-base font-medium mb-1 text-glow-gold">Ready to search</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Enter a query to search across your book collection. Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/30 font-mono text-[10px] mx-1">/</kbd> to focus.
      </p>
    </div>
  );
}

export function EvidenceList({ 
  hits, 
  nearMiss, 
  isLoading, 
  selectedId, 
  onSelect,
  pinnedIds,
  onPin 
}: EvidenceListProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (hits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Main Results */}
      <div className="space-y-3">
        {hits.map((hit, index) => (
          <div
            key={hit.id}
            className="animate-in fade-in-0 slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            <EvidenceCard
              hit={hit}
              isSelected={selectedId === hit.id}
              onSelect={() => onSelect(hit)}
              isPinned={pinnedIds.has(hit.id)}
              onPin={() => onPin(hit.id)}
            />
          </div>
        ))}
      </div>

      {/* Near-Miss Section */}
      {nearMiss && nearMiss.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-[0.15em]">
              Near-Miss Results
            </h3>
            <span className="text-xs text-muted-foreground/50">
              · Below threshold
            </span>
          </div>
          <div className="space-y-3 opacity-50">
            {nearMiss.map((hit) => (
              <EvidenceCard
                key={hit.id}
                hit={hit}
                isSelected={selectedId === hit.id}
                onSelect={() => onSelect(hit)}
                isPinned={pinnedIds.has(hit.id)}
                onPin={() => onPin(hit.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
