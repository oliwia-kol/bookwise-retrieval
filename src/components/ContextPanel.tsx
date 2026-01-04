import { X, Copy, Pin, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { EvidenceHit } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ContextPanelProps {
  hit: EvidenceHit | null;
  onClose: () => void;
  pinnedHits?: EvidenceHit[];
  onUnpin?: (id: string) => void;
}

const TIER_STYLES: Record<string, string> = {
  Strong: 'bg-emerald-500/20 text-emerald-400',
  Solid: 'bg-blue-500/20 text-blue-400',
  Weak: 'bg-amber-500/20 text-amber-400',
  Poor: 'bg-red-500/20 text-red-400',
};

export function ContextPanel({ hit, onClose, pinnedHits = [], onUnpin }: ContextPanelProps) {
  const handleCopyMd = () => {
    if (!hit) return;
    const citation = `> ${hit.snippet}\n\n— *${hit.book}*, ${hit.section}`;
    navigator.clipboard.writeText(citation);
  };

  const handleCopyJson = () => {
    if (!hit) return;
    navigator.clipboard.writeText(JSON.stringify(hit, null, 2));
  };

  if (!hit && pinnedHits.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
        <BookOpen className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-center">Select an evidence card to view full context</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {hit && (
        <>
          <div className="p-4 border-b flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{hit.title}</h3>
              <p className="text-sm text-muted-foreground">{hit.section}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{hit.publisher}</Badge>
              <Badge variant="outline" className={TIER_STYLES[hit.tier]}>
                {hit.tier} {hit.j_score.toFixed(2)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Chunk #{hit.chunk_idx}
              </span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Full Text</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {hit.full_text}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Scores</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted rounded">
                    <p className="text-lg font-semibold">{hit.j_score.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">J-Score</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-lg font-semibold">{hit.s_score.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">S-Score</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-lg font-semibold">{hit.l_score.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">L-Score</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyMd}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy as Markdown
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyJson}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy JSON
            </Button>
          </div>
        </>
      )}

      {pinnedHits.length > 0 && (
        <div className={cn("border-t", hit && "mt-auto")}>
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Pin className="h-3.5 w-3.5" />
              Pinned ({pinnedHits.length})
            </h4>
            <div className="space-y-2">
              {pinnedHits.map((pinned) => (
                <div
                  key={pinned.id}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <span className="truncate">{pinned.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => onUnpin?.(pinned.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
