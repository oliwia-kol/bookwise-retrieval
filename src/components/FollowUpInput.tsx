import { useState, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FollowUpInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function FollowUpInput({ onSubmit, isLoading = false, className }: FollowUpInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "relative flex items-center rounded-2xl transition-all duration-400",
          "glass-subtle",
          isFocused && "ring-2 ring-primary/30 glow-primary-subtle"
        )}
      >
        <Sparkles className={cn(
          "absolute left-4 h-4 w-4 transition-colors duration-300",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask a follow-up question..."
          className={cn(
            "pl-11 pr-14 h-12 text-sm rounded-2xl",
            "bg-transparent border-none",
            "placeholder:text-muted-foreground/50",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-300"
          )}
          disabled={isLoading}
        />
        
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          size="icon"
          variant="cta"
          className={cn(
            "absolute right-2 h-8 w-8 rounded-xl",
            "disabled:opacity-30"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
