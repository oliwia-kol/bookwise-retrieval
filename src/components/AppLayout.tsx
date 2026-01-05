import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, BookOpen, Zap, Shield } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { SettingsModal } from './SettingsModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { LivingBackground } from './effects/LivingBackground';
import { CursorSpotlight } from './effects/CursorSpotlight';
import { useSearch, useHealth } from '@/hooks/useSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import type { SearchFilters, ChatMessage as ChatMessageType, Publisher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const DEFAULT_FILTERS: SearchFilters = {
  pubs: [],
  mode: 'quick',
  sort: 'Best evidence',
  jmin: 0.45,
  judge_mode: 'real',
  show_near_miss: true,
};

const FEATURE_CHIPS = [
  { icon: Sparkles, label: 'AI-Powered', color: 'text-[hsl(var(--color-orange))]' },
  { icon: BookOpen, label: '3 Publishers', color: 'text-[hsl(var(--color-violet))]' },
  { icon: Zap, label: 'Instant', color: 'text-[hsl(var(--color-yellow))]' },
  { icon: Shield, label: 'Verified', color: 'text-[hsl(var(--color-green))]' },
];

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isDark, toggleTheme } = useTheme();
  const { data: health } = useHealth();
  const { data: searchResult, isLoading } = useSearch(currentQuery, filters);

  const availablePublishers: Publisher[] = health?.publishers || ['OReilly', 'Manning', 'Pearson'];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle search result - use ref to track processed queries
  const processedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (searchResult && currentQuery && currentQuery !== processedQueryRef.current) {
      processedQueryRef.current = currentQuery;
      
      // Remove loading message and add assistant response
      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isLoading);
        
        // Create response based on results
        const responseContent = searchResult.hits.length > 0
          ? `I found **${searchResult.hits.length} relevant sources** for your query. Here are the key findings:\n\n${searchResult.hits.slice(0, 3).map((hit, i) => 
              `**${i + 1}. ${hit.title}** _(${hit.publisher})_\n\n${hit.snippet}`
            ).join('\n\n---\n\n')}`
          : "I couldn't find any relevant sources for your query. Try rephrasing or asking about a different topic.";

        return [...withoutLoading, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          evidence: searchResult.hits,
          timestamp: new Date(),
        }];
      });
      setCurrentQuery('');
    }
  }, [searchResult, currentQuery]);

  const handleSubmit = useCallback((message: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    // Add loading message
    const loadingMessage: ChatMessageType = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setCurrentQuery(message);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentQuery('');
    processedQueryRef.current = null;
  }, []);

  // Keyboard shortcuts
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts({
    hits: searchResult?.hits || [],
    selectedHit: null,
    onSelectHit: () => {},
    onPinHit: () => {},
    onClearSelection: () => {},
  });

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Living Background */}
      <LivingBackground isActive={isLoading || hasMessages} />
      
      {/* Cursor Spotlight Effect */}
      <CursorSpotlight intensity="subtle" />
      
      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <AppHeader 
          onOpenSettings={() => setSettingsOpen(true)}
          onNewChat={hasMessages ? handleNewChat : undefined}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {!hasMessages ? (
            /* Empty state - Hero */
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
              <div className="text-center mb-10 animate-fade-in">
                {/* Animated logo */}
                <div className="relative h-20 w-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-2xl gradient-sunset opacity-20 blur-xl animate-breathe" />
                  <div className="relative h-full w-full rounded-2xl gradient-warm flex items-center justify-center glow-primary">
                    <Sparkles className="h-9 w-9 text-white" />
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 gradient-sunset-text">
                  Ask your library
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
                  Get instant answers from O'Reilly, Manning, and Pearson technical books
                </p>
              </div>

              {/* Feature chips */}
              <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
                {FEATURE_CHIPS.map((chip, i) => (
                  <div
                    key={chip.label}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full glass-subtle",
                      "animate-gentle-float"
                    )}
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <chip.icon className={cn("h-4 w-4", chip.color)} />
                    <span className="text-sm text-foreground/80">{chip.label}</span>
                  </div>
                ))}
              </div>

              {/* Suggested queries */}
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
                {[
                  'What are React best practices?',
                  'Explain microservices architecture',
                  'How does Docker networking work?',
                ].map((query) => (
                  <button
                    key={query}
                    onClick={() => handleSubmit(query)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm",
                      "bg-secondary/50 hover:bg-secondary border border-border/30 hover:border-primary/30",
                      "transition-all duration-300 hover:scale-[1.02]"
                    )}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat messages */
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input area */}
          <div className={cn(
            "py-4 border-t border-border/10 bg-background/50 backdrop-blur-xl",
            !hasMessages && "absolute bottom-0 left-0 right-0 border-t-0 bg-transparent"
          )}>
            <ChatInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              placeholder={hasMessages ? "Ask a follow-up..." : "Ask about your technical library..."}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        filters={filters}
        onFiltersChange={setFilters}
        availablePublishers={availablePublishers}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
    </div>
  );
}
