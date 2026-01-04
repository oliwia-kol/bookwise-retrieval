import { Copy, Pin, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EvidenceHit, JudgeTier } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EvidenceCardProps {
  hit: EvidenceHit;
  isSelected?: boolean;
  onSelect?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
}

const TIER_CONFIG: Record<JudgeTier, { bg: string; text: string; glow: string }> = {
  Strong: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  Solid: { bg: 'bg-primary/10', text: 'text-primary', glow: 'shadow-primary/20' },
  Weak: { bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  Poor: { bg: 'bg-destructive/10', text: 'text-destructive', glow: 'shadow-destructive/20' },
};

const PUBLISHER_CONFIG: Record<string, { bg: string; text: string; accent: string }> = {
  OReilly: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', accent: 'border-emerald-500/30' },
  Manning: { bg: 'bg-rose-500/10', text: 'text-rose-400', accent: 'border-rose-500/30' },
  Pearson: { bg: 'bg-blue-500/10', text: 'text-blue-400', accent: 'border-blue-500/30' },
};

export function EvidenceCard({ 
  hit, 
  isSelected = false, 
  onSelect, 
  onPin,
  isPinned = false 
}: EvidenceCardProps) {
  const tier = TIER_CONFIG[hit.tier];
  const publisher = PUBLISHER_CONFIG[hit.publisher] || PUBLISHER_CONFIG.OReilly;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hit.snippet);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.();
  };

  return (
    <div 
      className={cn(
        "group relative rounded-xl p-4 cursor-pointer transition-all duration-300",
        "glass-subtle hover:bg-card/60",
        "border hover:border-primary/30",
        isSelected && "border-primary/50 bg-card/80 border-glow"
      )}
      onClick={onSelect}
    >
      {/* Top row: Publisher + Title + Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-md font-medium border shrink-0",
              publisher.bg, publisher.text, publisher.accent
            )}
          >
            {hit.publisher}
          </Badge>
          <span className="text-sm font-medium truncate">{hit.title}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 hover:bg-primary/10 hover:text-primary",
              isPinned && "text-primary bg-primary/10"
            )}
            onClick={handlePin}
          >
            <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Section */}
      <p className="text-xs text-muted-foreground mb-2 truncate">{hit.section}</p>

      {/* Snippet */}
      <p className="text-sm text-foreground/80 line-clamp-3 mb-4 leading-relaxed">
        {hit.snippet}
      </p>

      {/* Bottom row: Scores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-md font-medium border-transparent",
              tier.bg, tier.text
            )}
          >
            {hit.tier} · {hit.j_score.toFixed(2)}
          </Badge>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-primary/50" />
              S: {hit.s_score.toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              L: {hit.l_score.toFixed(2)}
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-[10px] text-muted-foreground hover:text-primary gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Open
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
