import { Clock, Zap, Target, Hash } from 'lucide-react';
import type { SearchMeta, EvidenceHit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ExportDropdown } from './ExportDropdown';

interface StatusStripProps {
  meta: SearchMeta | null;
  hitCount: number;
  coverage: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  confidence: number;
  isLoading?: boolean;
  hits?: EvidenceHit[];
  query?: string;
}

const COVERAGE_CONFIG = {
  HIGH: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'High', glow: 'shadow-emerald-500/30' },
  MEDIUM: { text: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Medium', glow: 'shadow-amber-500/30' },
  LOW: { text: 'text-destructive', bg: 'bg-destructive/15', label: 'Low', glow: 'shadow-destructive/30' },
};

export function StatusStrip({ 
  meta, 
  hitCount, 
  coverage, 
  confidence,
  isLoading = false,
  hits = [],
  query = ''
}: StatusStripProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 sm:gap-6 px-3 sm:px-4 py-2.5 sm:py-3 bg-card/50 rounded-xl border border-border/20">
        <div className="h-3 w-16 sm:w-20 bg-secondary rounded animate-pulse" />
        <div className="h-3 w-12 sm:w-16 bg-secondary rounded animate-pulse" />
        <div className="hidden sm:block h-3 w-24 bg-secondary rounded animate-pulse" />
        <div className="ml-auto h-3 w-24 sm:w-32 bg-secondary rounded animate-pulse" />
      </div>
    );
  }

  if (!meta) {
    return null;
  }

  const coverageConfig = coverage ? COVERAGE_CONFIG[coverage] : null;

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-4 py-2.5 sm:py-3 bg-card/50 rounded-xl border border-border/20 text-xs animate-fade-in">
      {/* Timing */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
        <span className="font-mono text-foreground">{(meta.t.total * 1000).toFixed(0)}</span>
        <span className="text-muted-foreground">ms</span>
      </div>

      {/* Hit Count */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Hash className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
        <span className="font-mono text-foreground">{hitCount}</span>
        <span className="hidden sm:inline text-muted-foreground">hits</span>
      </div>

      {/* Mode - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span className="capitalize text-foreground">{meta.mode_cfg.name}</span>
        <span className="text-muted-foreground font-mono">k={meta.mode_cfg.final_k}</span>
      </div>

      {/* Coverage */}
      {coverageConfig && (
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md",
          coverageConfig.bg
        )}>
          <Target className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", coverageConfig.text)} />
          <span className={cn("font-medium text-[10px] sm:text-xs", coverageConfig.text)}>
            {coverageConfig.label}
          </span>
        </div>
      )}

      {/* Confidence & Export */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-muted-foreground">Confidence</span>
          <div className="relative w-16 sm:w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 gradient-gold rounded-full transition-all duration-700 glow-gold-subtle"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className="font-mono text-primary text-glow-gold">{(confidence * 100).toFixed(0)}%</span>
        </div>
        
        <ExportDropdown hits={hits} query={query} />
      </div>
    </div>
  );
}
