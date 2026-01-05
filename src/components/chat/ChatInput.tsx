import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, isLoading = false, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div 
        className={cn(
          "relative flex items-end gap-3 rounded-2xl transition-all duration-400 p-3",
          "glass-card",
          isFocused && "ring-2 ring-primary/40 glow-primary-subtle border-animated"
        )}
      >
        {/* Sparkle icon */}
        <div className={cn(
          "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
          isFocused ? "gradient-warm glow-primary-subtle" : "bg-secondary"
        )}>
          <Sparkles className={cn(
            "h-4 w-4 transition-colors",
            isFocused ? "text-white" : "text-muted-foreground"
          )} />
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || "Ask about your technical library..."}
          rows={1}
          className={cn(
            "flex-1 bg-transparent border-none resize-none",
            "text-sm leading-relaxed",
            "placeholder:text-muted-foreground/40",
            "focus:outline-none focus:ring-0",
            "min-h-[24px] max-h-[200px] py-1"
          )}
          disabled={isLoading}
        />

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl shrink-0",
            "btn-primary-vibrant",
            isLoading && "animate-pulse-glow"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hints */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground/50">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-secondary/50 border border-border/30 font-mono text-[9px]">Enter</kbd>
          to send
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-secondary/50 border border-border/30 font-mono text-[9px]">Shift+Enter</kbd>
          new line
        </span>
      </div>
    </div>
  );
}
