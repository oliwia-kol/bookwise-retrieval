import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmitDisabled = !value.trim() || isLoading || disabled;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isLoading || disabled) return;
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
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4">
      <div 
        className={cn(
          "relative flex items-end gap-2 sm:gap-3 p-3 sm:p-4 overflow-hidden searchbar-animate rounded-full",
          "surface-elevated surface-interactive",
          isFocused && "glow-primary-subtle border-animated"
        )}
      >
        {/* Sparkle icon */}
        <div className={cn(
          "h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
          isFocused ? "gradient-warm glow-primary-subtle" : "bg-secondary"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
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
          placeholder={placeholder || "Ask about your library..."}
          rows={1}
          className={cn(
            "flex-1 bg-transparent border-none resize-none",
            "text-sm sm:text-base leading-6",
            "placeholder:text-muted-foreground/40",
            "focus:outline-none focus:ring-0",
            "min-h-[32px] max-h-[200px] py-2"
          )}
          disabled={isLoading || disabled}
        />

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          size="icon"
          variant="cta"
          className={cn(
            "h-9 w-9 sm:h-10 sm:w-10 rounded-full shrink-0",
            "transition-all",
            "hover:shadow-md hover:-translate-y-0.5",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0",
            isLoading && "animate-pulse-glow"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className={cn("h-4 w-4", isSubmitDisabled ? "text-muted-foreground" : "text-white")} />
          )}
        </Button>
      </div>

      {/* Hints */}
      <div className="hidden sm:flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground/50">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-secondary/50 border border-border/30 font-mono text-[9px]">Enter</kbd>
          <span className="text-muted-foreground/60">Press Enter to send</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-secondary/50 border border-border/30 font-mono text-[9px]">Shift+Enter</kbd>
          <span className="text-muted-foreground/60">New line</span>
        </span>
      </div>
    </div>
  );
}
