import { Copy, Pin, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HolographicBadge } from '@/components/ui/HolographicBadge';
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

const TIER_GLOW: Record<JudgeTier, string> = {
  Strong: 'hsl(170 55% 65%)',
  Solid: 'hsl(250 65% 72%)',
  Weak: 'hsl(35 65% 65%)',
  Poor: 'hsl(0 55% 60%)',
};

const PUBLISHER_CONFIG: Record<string, { bg: string; text: string; accent: string; glow: string }> = {
  OReilly: { 
    bg: 'bg-[hsl(170_55%_65%/0.12)]', 
    text: 'text-[hsl(170_55%_70%)]', 
    accent: 'border-[hsl(170_55%_65%/0.35)]',
    glow: 'hsl(170 55% 65%)',
  },
  Manning: { 
    bg: 'bg-[hsl(340_60%_70%/0.12)]', 
    text: 'text-[hsl(340_60%_75%)]', 
    accent: 'border-[hsl(340_60%_70%/0.35)]',
    glow: 'hsl(340 60% 70%)',
  },
  Pearson: { 
    bg: 'bg-[hsl(200_65%_70%/0.12)]', 
    text: 'text-[hsl(200_65%_75%)]', 
    accent: 'border-[hsl(200_65%_70%/0.35)]',
    glow: 'hsl(200 65% 70%)',
  },
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const publisher = PUBLISHER_CONFIG[hit.publisher] || PUBLISHER_CONFIG.OReilly;
  const tierGlow = TIER_GLOW[hit.tier];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setTilt({ x: y * 6, y: -x * 6 });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

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
      ref={cardRef}
      className={cn(
        "group relative rounded-xl p-4 sm:p-5 cursor-pointer",
        "glass-card",
        "animate-fade-in",
        isSelected && "ring-2 ring-primary/50 glow-primary-subtle"
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        transform: isHovering 
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px) translateY(-2px)` 
          : 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: isHovering 
          ? `0 16px 48px hsl(0 0% 0% / 0.6), 0 0 24px ${tierGlow}20, inset 0 1px 0 hsl(0 0% 100% / 0.06)`
          : '0 4px 24px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.04)',
      }}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated rainbow border on hover */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `linear-gradient(135deg, ${tierGlow}50, hsl(250 65% 72% / 0.3), ${tierGlow}50)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      
      {/* Inner glow effect */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovering ? 0.5 : 0,
          background: `radial-gradient(ellipse at 50% 0%, ${tierGlow}15 0%, transparent 60%)`,
        }}
      />

      {/* Top row: Publisher + Title + Actions */}
      <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-md font-medium border shrink-0 transition-all duration-300",
              publisher.bg, publisher.text, publisher.accent,
              isHovering && "shadow-sm"
            )}
            style={{
              boxShadow: isHovering ? `0 0 12px ${publisher.glow}30` : 'none',
            }}
          >
            {hit.publisher}
          </Badge>
          <span className="text-sm font-medium truncate text-foreground/90">{hit.title}</span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 transition-all duration-400",
          isHovering ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 hover:bg-primary/15 hover:text-primary transition-all duration-300",
              isPinned && "text-primary bg-primary/15 animate-bounce-once"
            )}
            onClick={handlePin}
          >
            <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/15 hover:text-primary transition-all duration-300"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-accent animate-scale-in" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Section */}
      <p className="text-xs text-muted-foreground mb-2 truncate relative z-10">{hit.section}</p>

      {/* Snippet */}
      <p className="text-sm text-foreground/75 line-clamp-3 mb-4 leading-relaxed relative z-10">
        {hit.snippet}
      </p>

      {/* Bottom row: Tier Badge + Scores */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <HolographicBadge 
            tier={hit.tier} 
            score={hit.j_score}
            size="sm"
            animated={isHovering}
          />
          <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground ml-1">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              S: {hit.s_score.toFixed(2)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              L: {hit.l_score.toFixed(2)}
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-7 text-[10px] text-muted-foreground hover:text-primary gap-1 px-2",
            "transition-all duration-400",
            isHovering ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          )}
        >
          <Sparkles className="h-3 w-3" />
          View
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
