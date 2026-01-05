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
    <header className="h-12 sm:h-14 border-b border-border/30 flex items-center justify-between px-3 sm:px-4 bg-background/95 backdrop-blur-xl">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar}
          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-secondary hover-gold transition-all"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative h-7 w-7 sm:h-9 sm:w-9 rounded-xl gradient-gold flex items-center justify-center glow-gold-subtle">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-background" />
          </div>
          <div>
            <h1 className="font-semibold text-sm sm:text-base tracking-tight text-glow-gold">RAG Books</h1>
            <p className="hidden sm:block text-[10px] text-muted-foreground -mt-0.5 tracking-[0.2em] uppercase">Search Engine</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500",
          isLoading && "bg-secondary animate-pulse",
          !isLoading && health?.ok && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-success",
          !isLoading && !health?.ok && "bg-destructive/10 text-destructive border border-destructive/20"
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            isLoading && "bg-muted-foreground",
            !isLoading && health?.ok && "bg-emerald-400 animate-pulse",
            !isLoading && !health?.ok && "bg-destructive"
          )} />
          {isLoading ? 'Connecting...' : health?.ok ? 'Online' : 'Offline'}
        </div>

        {/* Mobile status indicator */}
        <div className={cn(
          "sm:hidden h-2 w-2 rounded-full",
          isLoading && "bg-muted-foreground animate-pulse",
          !isLoading && health?.ok && "bg-emerald-400",
          !isLoading && !health?.ok && "bg-destructive"
        )} />

        {onToggleDebug && (
          <Button 
            variant={showDebug ? "default" : "ghost"} 
            size="icon"
            onClick={onToggleDebug}
            className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 transition-all",
              showDebug && "gradient-gold text-background glow-gold-subtle",
              !showDebug && "hover:bg-secondary hover-gold"
            )}
          >
            <Bug className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        )}

        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleTheme}
          className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-secondary hover-gold transition-all"
        >
          {isDark ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </Button>
      </div>
    </header>
  );
}
