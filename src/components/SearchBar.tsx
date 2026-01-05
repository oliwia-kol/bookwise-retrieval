import { useState, useCallback, useRef } from 'react';
import { Search, Clock, X, Sparkles, Loader2 } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      setShowHistory(false);
    }
    if (e.key === 'Escape') {
      setShowHistory(false);
      inputRef.current?.blur();
    }
  }, [onSubmit]);

  const handleSelectRecent = (query: string) => {
    onChange(query);
    setShowHistory(false);
    onSubmit();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main search container */}
      <div 
        className={cn(
          "relative flex items-center rounded-2xl transition-all duration-500",
          "glass-card",
          isFocused && "ring-2 ring-primary/40 glow-primary-subtle"
        )}
        style={{
          transform: isFocused ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        {/* Animated rainbow border on focus */}
        {isFocused && (
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none border-animated"
            style={{
              opacity: 0.6,
            }}
          />
        )}
        
        {/* Search icon */}
        <div className={cn(
          "absolute left-5 transition-all duration-400",
          isFocused ? "text-primary" : "text-muted-foreground"
        )}>
          <Search 
            className="h-5 w-5"
            style={{
              filter: isFocused ? 'drop-shadow(0 0 8px hsl(175 85% 45% / 0.5))' : 'none',
            }}
          />
        </div>
        
        <Input
          ref={inputRef}
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
          placeholder="Ask anything about your library..."
          className={cn(
            "pl-14 pr-40 h-16 text-base sm:text-lg rounded-2xl",
            "bg-transparent border-none",
            "placeholder:text-muted-foreground/40",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-300"
          )}
          disabled={isLoading}
        />
        
        {/* Right side actions */}
        <div className="absolute right-3 flex items-center gap-2">
          {/* Keyboard shortcut hint */}
          {!value && !isLoading && !isFocused && (
            <div className="hidden sm:flex items-center text-muted-foreground/30 text-xs mr-2">
              <kbd className="px-2 py-1 rounded-lg bg-secondary/50 border border-border/30 font-mono text-[10px]">/</kbd>
            </div>
          )}
          
          {/* Clear button */}
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Search button - Vibrant teal */}
          <Button
            onClick={onSubmit}
            disabled={!value || isLoading}
            className={cn(
              "h-11 px-6 rounded-xl font-medium",
              "btn-primary-vibrant",
              isLoading && "animate-pulse-glow"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Thinking</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Recent queries dropdown */}
      {showHistory && recentQueries.length > 0 && (
        <div 
          className={cn(
            "absolute top-full left-0 right-0 mt-3 z-50",
            "glass-card rounded-xl overflow-hidden",
            "animate-fade-in"
          )}
        >
          <div className="p-3">
            <p className="text-[10px] text-muted-foreground mb-2 px-2 uppercase tracking-widest font-medium">
              Recent
            </p>
            {recentQueries.slice(0, 5).map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectRecent(query)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg",
                  "hover:bg-primary/10 hover:text-primary text-left",
                  "transition-all duration-300 group"
                )}
                style={{
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="truncate">{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
