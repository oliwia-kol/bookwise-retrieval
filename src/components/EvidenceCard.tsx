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
  Strong: { bg: 'bg-[hsl(170_45%_75%/0.15)]', text: 'text-[hsl(170_45%_75%)]', glow: 'shadow-[hsl(170_45%_75%/0.3)]' },
  Solid: { bg: 'bg-primary/15', text: 'text-primary', glow: 'shadow-primary/30' },
  Weak: { bg: 'bg-[hsl(20_60%_78%/0.15)]', text: 'text-[hsl(20_60%_78%)]', glow: 'shadow-[hsl(20_60%_78%/0.3)]' },
  Poor: { bg: 'bg-destructive/15', text: 'text-destructive', glow: 'shadow-destructive/30' },
};

const PUBLISHER_CONFIG: Record<string, { bg: string; text: string; accent: string }> = {
  OReilly: { bg: 'bg-[hsl(170_45%_75%/0.1)]', text: 'text-[hsl(170_45%_75%)]', accent: 'border-[hsl(170_45%_75%/0.3)]' },
  Manning: { bg: 'bg-[hsl(340_55%_78%/0.1)]', text: 'text-[hsl(340_55%_78%)]', accent: 'border-[hsl(340_55%_78%/0.3)]' },
  Pearson: { bg: 'bg-[hsl(200_60%_78%/0.1)]', text: 'text-[hsl(200_60%_78%)]', accent: 'border-[hsl(200_60%_78%/0.3)]' },
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
      {/* Delicate pastel border on hover */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, hsl(250 60% 78% / 0.5), hsl(340 55% 78% / 0.4), hsl(200 60% 78% / 0.5))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
          boxShadow: '0 0 12px hsl(250 60% 78% / 0.1), 0 0 24px hsl(340 55% 78% / 0.06), 0 0 36px hsl(200 60% 78% / 0.04)'
        }}
      />

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
