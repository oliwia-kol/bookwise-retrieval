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
      
      {/* Living mesh gradient - balanced warm and cool */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000 animate-mesh-flow",
          isActive ? "opacity-90" : "opacity-70"
        )}
      >
        {/* Gold blob - bottom left (warm anchor) */}
        <div 
          className="absolute w-[900px] h-[900px] rounded-full blur-[180px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(45 70% 55% / 0.18) 0%, transparent 70%)',
            bottom: '-20%',
            left: '-10%',
            animationDelay: '0s',
          }}
        />
        
        {/* Lavender blob - top right (cool anchor) */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(255 55% 70% / 0.2) 0%, transparent 70%)',
            top: '-10%',
            right: '-5%',
            animationDelay: '2s',
          }}
        />
        
        {/* Cyan blob - center right (cool accent) */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(185 55% 55% / 0.15) 0%, transparent 70%)',
            top: '35%',
            right: '5%',
            animationDelay: '4s',
          }}
        />
        
        {/* Coral blob - top left (warm accent) */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(15 65% 62% / 0.14) 0%, transparent 70%)',
            top: '5%',
            left: '10%',
            animationDelay: '3s',
          }}
        />
        
        {/* Periwinkle center glow (cool bridge) */}
        <div 
          className="absolute w-[700px] h-[700px] rounded-full blur-[160px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(232 50% 65% / 0.1) 0%, transparent 60%)',
            top: '30%',
            left: '35%',
            animationDelay: '5s',
          }}
        />
        
        {/* Dusty rose accent - bottom center (warm bridge) */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[110px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(350 38% 70% / 0.12) 0%, transparent 70%)',
            bottom: '10%',
            left: '40%',
            animationDelay: '6s',
          }}
        />

        {/* Sage accent - bottom right (natural balance) */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-[90px] animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsl(150 40% 52% / 0.1) 0%, transparent 70%)',
            bottom: '20%',
            right: '15%',
            animationDelay: '7s',
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
