import { MessageCircle, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatUnavailableProps {
  onSwitchToSearch: () => void;
}

export function ChatUnavailable({ onSwitchToSearch }: ChatUnavailableProps) {
  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col items-center text-center gap-5">
            {/* Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl animate-pulse" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 border border-accent/30">
                <MessageCircle className="h-7 w-7 text-accent" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-semibold text-foreground">
                Chat Mode is Currently Unavailable
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chat with LLM + RAG requires additional backend configuration. 
                In the meantime, try our powerful <strong className="text-foreground">Search mode</strong> for 
                instant answers from your technical library.
              </p>
            </div>

            {/* CTA Button */}
            <Button
              onClick={onSwitchToSearch}
              variant="outline"
              className={cn(
                'gap-2 rounded-full px-6 py-2.5 text-sm font-medium',
                'border-primary/40 bg-primary/10 text-foreground',
                'hover:bg-primary/20 hover:border-primary/60',
                'transition-all duration-200'
              )}
            >
              <Search className="h-4 w-4" />
              Switch to Search Mode
              <ArrowRight className="h-4 w-4" />
            </Button>

            {/* Features list */}
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                Instant results
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                Source citations
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(142_70%_50%)]" />
                Quality scores
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
