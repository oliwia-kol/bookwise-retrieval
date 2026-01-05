import { User, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { SourceCard } from './SourceCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EvidenceHit } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
  onSourceClick?: (sourceId: string) => void;
}

export function ChatMessage({ message, onSourceClick }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSource, setSelectedSource] = useState<EvidenceHit | null>(null);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSourceClick = (source: EvidenceHit) => {
    setSelectedSource(source);
    onSourceClick?.(source.id);
  };

  if (message.isLoading) {
    return (
      <div className="flex gap-4 animate-fade-in">
        <div className="h-9 w-9 rounded-xl gradient-warm flex items-center justify-center shrink-0 glow-primary-subtle">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
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
    <>
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
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          )}
        </div>

        {/* Content */}
        <div className={cn("flex-1 max-w-[85%]", isUser && "flex flex-col items-end")}>
          <div className={cn(
            "rounded-2xl px-4 py-3 group relative",
            isUser ? "chat-message-user" : "chat-message-assistant"
          )}>
            {/* Render assistant content with preserved line breaks */}
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {message.content}
              </p>
            )}

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
                    onClick={() => handleSourceClick(source)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Source Detail Dialog */}
      <Dialog open={!!selectedSource} onOpenChange={(open) => !open && setSelectedSource(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] glass-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {selectedSource?.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedSource?.publisher} · {selectedSource?.section}
            </p>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {selectedSource?.snippet}
                </p>
              </div>
              {selectedSource?.full_text && (
                <div className="p-4 rounded-lg bg-background/50 border border-border/20">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Full Context</h4>
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {selectedSource.full_text}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
