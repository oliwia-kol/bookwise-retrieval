import { Settings, Sun, Moon, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealth } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onOpenSettings: () => void;
  onNewChat?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function AppHeader({ 
  onOpenSettings,
  onNewChat,
  isDark = true,
  onToggleTheme
}: AppHeaderProps) {
  const { data: health, isLoading } = useHealth();

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 bg-background/50 backdrop-blur-xl border-b border-border/10 relative z-20">
      <div className="flex items-center gap-3">
        {/* Logo with rainbow glow */}
        <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl gradient-warm flex items-center justify-center animate-rainbow-glow group animate-gentle-float">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
        </div>
        <div>
          <h1 className="font-semibold text-base sm:text-lg tracking-tight gradient-sunset-text">
            RAG Books
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* New Chat button */}
        {onNewChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="h-8 px-3 text-xs border-border/30 hover:border-primary/50 hover:bg-primary/5 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        )}

        {/* Status indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
          "glass-subtle"
        )}>
          <span className={cn(
            "relative h-2 w-2 rounded-full",
            isLoading && "bg-muted-foreground animate-pulse",
            !isLoading && health?.ok && "bg-[hsl(var(--color-green))]",
            !isLoading && !health?.ok && "bg-destructive"
          )}>
            {!isLoading && health?.ok && (
              <span className="absolute inset-0 rounded-full bg-[hsl(var(--color-green))] animate-status-pulse" />
            )}
          </span>
          <span className="hidden sm:inline text-muted-foreground">
            {isLoading ? 'Connecting' : health?.ok ? 'Ready' : 'Offline'}
          </span>
        </div>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onOpenSettings}
          className="h-9 w-9 hover:bg-secondary/50 hover:text-primary transition-all duration-300"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Theme toggle */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleTheme}
          className="h-9 w-9 hover:bg-secondary/50 hover:text-primary transition-all duration-300 group"
        >
          {isDark ? (
            <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
          ) : (
            <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12" />
          )}
        </Button>
      </div>
    </header>
  );
}
