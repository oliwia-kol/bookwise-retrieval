import { X, Copy, BookOpen, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EvidenceHit, JudgeTier } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ContextPanelProps {
  hit: EvidenceHit | null;
  onClose: () => void;
}

const TIER_CONFIG: Record<JudgeTier, { bg: string; text: string; label: string }> = {
  Strong: { bg: 'bg-[hsl(175_85%_45%/0.15)]', text: 'text-[hsl(175_85%_55%)]', label: 'Strong match' },
  Solid: { bg: 'bg-[hsl(270_75%_65%/0.15)]', text: 'text-[hsl(270_75%_75%)]', label: 'Good match' },
  Weak: { bg: 'bg-[hsl(25_95%_55%/0.15)]', text: 'text-[hsl(25_95%_65%)]', label: 'Partial match' },
  Poor: { bg: 'bg-[hsl(335_85%_60%/0.15)]', text: 'text-[hsl(335_85%_70%)]', label: 'Weak match' },
};

const PUBLISHER_CONFIG: Record<string, { bg: string; text: string }> = {
  OReilly: { bg: 'bg-[hsl(175_85%_45%/0.12)]', text: 'text-[hsl(175_85%_55%)]' },
  Manning: { bg: 'bg-[hsl(335_85%_60%/0.12)]', text: 'text-[hsl(335_85%_70%)]' },
  Pearson: { bg: 'bg-[hsl(215_90%_60%/0.12)]', text: 'text-[hsl(215_90%_70%)]' },
};

export function ContextPanel({ hit, onClose }: ContextPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!hit) return;
    navigator.clipboard.writeText(hit.full_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tier = hit ? TIER_CONFIG[hit.tier] : null;
  const publisher = hit ? (PUBLISHER_CONFIG[hit.publisher] || PUBLISHER_CONFIG.OReilly) : null;

  if (!hit) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
        <div className="h-16 w-16 rounded-2xl bg-secondary/50 border border-border/20 flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 opacity-40" />
        </div>
        <p className="text-center text-sm">Select a source</p>
        <p className="text-center text-xs text-muted-foreground/50 mt-1">View full context</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border/20 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-base truncate">{hit.title}</h3>
          <p className="text-xs text-muted-foreground truncate mt-1">{hit.section}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Meta badges */}
      <div className="px-5 py-4 border-b border-border/20 flex items-center gap-2 flex-wrap">
        {publisher && (
          <Badge 
            variant="outline" 
            className={cn("text-xs border-transparent", publisher.bg, publisher.text)}
          >
            {hit.publisher}
          </Badge>
        )}
        {tier && (
          <Badge 
            variant="outline" 
            className={cn("text-xs border-transparent", tier.bg, tier.text)}
          >
            {tier.label}
          </Badge>
        )}
      </div>

      {/* Full text */}
      <ScrollArea className="flex-1">
        <div className="p-5">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {hit.full_text}
          </p>
        </div>
      </ScrollArea>

      {/* Copy Action */}
      <div className="p-4 border-t border-border/20">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-sm h-10 border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all" 
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-[hsl(var(--color-green))]" />
              Copied to clipboard
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy full text
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
