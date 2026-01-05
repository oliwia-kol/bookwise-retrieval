import { Menu, Sun, Moon, Bug, Sparkles, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealth } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onToggleDebug?: () => void;
  showDebug?: boolean;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function AppHeader({ 
  onToggleSidebar, 
  onToggleDebug, 
  showDebug,
  isDark = true,
  onToggleTheme
}: AppHeaderProps) {
  const { data: health, isLoading } = useHealth();

  return (
    <header className="h-14 sm:h-16 border-b border-border/10 flex items-center justify-between px-4 sm:px-6 bg-background/60 backdrop-blur-2xl relative z-20">
      <div className="flex items-center gap-3 sm:gap-5">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar}
          className="h-9 w-9 hover:bg-secondary/50 hover:text-primary transition-all duration-300"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Logo with animated gradient */}
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl gradient-gold flex items-center justify-center glow-primary-subtle group">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-background transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  transform: 'translateX(-100%) skewX(-20deg)',
                  animation: 'holographic-sweep 1.5s ease-in-out',
                }}
              />
            </div>
          </div>
          <div>
            <h1 className="font-semibold text-base sm:text-lg tracking-tight gradient-pastel-text">
              RAG Books
            </h1>
            <p className="hidden sm:block text-[10px] text-muted-foreground -mt-0.5 tracking-[0.2em] uppercase">
              AI Search Engine
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status indicator - desktop */}
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-500",
          isLoading && "bg-secondary/50 animate-pulse",
          !isLoading && health?.ok && "glass-subtle text-accent glow-success",
          !isLoading && !health?.ok && "bg-destructive/10 text-destructive border border-destructive/20"
        )}>
          <span className={cn(
            "relative h-2 w-2 rounded-full",
            isLoading && "bg-muted-foreground",
            !isLoading && health?.ok && "bg-accent",
            !isLoading && !health?.ok && "bg-destructive"
          )}>
            {/* Pulsing ring for online status */}
            {!isLoading && health?.ok && (
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />
            )}
          </span>
          {isLoading ? 'Connecting...' : health?.ok ? 'Online' : 'Offline'}
        </div>

        {/* Mobile status indicator */}
        <div className={cn(
          "sm:hidden relative h-2.5 w-2.5 rounded-full",
          isLoading && "bg-muted-foreground animate-pulse",
          !isLoading && health?.ok && "bg-accent",
          !isLoading && !health?.ok && "bg-destructive"
        )}>
          {!isLoading && health?.ok && (
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-40" />
          )}
        </div>

        {onToggleDebug && (
          <Button 
            variant={showDebug ? "default" : "ghost"} 
            size="icon"
            onClick={onToggleDebug}
            className={cn(
              "h-9 w-9 transition-all duration-300",
              showDebug && "gradient-gold text-background glow-primary-subtle",
              !showDebug && "hover:bg-secondary/50 hover:text-primary"
            )}
          >
            <Bug className="h-4 w-4" />
          </Button>
        )}

        {/* Theme toggle with rotation animation */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleTheme}
          className="h-9 w-9 hover:bg-secondary/50 hover:text-primary transition-all duration-300 group"
        >
          <div className="relative">
            {isDark ? (
              <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12" />
            )}
          </div>
        </Button>
      </div>
    </header>
  );
}
