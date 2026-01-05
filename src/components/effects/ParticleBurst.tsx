import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
  life: number;
}

interface ParticleBurstProps {
  trigger: boolean;
  x?: number;
  y?: number;
  count?: number;
  className?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  'hsl(250 60% 75%)',
  'hsl(340 55% 78%)',
  'hsl(200 60% 78%)',
  'hsl(170 45% 75%)',
];

export function ParticleBurst({
  trigger,
  x = 0,
  y = 0,
  count = 12,
  className,
  colors = DEFAULT_COLORS,
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      newParticles.push({
        id: Date.now() + i,
        x: 0,
        y: 0,
        angle,
        velocity: 2 + Math.random() * 3,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }
    
    setParticles(newParticles);
  }, [count, colors]);

  useEffect(() => {
    if (trigger) {
      createParticles();
    }
  }, [trigger, createParticles]);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.velocity,
            y: p.y + Math.sin(p.angle) * p.velocity,
            velocity: p.velocity * 0.95,
            life: p.life - 0.03,
          }))
          .filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  if (particles.length === 0) return null;

  return (
    <div 
      className={cn("absolute pointer-events-none", className)}
      style={{ left: x, top: y }}
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `translate(-50%, -50%) scale(${particle.life})`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}
