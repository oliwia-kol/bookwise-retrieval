import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LivingBackgroundProps {
  className?: string;
  isSearching?: boolean;
}

export function LivingBackground({ 
  className, 
  isSearching = false 
}: LivingBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (isSearching) {
      containerRef.current.style.setProperty('--mesh-intensity', '1.3');
    } else {
      containerRef.current.style.setProperty('--mesh-intensity', '1');
    }
  }, [isSearching]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden",
        className
      )}
      style={{ '--mesh-intensity': '1' } as React.CSSProperties}
    >
      {/* Base dark background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Living mesh gradient */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000 animate-mesh-flow",
          isSearching ? "opacity-80" : "opacity-60"
        )}
      >
        {/* Teal blob - top left */}
        <div 
          className="absolute w-[900px] h-[900px] rounded-full blur-[150px] animate-mesh-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(175 85% 40% / 0.25) 0%, transparent 70%)',
            top: '-10%',
            left: '-5%',
            animationDelay: '0s',
          }}
        />
        
        {/* Purple blob - top right */}
        <div 
          className="absolute w-[700px] h-[700px] rounded-full blur-[130px] animate-mesh-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(270 75% 50% / 0.2) 0%, transparent 70%)',
            top: '5%',
            right: '-5%',
            animationDelay: '2s',
          }}
        />
        
        {/* Pink blob - bottom right */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] animate-mesh-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(335 85% 50% / 0.18) 0%, transparent 70%)',
            bottom: '10%',
            right: '15%',
            animationDelay: '4s',
          }}
        />
        
        {/* Orange accent blob - bottom left */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-mesh-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(25 95% 50% / 0.12) 0%, transparent 70%)',
            bottom: '5%',
            left: '10%',
            animationDelay: '6s',
          }}
        />
        
        {/* Center subtle glow */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[140px] animate-mesh-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(215 90% 50% / 0.08) 0%, transparent 60%)',
            top: '30%',
            left: '30%',
            animationDelay: '3s',
          }}
        />
      </div>
      
      {/* Noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(0 0% 3% / 0.5) 100%)',
        }}
      />
    </div>
  );
}
