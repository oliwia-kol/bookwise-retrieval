import { useState, useEffect, useCallback } from 'react';
import { Menu, Sun, Moon, Activity, Bug } from 'lucide-react';
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
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">RAG Books Search</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
          isLoading && "bg-muted",
          health?.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
        )}>
          <Activity className="h-3.5 w-3.5" />
          {isLoading ? 'Connecting...' : health?.ok ? 'Engine Ready' : 'Engine Offline'}
        </div>

        {onToggleDebug && (
          <Button 
            variant={showDebug ? "default" : "ghost"} 
            size="icon"
            onClick={onToggleDebug}
          >
            <Bug className="h-4 w-4" />
          </Button>
        )}

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
