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
    <div className="relative w-full">
      {/* Main search container with glass effect */}
      <div 
        className={cn(
          "relative flex items-center rounded-2xl transition-all duration-500",
          "glass-card",
          isFocused && "ring-2 ring-primary/40 glow-primary-subtle",
          isLoading && "animate-pulse-glow"
        )}
        style={{
          transform: isFocused ? 'scale(1.005)' : 'scale(1)',
        }}
      >
        {/* Animated border on focus */}
        {isFocused && (
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, hsl(250 65% 72% / 0.3), hsl(340 60% 75% / 0.2), hsl(200 65% 75% / 0.3))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1.5px',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />
        )}
        
        {/* Search icon with glow */}
        <div className={cn(
          "absolute left-4 transition-all duration-400",
          isFocused ? "text-primary" : "text-muted-foreground"
        )}>
          <Search 
            className="h-5 w-5"
            style={{
              filter: isFocused ? 'drop-shadow(0 0 6px hsl(250 65% 72% / 0.5))' : 'none',
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
          placeholder="Search across your library..."
          className={cn(
            "pl-12 pr-36 h-14 text-base rounded-2xl",
            "bg-transparent border-none",
            "placeholder:text-muted-foreground/50",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-300"
          )}
          disabled={isLoading}
        />
        
        {/* Right side actions */}
        <div className="absolute right-3 flex items-center gap-2">
          {/* Keyboard shortcut hint */}
          {!value && !isLoading && !isFocused && (
            <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground/40 text-xs mr-1">
              <kbd className="px-2 py-1 rounded-md bg-secondary/50 border border-border/50 font-mono text-[10px] tracking-wider">/</kbd>
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
          
          {/* Search button */}
          <Button
            onClick={onSubmit}
            disabled={!value || isLoading}
            className={cn(
              "h-10 px-5 rounded-xl font-medium",
              "gradient-gold text-background",
              "hover:opacity-90 transition-all duration-300",
              "disabled:opacity-40",
              isLoading && "glow-primary-subtle"
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

      {/* Recent queries dropdown with glass effect */}
      {showHistory && recentQueries.length > 0 && (
        <div 
          className={cn(
            "absolute top-full left-0 right-0 mt-3 z-50",
            "glass-card rounded-xl overflow-hidden",
            "animate-fade-in"
          )}
        >
          <div className="p-3">
            <p className="text-[10px] text-muted-foreground mb-2 px-2 uppercase tracking-[0.2em] font-medium">Recent searches</p>
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
