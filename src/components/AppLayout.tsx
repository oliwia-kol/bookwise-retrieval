import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, BookOpen, Zap, Library, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { SettingsModal } from './SettingsModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { LivingBackground } from './effects/LivingBackground';
import { CursorSpotlight } from './effects/CursorSpotlight';
import { Button } from '@/components/ui/button';
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

const SUGGESTED_QUERIES = [
  'What are React best practices?',
  'Explain microservices architecture',
  'How does Docker networking work?',
];

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchFailure, setSearchFailure] = useState<{ title: string; description: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isDark, toggleTheme } = useTheme();
  const { data: health } = useHealth();
  const isReady = Boolean(health?.ready);
  const { data: searchResult, isLoading } = useSearch(currentQuery, filters, isReady);

  const availablePublishers: Publisher[] = health?.publishers || ['OReilly', 'Manning', 'Pearson'];
  const layoutContainer = "w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12";

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

        if (!searchResult.ok) {
          return withoutLoading;
        }

        const hits = searchResult.hits ?? [];
        const sourceCount = hits.length;
        const topHits = hits.slice(0, 3);
        const answer = typeof searchResult.answer === 'string' ? searchResult.answer.trim() : '';
        const hasNoEvidence = Boolean(searchResult.no_evidence) || searchResult.coverage === 'LOW';

        const responseContent = [
          `Answer`,
          hasNoEvidence
            ? 'Abstain — no direct evidence to answer confidently.'
            : (answer || (sourceCount > 0
              ? 'Here are the most relevant passages I found in your library.'
              : "I don't know based on the current sources. Try rephrasing or choosing a different topic.")),
          ``,
          `Sources (${sourceCount})`,
          sourceCount > 0
            ? topHits.map((hit, i) => (
                `${i + 1}. ${hit.title} — ${hit.publisher}${hit.section ? ` · ${hit.section}` : ''}\n   ${hit.snippet}`
              )).join('\n\n')
            : 'No sources matched this query.',
          ``,
          `Quality`,
          `Coverage: ${searchResult.coverage ?? 'Unknown'} · Confidence: ${(searchResult.confidence ?? 0).toFixed(2)}`,
        ].join('\n');

        return [...withoutLoading, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          evidence: searchResult.hits,
          timestamp: new Date(),
        }];
      });
      if (!searchResult.ok) {
        setSearchFailure({
          title: 'Search is temporarily unavailable',
          description: searchResult.error || 'Please confirm the backend is running and try again.',
        });
      } else {
        setSearchFailure(null);
      }
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
    setSearchFailure(null);
  }, [isReady]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentQuery('');
    processedQueryRef.current = null;
    setSearchFailure(null);
  }, []);

  // Keyboard shortcuts
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Living Background */}
      <LivingBackground isActive={isLoading || hasMessages} className="opacity-90" />
      
      {/* Cursor Spotlight Effect */}
      <CursorSpotlight intensity="subtle" size={320} className="opacity-70" />
      
      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[hsl(var(--brand-gold)/0.18)] via-transparent to-transparent" />
        <AppHeader 
          onOpenSettings={() => setSettingsOpen(true)}
          onNewChat={hasMessages ? handleNewChat : undefined}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 pb-24 sm:pb-32">
          {!hasMessages ? (
            /* Empty state - Hero */
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={cn("w-full flex flex-col items-center", layoutContainer)}>
                <div className="w-full max-w-4xl animate-fade-in motion-reduce:animate-none">
                  <div className="relative overflow-hidden rounded-[26px] sm:rounded-[32px] bg-background/65 px-4 py-8 text-center shadow-[0_30px_80px_rgba(12,10,24,0.35)] backdrop-blur-2xl sm:px-12 sm:py-16">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
                    <div className="relative flex flex-col items-center gap-8 sm:gap-10">
                      {/* Animated logo */}
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 mx-auto">
                        <div className="absolute inset-0 rounded-2xl gradient-sunset opacity-25 blur-2xl animate-breathe motion-reduce:animate-none" />
                        <div className="relative h-full w-full rounded-2xl gradient-warm flex items-center justify-center glow-primary">
                          <Sparkles className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
                        </div>
                      </div>

                      <div className="space-y-4 sm:space-y-5">
                        <h1 className="text-3xl sm:text-display gradient-sunset-text">
                          Ask your library
                        </h1>
                        <p className="text-base sm:text-title text-muted-foreground max-w-2xl mx-auto">
                          Get instant answers from O'Reilly, Manning, and Pearson technical books
                        </p>
                        <p className="text-sm sm:text-body text-muted-foreground/80 max-w-2xl mx-auto">
                          Trusted summaries, citations, and highlights from the sources you already rely on.
                        </p>
                      </div>

                      {/* Feature chips */}
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {FEATURE_CHIPS.map((chip, i) => (
                          <div
                            key={chip.label}
                            className={cn(
                              "flex items-center gap-3 rounded-full border border-white/10",
                              "bg-background/60 px-4 py-2.5 w-full sm:w-auto sm:min-w-[150px] justify-center",
                              "shadow-[0_10px_25px_rgba(12,10,24,0.15)]",
                              "animate-gentle-float motion-reduce:animate-none"
                            )}
                            style={{ animationDelay: `${i * 200}ms` }}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 border border-white/10">
                              <chip.icon className={cn("h-4 w-4", chip.color)} />
                            </div>
                            <span className="text-caption text-foreground/80">{chip.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action row */}
                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <Button
                          onClick={() => handleSubmit(SUGGESTED_QUERIES[0])}
                          disabled={!isReady}
                          variant="cta"
                          className={cn(
                            "gap-2 rounded-full px-6 py-3 text-sm",
                            "shadow-lg shadow-primary/30",
                            "hover:-translate-y-0.5 hover:shadow-xl",
                            "transition-all duration-200 motion-reduce:transition-none motion-reduce:transform-none",
                            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                          )}
                        >
                          <BookOpen className="h-4 w-4" />
                          Try a suggested query
                        </Button>

                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
                          {SUGGESTED_QUERIES.map((query) => (
                            <button
                              key={query}
                              onClick={() => handleSubmit(query)}
                              disabled={!isReady}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-xs sm:text-caption w-full sm:w-auto",
                                "bg-secondary/50 hover:bg-secondary border border-border/30 hover:border-primary/30",
                                "transition-all duration-200 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none",
                                !isReady && "cursor-not-allowed opacity-50 hover:scale-100"
                              )}
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat messages */
            <ScrollArea className="flex-1">
              <div className={cn("py-8 sm:py-12 space-y-6 sm:space-y-12", layoutContainer)}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}
                {searchFailure && (
                  <div className="animate-fade-in motion-reduce:animate-none">
                    <div className="relative overflow-hidden rounded-[24px] border border-border/30 bg-background/70 p-5 sm:p-7 shadow-[0_20px_50px_rgba(12,10,24,0.25)] backdrop-blur-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/70 border border-border/40">
                          <AlertTriangle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-title text-foreground">{searchFailure.title}</h3>
                          <p className="text-sm sm:text-body text-muted-foreground">
                            {searchFailure.description}
                          </p>
                          <p className="text-xs sm:text-caption text-muted-foreground/70">
                            Keep this tab open and try again in a moment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input area */}
          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/10 bg-background/80 backdrop-blur-xl">
            <div className={cn("py-3 sm:py-4", layoutContainer)}>
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
