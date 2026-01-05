import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CursorSpotlightProps {
  className?: string;
  size?: number;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export function CursorSpotlight({ 
  className,
  size = 400,
  intensity = 'subtle'
}: CursorSpotlightProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile/touch device
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    if (!isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile]);

  // Don't render on mobile
  if (isMobile) return null;

  const opacityValue = intensity === 'subtle' ? 0.06 : intensity === 'medium' ? 0.1 : 0.15;

  return (
    <div
      className={cn(
        "fixed pointer-events-none z-50 transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        background: `radial-gradient(circle at center, 
          hsl(250 60% 75% / ${opacityValue}) 0%, 
          hsl(340 55% 75% / ${opacityValue * 0.5}) 30%,
          transparent 70%
        )`,
        filter: 'blur(40px)',
        transform: 'translate3d(0, 0, 0)', // GPU acceleration
      }}
    />
  );
}
