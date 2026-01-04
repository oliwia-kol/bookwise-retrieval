import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Activity, Bug, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealth } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onToggleDebug?: () => void;
  showDebug?: boolean;
}

export function AppHeader({ onToggleSidebar, onToggleDebug, showDebug }: AppHeaderProps) {
  const [isDark, setIsDark] = useState(true);
  const { data: health, isLoading } = useHealth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 glass">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-base tracking-tight">RAG Books</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5 tracking-widest uppercase">Search Engine</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
          isLoading && "bg-muted animate-pulse",
          !isLoading && health?.ok && "bg-primary/10 text-primary border border-primary/20",
          !isLoading && !health?.ok && "bg-destructive/10 text-destructive border border-destructive/20"
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            isLoading && "bg-muted-foreground",
            !isLoading && health?.ok && "bg-primary animate-pulse",
            !isLoading && !health?.ok && "bg-destructive"
          )} />
          {isLoading ? 'Connecting...' : health?.ok ? 'Online' : 'Offline'}
        </div>

        {onToggleDebug && (
          <Button 
            variant={showDebug ? "default" : "ghost"} 
            size="icon"
            onClick={onToggleDebug}
            className={cn(
              "h-8 w-8",
              !showDebug && "hover:bg-primary/10 hover:text-primary"
            )}
          >
            <Bug className="h-4 w-4" />
          </Button>
        )}

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
