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
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => recentQueries.length > 0 && setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          placeholder="Search across books... (press / to focus)"
          className="pl-10 pr-20 h-12 text-base"
          disabled={isLoading}
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={onSubmit}
            disabled={!value || isLoading}
            size="sm"
            className="h-8"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Recent queries dropdown */}
      {showHistory && recentQueries.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-2">
            <p className="text-xs text-muted-foreground mb-2 px-2">Recent searches</p>
            {recentQueries.slice(0, 5).map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectRecent(query)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded",
                  "hover:bg-accent hover:text-accent-foreground text-left"
                )}
              >
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
