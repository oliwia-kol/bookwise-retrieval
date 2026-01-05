import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AuroraBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  isSearching?: boolean;
}

export function AuroraBackground({ 
  className, 
  intensity = 'subtle',
  isSearching = false 
}: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Intensify aurora when searching
    if (isSearching) {
      containerRef.current.style.setProperty('--aurora-intensity', '1.5');
    } else {
      containerRef.current.style.setProperty('--aurora-intensity', '1');
    }
  }, [isSearching]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden",
        className
      )}
      style={{ '--aurora-intensity': '1' } as React.CSSProperties}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Aurora layers */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          intensity === 'subtle' && "opacity-30",
          intensity === 'medium' && "opacity-50",
          intensity === 'strong' && "opacity-70"
        )}
      >
        {/* Primary aurora blob */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] animate-aurora-1"
          style={{
            background: 'radial-gradient(circle, hsl(250 60% 50% / 0.3) 0%, transparent 70%)',
            top: '10%',
            left: '15%',
          }}
        />
        
        {/* Secondary aurora blob */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] animate-aurora-2"
          style={{
            background: 'radial-gradient(circle, hsl(340 55% 50% / 0.25) 0%, transparent 70%)',
            top: '50%',
            right: '10%',
          }}
        />
        
        {/* Tertiary aurora blob */}
        <div 
          className="absolute w-[700px] h-[700px] rounded-full blur-[110px] animate-aurora-3"
          style={{
            background: 'radial-gradient(circle, hsl(200 60% 45% / 0.2) 0%, transparent 70%)',
            bottom: '5%',
            left: '30%',
          }}
        />
        
        {/* Accent aurora blob */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[90px] animate-aurora-4"
          style={{
            background: 'radial-gradient(circle, hsl(170 45% 45% / 0.15) 0%, transparent 70%)',
            top: '30%',
            right: '30%',
          }}
        />
      </div>
      
      {/* Noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(0 0% 4% / 0.4) 100%)',
        }}
      />
    </div>
  );
}
