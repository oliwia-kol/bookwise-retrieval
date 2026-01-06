import { Settings, Sun, Moon, Sparkles, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const isReady = Boolean(health?.ready);

  return (
    <header className="h-14 sm:h-16 relative z-20 overflow-hidden border-b border-border/20 border-x-0 border-t-0 surface-glass">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[hsl(var(--brand-gold)/0.08)] via-transparent to-[hsl(var(--brand-lavender)/0.12)]" />
      <div className="absolute -bottom-8 left-1/2 h-12 w-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--brand-coral)/0.2)] blur-3xl opacity-70" />
      <div className="relative flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Logo with rainbow glow */}
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl gradient-warm flex items-center justify-center animate-rainbow-glow group animate-gentle-float">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
          </div>
          <div>
            <h1 className="text-title tracking-tight gradient-sunset-text">
              RAG Books
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Chat button */}
          {onNewChat && (
            <Button
              variant="cta"
              size="sm"
              onClick={onNewChat}
              className="hidden h-8 px-3 text-caption gap-1.5 rounded-full sm:inline-flex"
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
              !isLoading && isReady && "bg-[hsl(var(--color-green))]",
              !isLoading && !isReady && "bg-destructive"
            )}>
              {!isLoading && isReady && (
                <span className="absolute inset-0 rounded-full bg-[hsl(var(--color-green))] animate-status-pulse" />
              )}
            </span>
            <span className="hidden sm:inline text-caption text-muted-foreground">
              {isLoading ? 'Connecting' : isReady ? 'Ready' : 'Offline'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
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
              size="sm"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="h-9 px-3 gap-2 hover:bg-secondary/50 hover:text-primary transition-all duration-300 group"
            >
              {isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
              ) : (
                <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12" />
              )}
              <span className="hidden md:inline text-xs font-medium">
                {isDark ? 'Light mode' : 'Dark mode'}
              </span>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:hidden hover:bg-secondary/50 hover:text-primary transition-all duration-300"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onNewChat && (
                <DropdownMenuItem onClick={onNewChat} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New chat
                </DropdownMenuItem>
              )}
              {onNewChat && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={onOpenSettings} className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleTheme} className="gap-2">
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {isDark ? 'Light mode' : 'Dark mode'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
