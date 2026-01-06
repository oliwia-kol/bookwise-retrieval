import { Copy, Check, ChevronRight } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EvidenceHit, JudgeTier } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EvidenceCardProps {
  hit: EvidenceHit;
  isSelected?: boolean;
  onSelect?: () => void;
  animationDelay?: number;
}

const TIER_CONFIG: Record<JudgeTier, { dot: string; glow: string }> = {
  Strong: { dot: 'tier-dot-strong', glow: 'hsl(175 85% 45%)' },
  Solid: { dot: 'tier-dot-solid', glow: 'hsl(270 75% 65%)' },
  Weak: { dot: 'tier-dot-weak', glow: 'hsl(25 95% 55%)' },
  Poor: { dot: 'tier-dot-poor', glow: 'hsl(335 85% 60%)' },
};

const PUBLISHER_CONFIG: Record<string, { bg: string; text: string }> = {
  OReilly: { 
    bg: 'bg-[hsl(175_85%_45%/0.12)]', 
    text: 'text-[hsl(175_85%_55%)]',
  },
  Manning: { 
    bg: 'bg-[hsl(335_85%_60%/0.12)]', 
    text: 'text-[hsl(335_85%_70%)]',
  },
  Pearson: { 
    bg: 'bg-[hsl(215_90%_60%/0.12)]', 
    text: 'text-[hsl(215_90%_70%)]',
  },
};

export function EvidenceCard({ 
  hit, 
  isSelected = false, 
  onSelect, 
  animationDelay = 0
}: EvidenceCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const publisher = PUBLISHER_CONFIG[hit.publisher] || PUBLISHER_CONFIG.OReilly;
  const tier = TIER_CONFIG[hit.tier];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hit.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 cursor-pointer text-card-foreground",
        "glass-card hover-lift hover-glow glow-primary-subtle border border-white/10",
        "animate-slide-up-fade",
        isSelected && "ring-2 ring-primary/50 glow-primary-subtle"
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
        opacity: 0,
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovering ? 0.5 : 0,
          background: `radial-gradient(ellipse at 50% 0%, ${tier.glow}15 0%, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 pointer-events-none gradient-warm opacity-0 transition-opacity duration-300 group-hover:opacity-20" />

      {/* Header: Publisher + Title */}
      <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2.5 py-0.5 rounded-lg font-medium border-transparent shrink-0",
              publisher.bg, publisher.text
            )}
          >
            {hit.publisher}
          </Badge>
          <span className="text-sm font-medium truncate text-card-foreground">{hit.title}</span>
        </div>
        
        {/* Tier indicator dot */}
        <div className={cn(
          "h-2.5 w-2.5 rounded-full shrink-0 mt-1",
          tier.dot
        )} />
      </div>

      {/* Section */}
      <p className="text-xs text-muted-foreground mb-2 truncate relative z-10">
        {hit.section}
      </p>

      {/* Snippet */}
      <p className="text-sm text-card-foreground/80 line-clamp-3 mb-4 leading-relaxed relative z-10">
        {hit.snippet}
      </p>

      {/* Footer: Actions */}
      <div className="flex items-center justify-between relative z-10">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10",
            "transition-all duration-300"
          )}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 mr-1.5 text-[hsl(var(--color-green))]" />
          ) : (
            <Copy className="h-3.5 w-3.5 mr-1.5" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        
        <Button 
          variant="cta"
          size="sm"
          className={cn(
            "h-7 text-xs gap-1 px-2 rounded-full",
            "transition-all duration-400 shadow-none",
            isHovering ? "opacity-100" : "opacity-0"
          )}
        >
          View details
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
