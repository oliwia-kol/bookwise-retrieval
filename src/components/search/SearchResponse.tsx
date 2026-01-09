import { useState } from 'react';
import { TrendingUp, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTitle, formatSection, formatSnippet } from '@/lib/formatters';
import type { SearchResponse as SearchResponseType, EvidenceHit } from '@/lib/types';
import { SearchResultCard } from './SearchResultCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PublisherBadge } from './PublisherBadge';
import { QualityIndicator } from './QualityIndicator';

interface SearchResponseProps {
  response: SearchResponseType;
  query: string;
}

const COVERAGE_CONFIG = {
  HIGH: { color: 'text-[hsl(142_70%_50%)]', bg: 'bg-[hsl(142_70%_50%/0.15)]', label: 'High Coverage' },
  MEDIUM: { color: 'text-[hsl(48_90%_55%)]', bg: 'bg-[hsl(48_90%_55%/0.15)]', label: 'Medium Coverage' },
  LOW: { color: 'text-[hsl(30_90%_55%)]', bg: 'bg-[hsl(30_90%_55%/0.15)]', label: 'Low Coverage' },
};

export function SearchResponse({ response, query }: SearchResponseProps) {
  const [selectedHit, setSelectedHit] = useState<EvidenceHit | null>(null);
  
  const hits = response.hits ?? [];
  const hasNoEvidence = Boolean(response.no_evidence) || response.coverage === 'LOW' || hits.length === 0;
  const coverageConfig = COVERAGE_CONFIG[response.coverage] || COVERAGE_CONFIG.LOW;
  const answer = typeof response.answer === 'string' ? response.answer.trim() : '';

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Summary Section */}
        <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              {hasNoEvidence ? (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              ) : (
                <TrendingUp className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-foreground">Answer</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', coverageConfig.bg, coverageConfig.color)}>
                  {coverageConfig.label}
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {hasNoEvidence
                  ? 'No direct evidence found to answer confidently. Try rephrasing your query or exploring related topics.'
                  : (answer || 'Here are the most relevant passages found in your library.')}
              </p>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/70">Sources:</span>
              <span className="font-medium text-foreground">{hits.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/70">Confidence:</span>
              <span className="font-medium text-foreground">{(response.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {hits.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              Evidence ({hits.length} results)
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {hits.map((hit, idx) => (
                <SearchResultCard
                  key={hit.id}
                  hit={hit}
                  index={idx + 1}
                  onClick={() => setSelectedHit(hit)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/30 bg-secondary/30 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">No matching sources</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Try adjusting your search terms or explore a different topic.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedHit} onOpenChange={(open) => !open && setSelectedHit(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] glass-card border-primary/20">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-lg font-semibold text-foreground pr-8">
                {formatTitle(selectedHit?.title || '')}
              </DialogTitle>
              {selectedHit && <PublisherBadge publisher={selectedHit.publisher} size="md" />}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {selectedHit?.section && <span>{formatSection(selectedHit.section)}</span>}
              {selectedHit && (
                <QualityIndicator tier={selectedHit.tier} score={selectedHit.judge01} showLabel={true} />
              )}
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 pt-2">
              {/* Snippet */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="text-xs uppercase tracking-wider text-primary mb-2 font-medium">Key Passage</h4>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {formatSnippet(selectedHit?.snippet || '')}
                </p>
              </div>
              
              {/* Full Context */}
              {selectedHit?.full_text && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/30">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Full Context</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {selectedHit.full_text}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
