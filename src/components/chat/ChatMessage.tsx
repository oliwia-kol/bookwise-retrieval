import { User, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { SourceCard } from './SourceCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onSourceClick?: (sourceId: string) => void;
}

export function ChatMessage({ message, onSourceClick }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.isLoading) {
    return (
      <div className="flex gap-4 animate-fade-in">
        <div className="h-9 w-9 rounded-xl gradient-warm flex items-center justify-center shrink-0 glow-primary-subtle">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary typing-dot" />
            <div className="h-2 w-2 rounded-full bg-primary typing-dot" />
            <div className="h-2 w-2 rounded-full bg-primary typing-dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-4 animate-slide-up-fade", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
        isUser 
          ? "bg-secondary border border-border/50" 
          : "gradient-warm glow-primary-subtle"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-foreground/70" />
        ) : (
          <Sparkles className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 group relative",
          isUser ? "chat-message-user" : "chat-message-assistant"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Copy button */}
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute -right-10 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-primary/10 hover:text-primary"
              )}
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>

        {/* Sources */}
        {message.evidence && message.evidence.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {message.evidence.slice(0, 4).map((source, idx) => (
                <SourceCard 
                  key={source.id} 
                  source={source} 
                  index={idx + 1}
                  onClick={() => onSourceClick?.(source.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
