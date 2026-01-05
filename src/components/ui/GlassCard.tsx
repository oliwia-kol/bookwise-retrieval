import { forwardRef, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  tiltEffect?: boolean;
  glowColor?: 'lavender' | 'rose' | 'mint' | 'sky' | 'rainbow';
}

const GLOW_COLORS = {
  lavender: 'hsl(250 60% 75%)',
  rose: 'hsl(340 55% 78%)',
  mint: 'hsl(170 45% 75%)',
  sky: 'hsl(200 60% 78%)',
  rainbow: 'linear-gradient(135deg, hsl(250 60% 75%), hsl(340 55% 78%), hsl(200 60% 78%))',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', tiltEffect = false, glowColor = 'lavender', children, ...props }, ref) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltEffect || !cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      setTilt({ x: y * 8, y: -x * 8 });
    }, [tiltEffect]);

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setTilt({ x: 0, y: 0 });
    };

    const glowStyle = isHovering ? {
      boxShadow: `
        0 8px 32px hsl(0 0% 0% / 0.4),
        0 0 20px ${GLOW_COLORS[glowColor]}20,
        inset 0 1px 0 hsl(0 0% 100% / 0.05)
      `,
    } : {};

    return (
      <div
        ref={(node) => {
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "relative rounded-xl transition-all duration-300",
          // Glass material
          "bg-gradient-to-br from-[hsl(0_0%_100%/0.04)] to-[hsl(0_0%_100%/0.01)]",
          "backdrop-blur-xl",
          "border border-[hsl(0_0%_100%/0.08)]",
          // Variants
          variant === 'elevated' && "shadow-xl shadow-black/40",
          variant === 'interactive' && "cursor-pointer hover:border-[hsl(0_0%_100%/0.15)]",
          className
        )}
        style={{
          transform: tiltEffect && isHovering 
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)` 
            : 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)',
          ...glowStyle,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Inner highlight */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.03) 0%, transparent 50%)',
            opacity: isHovering ? 1 : 0,
          }}
        />
        
        {/* Rainbow border on hover */}
        {isHovering && (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none animate-border-glow"
            style={{
              background: 'linear-gradient(135deg, hsl(250 60% 75% / 0.3), hsl(340 55% 78% / 0.2), hsl(200 60% 78% / 0.3))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1px',
            }}
          />
        )}
        
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
