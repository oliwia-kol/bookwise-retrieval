import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, BookOpen, Zap, Shield, Library, CheckCircle2 } from 'lucide-react';
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
  { icon: Sparkles, label: 'AI-Powered', color: 'text-brand-lavender' },
  { icon: Library, label: '3 Publishers', color: 'text-brand-coral' },
  { icon: Zap, label: 'Instant', color: 'text-brand-cyan' },
  { icon: CheckCircle2, label: 'Verified', color: 'text-brand-sage' },
];

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isDark, toggleTheme } = useTheme();
  const { data: health } = useHealth();
  const isReady = Boolean(health?.ready);
  const { data: searchResult, isLoading } = useSearch(currentQuery, filters, isReady);

  const availablePublishers: Publisher[] = health?.publishers || ['OReilly', 'Manning', 'Pearson'];
  const layoutContainer = "w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12";

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
        const responseContent = !searchResult.ok
          ? `Search is currently unavailable. ${searchResult.error || 'Please check the backend and try again.'}`
          : searchResult.hits.length > 0
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
    if (!isReady) return;
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
  }, [isReady]);

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
        <div className="flex-1 flex flex-col min-h-0 pb-32">
          {!hasMessages ? (
            /* Empty state - Hero */
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={cn("w-full flex flex-col items-center space-y-12", layoutContainer)}>
                <div className="flex flex-col items-center text-center animate-fade-in space-y-12">
                  {/* Animated logo */}
                  <div className="relative h-20 w-20 mx-auto">
                    <div className="absolute inset-0 rounded-2xl gradient-sunset opacity-20 blur-xl animate-breathe" />
                    <div className="relative h-full w-full rounded-2xl gradient-warm flex items-center justify-center glow-primary">
                      <Sparkles className="h-9 w-9 text-white" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-display gradient-sunset-text">
                      Ask your library
                    </h1>
                    <p className="text-title text-muted-foreground max-w-xl mx-auto">
                      Get instant answers from O'Reilly, Manning, and Pearson technical books
                    </p>
                    <p className="text-body text-muted-foreground/80 max-w-xl mx-auto">
                      Trusted summaries, citations, and highlights from the sources you already rely on.
                    </p>
                  </div>
                </div>

                {/* Feature chips */}
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  {FEATURE_CHIPS.map((chip, i) => (
                    <div
                      key={chip.label}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full glass-panel",
                        "animate-gentle-float"
                      )}
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <chip.icon className={cn("h-4 w-4", chip.color)} />
                      <span className="text-caption text-foreground/80">{chip.label}</span>
                    </div>
                  ))}
                </div>

                {/* Suggested queries */}
                <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  {[
                    'What are React best practices?',
                    'Explain microservices architecture',
                    'How does Docker networking work?',
                  ].map((query) => (
                    <button
                      key={query}
                      onClick={() => handleSubmit(query)}
                      disabled={!isReady}
                      className={cn(
                        "px-4 py-2 rounded-xl text-caption",
                        "bg-secondary/50 hover:bg-secondary border border-border/30 hover:border-primary/30",
                        "transition-all duration-300 hover:scale-[1.02]",
                        !isReady && "cursor-not-allowed opacity-50 hover:scale-100"
                      )}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat messages */
            <ScrollArea className="flex-1">
              <div className={cn("py-12 space-y-12", layoutContainer)}>
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
          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/10 bg-background/80 backdrop-blur-xl">
            <div className={cn("py-4", layoutContainer)}>
              <ChatInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={!isReady}
                placeholder={
                  !isReady
                    ? "Search will be available when the engine is ready..."
                    : hasMessages
                      ? "Ask a follow-up..."
                      : "Ask about your technical library..."
                }
              />
            </div>
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
