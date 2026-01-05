import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EvidenceHit } from '@/lib/types';

interface SourceCardProps {
  source: EvidenceHit;
  index: number;
  onClick?: () => void;
}

const PUBLISHER_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  OReilly: { 
    bg: 'bg-[hsl(15_65%_62%/0.12)]', 
    text: 'text-[hsl(15_65%_70%)]',
    border: 'border-[hsl(15_65%_62%/0.3)]',
  },
  Manning: { 
    bg: 'bg-[hsl(255_55%_70%/0.12)]', 
    text: 'text-[hsl(255_55%_78%)]',
    border: 'border-[hsl(255_55%_70%/0.3)]',
  },
  Pearson: { 
    bg: 'bg-[hsl(185_55%_55%/0.12)]', 
    text: 'text-[hsl(185_55%_65%)]',
    border: 'border-[hsl(185_55%_55%/0.3)]',
  },
};

export function SourceCard({ source, index, onClick }: SourceCardProps) {
  const config = PUBLISHER_CONFIG[source.publisher] || PUBLISHER_CONFIG.OReilly;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl text-left",
        "transition-all duration-300 hover:scale-[1.02]",
        "border",
        config.bg, config.border
      )}
    >
      <span className={cn(
        "flex items-center justify-center h-5 w-5 rounded-md text-[10px] font-bold",
        "bg-foreground/10", config.text
      )}>
        {index}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate max-w-[120px]">
          {source.title}
        </p>
        <p className={cn("text-[10px]", config.text)}>
          {source.publisher}
        </p>
      </div>
      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
    </button>
  );
}
