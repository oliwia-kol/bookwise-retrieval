import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, BookOpen, Zap, Library, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { ChatUnavailable } from './chat/ChatUnavailable';
import { SettingsModal } from './SettingsModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { LivingBackground } from './effects/LivingBackground';
import { CursorSpotlight } from './effects/CursorSpotlight';
import { SearchResponse } from './search/SearchResponse';
import { Button } from '@/components/ui/button';
import { useSearch, useHealth } from '@/hooks/useSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import type { SearchFilters, ChatMessage as ChatMessageType, Publisher, ConversationMode, EvidenceHit, SearchResponse as SearchResponseType } from '@/lib/types';
import { chatAPI } from '@/lib/api';
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
  const [searchResponse, setSearchResponse] = useState<SearchResponseType | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [requestFailure, setRequestFailure] = useState<{ title: string; description: string } | null>(null);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('search');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isDark, toggleTheme } = useTheme();
  const { data: health } = useHealth();
  const isBackendReady = Boolean(health?.ready);
  const isBackendOnline = Boolean(health?.engine_available ?? health?.ok);
  const isSearchMode = conversationMode === 'search';
  const { data: searchResult, isLoading: isSearchLoading } = useSearch(currentQuery, filters, isSearchMode);
  const isLoading = isSearchLoading || isChatLoading;

  const availablePublishers: Publisher[] = health?.publishers || ['OReilly', 'Manning', 'Pearson'];
  const layoutContainer = "w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle search result - use ref to track processed queries
  const processedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSearchMode) return;
    if (searchResult && currentQuery && currentQuery !== processedQueryRef.current) {
      processedQueryRef.current = currentQuery;
      
      if (!searchResult.ok) {
        setRequestFailure({
          title: 'Search is temporarily unavailable',
          description: searchResult.error || 'Please confirm the backend is running and try again.',
        });
      } else {
        setRequestFailure(null);
        setSearchResponse(searchResult);
        setLastSearchQuery(currentQuery);
      }
      setCurrentQuery('');
    }
  }, [searchResult, currentQuery, isSearchMode]);

  const buildSourcesSummary = useCallback((sources: EvidenceHit[]) => {
    if (!sources.length) return 'No sources matched this query.';
    return sources.slice(0, 3).map((hit, i) => (
      `${i + 1}. ${hit.title} — ${hit.publisher}${hit.section ? ` · ${hit.section}` : ''}\n   ${hit.snippet}`
    )).join('\n\n');
  }, []);

  const handleSubmit = useCallback(async (message: string) => {
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
    setRequestFailure(null);

    if (isSearchMode) {
      setCurrentQuery(message);
      return;
    }

    setIsChatLoading(true);
    try {
      const result = await chatAPI(message, true);
      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isLoading);
        if (!result.ok) {
          return withoutLoading;
        }
        const sources = result.sources ?? [];
        const responseContent = [
          result.answer || 'No response generated.',
          ``,
          `Sources (${sources.length})`,
          buildSourcesSummary(sources),
        ].join('\n');

        return [...withoutLoading, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          evidence: sources,
          timestamp: new Date(),
        }];
      });
      if (!result.ok) {
        setRequestFailure({
          title: 'Chat is temporarily unavailable',
          description: result.error || 'Please confirm the backend is running and try again.',
        });
      }
    } finally {
      setIsChatLoading(false);
    }
  }, [buildSourcesSummary, isSearchMode]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentQuery('');
    setSearchResponse(null);
    setLastSearchQuery('');
    processedQueryRef.current = null;
    setRequestFailure(null);
  }, []);

  // Keyboard shortcuts
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  const hasMessages = messages.length > 0;
  const hasSearchResults = !!searchResponse;
  const hasContent = isSearchMode ? hasSearchResults : hasMessages;
  const modeOptions: { id: ConversationMode; label: string; description: string }[] = [
    { id: 'search', label: 'Search', description: 'RAG only' },
    { id: 'chat', label: 'Chat', description: 'LLM + RAG' },
  ];
  const handleModeChange = useCallback((mode: ConversationMode) => {
    setConversationMode(mode);
    setCurrentQuery('');
    processedQueryRef.current = null;
    setRequestFailure(null);
  }, []);

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
          onNewChat={hasContent ? handleNewChat : undefined}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 pb-24 sm:pb-32">
          {!hasContent ? (
            /* Empty state - Hero */
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={cn("w-full flex flex-col items-center", layoutContainer)}>
                {/* Show ChatUnavailable banner in chat mode */}
                {!isSearchMode && (
                  <div className="w-full max-w-2xl mb-6">
                    <ChatUnavailable onSwitchToSearch={() => handleModeChange('search')} />
                  </div>
                )}
                
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
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-xs sm:text-caption w-full sm:w-auto",
                                "bg-secondary/50 hover:bg-secondary border border-border/30 hover:border-primary/30",
                                "transition-all duration-200 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none",
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
          ) : isSearchMode ? (
            /* Search Results Display */
            <ScrollArea className="flex-1">
              <div className={cn("py-8 sm:py-12", layoutContainer)}>
                {/* Query header */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Search query</p>
                  <h2 className="text-lg font-semibold text-foreground">{lastSearchQuery}</h2>
                </div>
                
                {/* Loading state */}
                {isSearchLoading ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border/40 bg-card/70 p-5">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-muted/50 animate-pulse" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 w-3/4 rounded bg-muted/50 animate-pulse" />
                          <div className="h-3 w-full rounded bg-muted/40 animate-pulse" />
                          <div className="h-3 w-2/3 rounded bg-muted/40 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-2xl border border-border/40 bg-card/60 p-4">
                          <div className="space-y-3">
                            <div className="h-3 w-1/2 rounded bg-muted/50 animate-pulse" />
                            <div className="h-2 w-3/4 rounded bg-muted/40 animate-pulse" />
                            <div className="h-2 w-full rounded bg-muted/30 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchResponse ? (
                  <SearchResponse response={searchResponse} query={lastSearchQuery} />
                ) : null}
                
                {requestFailure && (
                  <div className="animate-fade-in motion-reduce:animate-none mt-6">
                    <div className="relative overflow-hidden rounded-[24px] border border-border/30 bg-background/70 p-5 sm:p-7 shadow-[0_20px_50px_rgba(12,10,24,0.25)] backdrop-blur-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/70 border border-border/40">
                          <AlertTriangle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-title text-foreground">{requestFailure.title}</h3>
                          <p className="text-sm sm:text-body text-muted-foreground">
                            {requestFailure.description}
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
                {requestFailure && (
                  <div className="animate-fade-in motion-reduce:animate-none">
                    <div className="relative overflow-hidden rounded-[24px] border border-border/30 bg-background/70 p-5 sm:p-7 shadow-[0_20px_50px_rgba(12,10,24,0.25)] backdrop-blur-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/70 border border-border/40">
                          <AlertTriangle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-title text-foreground">{requestFailure.title}</h3>
                          <p className="text-sm sm:text-body text-muted-foreground">
                            {requestFailure.description}
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isBackendOnline ? (isBackendReady ? "bg-emerald-400" : "bg-amber-400") : "bg-rose-400"
                    )}
                  />
                  <span>
                    {isBackendOnline
                      ? (isBackendReady ? "Engine online" : "Engine online — corpus warming up.")
                      : "Engine offline — we'll still try your request."}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {modeOptions.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      size="sm"
                      variant={conversationMode === option.id ? "secondary" : "ghost"}
                      onClick={() => handleModeChange(option.id)}
                      className={cn(
                        "h-8 rounded-full px-3 text-xs",
                        conversationMode === option.id && "bg-secondary/80 text-foreground"
                      )}
                    >
                      <span>{option.label}</span>
                      <span className="text-[10px] text-muted-foreground/70">{option.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <ChatInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
                placeholder={
                  !isBackendReady
                    ? "Backend offline — we'll still try to answer..."
                    : isSearchMode
                      ? "Search your technical library..."
                      : "Chat with your technical library..."
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
