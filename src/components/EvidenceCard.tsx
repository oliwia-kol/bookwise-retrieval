import { Copy, Pin, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { EvidenceHit, JudgeTier } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EvidenceCardProps {
  hit: EvidenceHit;
  isSelected?: boolean;
  onSelect?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
}

const TIER_STYLES: Record<JudgeTier, string> = {
  Strong: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Solid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Weak: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Poor: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const PUBLISHER_STYLES: Record<string, string> = {
  OReilly: 'bg-emerald-500/20 text-emerald-400',
  Manning: 'bg-red-500/20 text-red-400',
  Pearson: 'bg-blue-500/20 text-blue-400',
};

export function EvidenceCard({ 
  hit, 
  isSelected = false, 
  onSelect, 
  onPin,
  isPinned = false 
}: EvidenceCardProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hit.snippet);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.();
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:border-primary/50",
        isSelected && "border-primary ring-1 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={PUBLISHER_STYLES[hit.publisher]}>
              {hit.publisher}
            </Badge>
            <span className="text-sm font-medium truncate">{hit.title}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePin}
            >
              <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-current text-primary")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3">{hit.section}</p>

        <p className="text-sm line-clamp-3 mb-4">{hit.snippet}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={TIER_STYLES[hit.tier]}>
              {hit.tier} {hit.j_score.toFixed(2)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              S: {hit.s_score.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">
              L: {hit.l_score.toFixed(2)}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7">
            <ExternalLink className="h-3 w-3 mr-1" />
            Context
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
