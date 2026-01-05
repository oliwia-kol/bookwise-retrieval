import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LivingBackgroundProps {
  className?: string;
  isActive?: boolean;
}

export function LivingBackground({ 
  className, 
  isActive = false 
}: LivingBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden",
        className
      )}
    >
      {/* Base dark background with warm tint */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Living mesh gradient - warm colors */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000 animate-mesh-flow",
          isActive ? "opacity-90" : "opacity-70"
        )}
      >
        {/* Orange-coral blob - bottom left */}
        <div 
          className="absolute w-[1000px] h-[1000px] rounded-full blur-[180px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(24 95% 50% / 0.25) 0%, transparent 70%)',
            bottom: '-20%',
            left: '-10%',
            animationDelay: '0s',
          }}
        />
        
        {/* Violet-purple blob - top right */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(262 83% 58% / 0.2) 0%, transparent 70%)',
            top: '-10%',
            right: '-5%',
            animationDelay: '2s',
          }}
        />
        
        {/* Rose-pink blob - center right */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(350 89% 60% / 0.18) 0%, transparent 70%)',
            top: '40%',
            right: '10%',
            animationDelay: '4s',
          }}
        />
        
        {/* Yellow-amber accent blob - top left */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(45 100% 51% / 0.12) 0%, transparent 70%)',
            top: '5%',
            left: '15%',
            animationDelay: '3s',
          }}
        />
        
        {/* Coral center glow */}
        <div 
          className="absolute w-[700px] h-[700px] rounded-full blur-[160px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(12 90% 58% / 0.1) 0%, transparent 60%)',
            top: '30%',
            left: '40%',
            animationDelay: '5s',
          }}
        />
      </div>
      
      {/* Noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(220 15% 5% / 0.6) 100%)',
        }}
      />
    </div>
  );
}
