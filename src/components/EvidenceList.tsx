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

export function EvidenceList({ 
  hits, 
  nearMiss = [], 
  isLoading = false,
  selectedId,
  onSelect,
  pinnedIds = new Set(),
  onPin
}: EvidenceListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-48 mb-3" />
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">No results found</p>
        <p className="text-sm">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {hits.map((hit) => (
          <EvidenceCard
            key={hit.id}
            hit={hit}
            isSelected={selectedId === hit.id}
            onSelect={() => onSelect?.(hit)}
            isPinned={pinnedIds.has(hit.id)}
            onPin={() => onPin?.(hit.id)}
          />
        ))}
      </div>

      {nearMiss.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground border-t pt-4">
            Near Miss ({nearMiss.length})
          </h3>
          {nearMiss.map((hit) => (
            <EvidenceCard
              key={hit.id}
              hit={hit}
              isSelected={selectedId === hit.id}
              onSelect={() => onSelect?.(hit)}
              isPinned={pinnedIds.has(hit.id)}
              onPin={() => onPin?.(hit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
