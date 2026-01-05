import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'accent' | 'tier';
  className?: string;
}

const SIZE_CONFIG = {
  sm: { size: 32, stroke: 3, fontSize: 'text-[10px]' },
  md: { size: 48, stroke: 4, fontSize: 'text-xs' },
  lg: { size: 64, stroke: 5, fontSize: 'text-sm' },
};

const COLOR_CONFIG = {
  primary: {
    stroke: 'hsl(250 60% 75%)',
    glow: 'drop-shadow(0 0 4px hsl(250 60% 75% / 0.5))',
  },
  accent: {
    stroke: 'hsl(170 45% 75%)',
    glow: 'drop-shadow(0 0 4px hsl(170 45% 75% / 0.5))',
  },
  tier: {
    stroke: 'url(#tierGradient)',
    glow: 'drop-shadow(0 0 4px hsl(250 60% 75% / 0.3))',
  },
};

export function ScoreGauge({
  value,
  max = 1,
  size = 'md',
  label,
  showValue = true,
  color = 'primary',
  className,
}: ScoreGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const config = SIZE_CONFIG[size];
  const colorConfig = COLOR_CONFIG[color];
  
  const radius = (config.size - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference * (1 - animatedValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(normalizedValue);
    }, 100);
    return () => clearTimeout(timer);
  }, [normalizedValue]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
        style={{ filter: colorConfig.glow }}
      >
        <defs>
          <linearGradient id="tierGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(170 45% 75%)" />
            <stop offset="50%" stopColor="hsl(250 60% 75%)" />
            <stop offset="100%" stopColor="hsl(340 55% 78%)" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="hsl(0 0% 20%)"
          strokeWidth={config.stroke}
        />
        
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center content */}
      {showValue && (
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center",
          config.fontSize
        )}>
          <span className="font-medium text-foreground tabular-nums">
            {(value).toFixed(2)}
          </span>
          {label && (
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
