import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTitle, formatSection, formatSnippet } from '@/lib/formatters';
import type { EvidenceHit } from '@/lib/types';
import { QualityIndicator } from './QualityIndicator';

interface SearchResultCardProps {
  hit: EvidenceHit;
  index: number;
  onClick?: () => void;
}

const PUBLISHER_ACCENT: Record<string, string> = {
  OReilly: 'hover:border-[hsl(15_65%_62%/0.5)] hover:shadow-[0_0_30px_hsl(15_65%_62%/0.15)]',
  Manning: 'hover:border-[hsl(255_55%_70%/0.5)] hover:shadow-[0_0_30px_hsl(255_55%_70%/0.15)]',
  Pearson: 'hover:border-[hsl(185_55%_55%/0.5)] hover:shadow-[0_0_30px_hsl(185_55%_55%/0.15)]',
};

export function SearchResultCard({ hit, index, onClick }: SearchResultCardProps) {
  const accentClass = PUBLISHER_ACCENT[hit.publisher] || PUBLISHER_ACCENT.OReilly;

  const formattedTitle = formatTitle(hit.title);
  const formattedSection = formatSection(hit.section || '');
  const formattedSnippet = formatSnippet(hit.snippet).slice(0, 280);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-2xl overflow-hidden',
        'border border-border/40 bg-card/80 backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:scale-[1.01]',
        accentClass
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      </div>

      {/* Index badge */}
      <div className="absolute top-3 left-3 flex items-center justify-center h-7 w-7 rounded-lg bg-secondary/80 border border-border/50 text-xs font-bold text-foreground/80">
        {index}
      </div>

      {/* Content */}
      <div className="relative p-4 pt-12">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 pr-2">
              {formattedTitle}
            </h3>
            {formattedSection && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formattedSection}
              </p>
            )}
          </div>
        </div>

        {/* Snippet */}
        <div className="relative mb-4">
          <p className="text-xs leading-relaxed text-foreground/80">
            {formattedSnippet}
            {hit.snippet.length > 280 && (
              <span className="text-muted-foreground">...</span>
            )}
          </p>
          {/* Fade out gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <QualityIndicator tier={hit.tier} score={hit.judge01} showLabel={true} />
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
            <span>View full</span>
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>
    </button>
  );
}
