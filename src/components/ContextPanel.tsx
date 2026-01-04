import { X, Copy, Pin, BookOpen, FileText, Check } from 'lucide-react';
import { useState } from 'react';
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

const TIER_CONFIG: Record<string, { bg: string; text: string }> = {
  Strong: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  Solid: { bg: 'bg-primary/10', text: 'text-primary' },
  Weak: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  Poor: { bg: 'bg-destructive/10', text: 'text-destructive' },
};

export function ContextPanel({ hit, onClose, pinnedHits = [], onUnpin }: ContextPanelProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyMd = () => {
    if (!hit) return;
    const citation = `> ${hit.snippet}\n\n— *${hit.book}*, ${hit.section}`;
    navigator.clipboard.writeText(citation);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyJson = () => {
    if (!hit) return;
    navigator.clipboard.writeText(JSON.stringify(hit, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const tier = hit ? TIER_CONFIG[hit.tier] : null;

  if (!hit && pinnedHits.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
        <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-center text-sm">Select an evidence card</p>
        <p className="text-center text-xs text-muted-foreground/60 mt-1">View full context and citations</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {hit && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border/50 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{hit.title}</h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{hit.section}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-7 w-7 shrink-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Meta badges */}
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="text-[10px] border-border/50 bg-card/50"
            >
              {hit.publisher}
            </Badge>
            {tier && (
              <Badge 
                variant="outline" 
                className={cn("text-[10px] border-transparent", tier.bg, tier.text)}
              >
                {hit.tier} · {hit.j_score.toFixed(2)}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto">
              Chunk #{hit.chunk_idx}
            </span>
          </div>

          {/* Full text */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Text</h4>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {hit.full_text}
                </p>
              </div>

              <Separator className="bg-border/50" />

              {/* Scores Grid */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Scores</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
                    <p className="text-lg font-semibold text-primary font-mono">{hit.j_score.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">J-Score</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-center">
                    <p className="text-lg font-semibold font-mono">{hit.s_score.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">S-Score</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-center">
                    <p className="text-lg font-semibold font-mono">{hit.l_score.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">L-Score</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Copy Actions */}
          <div className="p-3 border-t border-border/50 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs h-8 border-border/50 hover:border-primary/50 hover:bg-primary/5" 
              onClick={handleCopyMd}
            >
              {copiedMd ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              Markdown
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs h-8 border-border/50 hover:border-primary/50 hover:bg-primary/5" 
              onClick={handleCopyJson}
            >
              {copiedJson ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              JSON
            </Button>
          </div>
        </>
      )}

      {/* Pinned Items */}
      {pinnedHits.length > 0 && (
        <div className={cn("border-t border-border/50", hit && "mt-auto")}>
          <div className="p-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pin className="h-3.5 w-3.5 text-primary" />
              Pinned · {pinnedHits.length}
            </h4>
            <div className="space-y-2">
              {pinnedHits.map((pinned) => (
                <div
                  key={pinned.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-sm group"
                >
                  <span className="truncate text-xs">{pinned.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
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
