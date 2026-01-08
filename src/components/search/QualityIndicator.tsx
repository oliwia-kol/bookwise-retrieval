import { cn } from '@/lib/utils';
import type { JudgeTier } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QualityIndicatorProps {
  tier: JudgeTier;
  score: number;
  showLabel?: boolean;
}

const TIER_CONFIG: Record<JudgeTier, { dots: number; color: string; bgColor: string }> = {
  Strong: { dots: 4, color: 'bg-[hsl(142_70%_50%)]', bgColor: 'bg-[hsl(142_70%_50%/0.2)]' },
  Solid: { dots: 3, color: 'bg-[hsl(48_90%_55%)]', bgColor: 'bg-[hsl(48_90%_55%/0.2)]' },
  Weak: { dots: 2, color: 'bg-[hsl(30_90%_55%)]', bgColor: 'bg-[hsl(30_90%_55%/0.2)]' },
  Poor: { dots: 1, color: 'bg-[hsl(0_70%_55%)]', bgColor: 'bg-[hsl(0_70%_55%/0.2)]' },
};

export function QualityIndicator({ tier, score, showLabel = true }: QualityIndicatorProps) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Weak;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1.5', showLabel && 'gap-2')}>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    i < config.dots ? config.color : 'bg-muted/40'
                  )}
                />
              ))}
            </div>
            {showLabel && (
              <span
                className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                  config.bgColor,
                  tier === 'Strong' && 'text-[hsl(142_70%_50%)]',
                  tier === 'Solid' && 'text-[hsl(48_90%_55%)]',
                  tier === 'Weak' && 'text-[hsl(30_90%_55%)]',
                  tier === 'Poor' && 'text-[hsl(0_70%_55%)]'
                )}
              >
                {tier}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Judge score: {(score * 100).toFixed(0)}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
