import { Copy, Pin, ArrowUpRight, Check } from 'lucide-react';
import { useState } from 'react';
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
  animationDelay?: number;
}

const TIER_CONFIG: Record<JudgeTier, { bg: string; text: string; glow: string }> = {
  Strong: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
  Solid: { bg: 'bg-primary/15', text: 'text-primary', glow: 'shadow-primary/30' },
  Weak: { bg: 'bg-amber-500/15', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
  Poor: { bg: 'bg-destructive/15', text: 'text-destructive', glow: 'shadow-destructive/30' },
};

const PUBLISHER_CONFIG: Record<string, { bg: string; text: string; accent: string }> = {
  OReilly: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', accent: 'border-emerald-500/30' },
  Manning: { bg: 'bg-rose-500/10', text: 'text-rose-400', accent: 'border-rose-500/30' },
  Pearson: { bg: 'bg-sky-500/10', text: 'text-sky-400', accent: 'border-sky-500/30' },
};

export function EvidenceCard({ 
  hit, 
  isSelected = false, 
  onSelect, 
  onPin,
  isPinned = false,
  animationDelay = 0
}: EvidenceCardProps) {
  const [copied, setCopied] = useState(false);
  const tier = TIER_CONFIG[hit.tier];
  const publisher = PUBLISHER_CONFIG[hit.publisher] || PUBLISHER_CONFIG.OReilly;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hit.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.();
  };

  return (
    <div 
      className={cn(
        "group relative rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300",
        "card-premium",
        "animate-fade-in",
        isSelected && "border-primary/50 glow-gold-subtle scale-[1.01]"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onSelect}
    >
      {/* Gradient border on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        "border border-transparent",
        "before:absolute before:inset-0 before:rounded-xl before:p-[1px]",
        "before:bg-gradient-to-r before:from-primary/50 before:via-purple-500/30 before:to-cyan-500/50",
        "before:-z-10 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
      )} />

      {/* Top row: Publisher + Title + Actions */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md font-medium border shrink-0",
              publisher.bg, publisher.text, publisher.accent
            )}
          >
            {hit.publisher}
          </Badge>
          <span className="text-xs sm:text-sm font-medium truncate">{hit.title}</span>
        </div>
        
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 sm:h-7 sm:w-7 hover:bg-primary/10 hover:text-primary transition-all",
              isPinned && "text-primary bg-primary/10 animate-bounce-once"
            )}
            onClick={handlePin}
          >
            <Pin className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", isPinned && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-primary/10 hover:text-primary transition-all"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 animate-scale-in" />
            ) : (
              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Section */}
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 truncate">{hit.section}</p>

      {/* Snippet */}
      <p className="text-xs sm:text-sm text-foreground/80 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
        {hit.snippet}
      </p>

      {/* Bottom row: Scores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md font-medium border-transparent",
              tier.bg, tier.text
            )}
          >
            {hit.tier} · {hit.j_score.toFixed(2)}
          </Badge>
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-primary" />
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
          className="h-6 sm:h-7 text-[9px] sm:text-[10px] text-muted-foreground hover:text-primary gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 px-2"
        >
          Open
          <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
      </div>
    </div>
  );
}
