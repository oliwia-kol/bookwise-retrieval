import { Clock, Zap, Target, Hash } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { SearchMeta } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusStripProps {
  meta: SearchMeta | null;
  hitCount: number;
  coverage: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  confidence: number;
  isLoading?: boolean;
}

const COVERAGE_STYLES = {
  HIGH: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  LOW: 'text-red-400',
};

export function StatusStrip({ 
  meta, 
  hitCount, 
  coverage, 
  confidence,
  isLoading = false 
}: StatusStripProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-lg animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
    );
  }

  if (!meta) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm">
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{(meta.t.total * 1000).toFixed(0)}ms</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{hitCount} hits</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="capitalize">{meta.mode_cfg.name}</span>
        <span className="text-muted-foreground text-xs">
          (k={meta.mode_cfg.final_k})
        </span>
      </div>

      {coverage && (
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={cn("font-medium", COVERAGE_STYLES[coverage])}>
            {coverage}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-muted-foreground text-xs">Confidence</span>
        <Progress value={confidence * 100} className="w-20 h-2" />
        <span className="text-xs">{(confidence * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
