import { useState, useCallback } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  recentQueries?: string[];
}

export function SearchBar({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading = false,
  recentQueries = [] 
}: SearchBarProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      setShowHistory(false);
    }
    if (e.key === 'Escape') {
      setShowHistory(false);
    }
  }, [onSubmit]);

  const handleSelectRecent = (query: string) => {
    onChange(query);
    setShowHistory(false);
    onSubmit();
  };

  return (
    <div className="relative w-full">
      <div className={cn(
        "relative flex items-center rounded-xl transition-all duration-500",
        isFocused && "glow-gold"
      )}>
        <Search className={cn(
          "absolute left-4 h-4 w-4 transition-colors duration-300",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (recentQueries.length > 0) setShowHistory(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowHistory(false), 200);
          }}
          placeholder="Search across books..."
          className={cn(
            "pl-11 pr-32 h-12 text-base rounded-xl border-border/30 bg-card/80",
            "placeholder:text-muted-foreground/40",
            "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
            "transition-all duration-300"
          )}
          disabled={isLoading}
        />
        <div className="absolute right-2 flex items-center gap-2">
          {!value && !isLoading && (
            <div className="hidden sm:flex items-center gap-1 text-muted-foreground/40 text-xs mr-2">
              <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/30 font-mono text-[10px]">/</kbd>
            </div>
          )}
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => onChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            onClick={onSubmit}
            disabled={!value || isLoading}
            size="sm"
            className={cn(
              "h-8 px-4 rounded-lg font-medium",
              "gradient-gold text-background",
              "hover:opacity-90 transition-all glow-gold-subtle"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Searching
              </span>
            ) : 'Search'}
          </Button>
        </div>
      </div>

      {/* Recent queries dropdown */}
      {showHistory && recentQueries.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 card-premium rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden border border-border/30">
          <div className="p-2">
            <p className="text-[10px] text-muted-foreground mb-2 px-2 uppercase tracking-[0.15em]">Recent</p>
            {recentQueries.slice(0, 5).map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectRecent(query)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg",
                  "hover:bg-primary/10 hover:text-primary text-left transition-all hover-gold"
                )}
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
