import { cn } from '@/lib/utils';
import type { JudgeTier } from '@/lib/types';

interface HolographicBadgeProps {
  tier: JudgeTier;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const TIER_CONFIG: Record<JudgeTier, {
  gradient: string;
  glow: string;
  text: string;
  border: string;
}> = {
  Strong: {
    gradient: 'from-[hsl(170_60%_50%)] via-[hsl(170_50%_65%)] to-[hsl(170_45%_75%)]',
    glow: 'shadow-[0_0_15px_hsl(170_45%_75%/0.4)]',
    text: 'text-[hsl(170_45%_85%)]',
    border: 'border-[hsl(170_45%_60%/0.5)]',
  },
  Solid: {
    gradient: 'from-[hsl(250_70%_55%)] via-[hsl(250_60%_68%)] to-[hsl(250_55%_78%)]',
    glow: 'shadow-[0_0_15px_hsl(250_60%_75%/0.4)]',
    text: 'text-[hsl(250_60%_90%)]',
    border: 'border-[hsl(250_55%_65%/0.5)]',
  },
  Weak: {
    gradient: 'from-[hsl(35_70%_50%)] via-[hsl(30_60%_62%)] to-[hsl(25_55%_72%)]',
    glow: 'shadow-[0_0_12px_hsl(30_60%_70%/0.3)]',
    text: 'text-[hsl(30_60%_88%)]',
    border: 'border-[hsl(30_55%_60%/0.5)]',
  },
  Poor: {
    gradient: 'from-[hsl(0_55%_50%)] via-[hsl(350_50%_58%)] to-[hsl(340_45%_65%)]',
    glow: 'shadow-[0_0_10px_hsl(350_50%_65%/0.25)]',
    text: 'text-[hsl(350_50%_88%)]',
    border: 'border-[hsl(350_45%_55%/0.4)]',
  },
};

const SIZE_CONFIG = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-1',
  lg: 'text-xs px-3 py-1.5',
};

export function HolographicBadge({
  tier,
  score,
  size = 'md',
  className,
  animated = true,
}: HolographicBadgeProps) {
  const config = TIER_CONFIG[tier];

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 rounded-md font-medium",
        "bg-gradient-to-r",
        config.gradient,
        config.glow,
        config.text,
        config.border,
        "border",
        SIZE_CONFIG[size],
        animated && "animate-shimmer-subtle",
        className
      )}
    >
      {/* Holographic shimmer overlay */}
      <div 
        className={cn(
          "absolute inset-0 rounded-md overflow-hidden pointer-events-none",
          animated && "animate-holographic"
        )}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            transform: 'translateX(-100%) skewX(-20deg)',
            animation: animated ? 'holographic-sweep 3s ease-in-out infinite' : 'none',
          }}
        />
      </div>
      
      <span className="relative z-10 font-semibold tracking-wide">{tier}</span>
      {score !== undefined && (
        <span className="relative z-10 opacity-90 tabular-nums">
          · {score.toFixed(2)}
        </span>
      )}
    </div>
  );
}
