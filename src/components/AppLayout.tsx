import { useState, useCallback } from 'react';
import { AppHeader } from './AppHeader';
import { SearchBar } from './SearchBar';
import { EvidenceList } from './EvidenceList';
import { ContextPanel } from './ContextPanel';
import { StatusStrip } from './StatusStrip';
import { SettingsModal } from './SettingsModal';
import { FollowUpInput } from './FollowUpInput';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { LivingBackground } from './effects/LivingBackground';
import { CursorSpotlight } from './effects/CursorSpotlight';
import { useSearch, useHealth } from '@/hooks/useSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import type { SearchFilters, EvidenceHit, Publisher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

const DEFAULT_FILTERS: SearchFilters = {
  pubs: [],
  mode: 'quick',
  sort: 'Best evidence',
  jmin: 0.45,
  judge_mode: 'real',
  show_near_miss: true,
};

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [selectedHit, setSelectedHit] = useState<EvidenceHit | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  const { isDark, toggleTheme } = useTheme();
  const { data: health } = useHealth();
  const { data: searchResult, isLoading } = useSearch(submittedQuery, filters);

  const availablePublishers: Publisher[] = health?.publishers || ['OReilly', 'Manning', 'Pearson'];

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    setSubmittedQuery(query.trim());
    setRecentQueries(prev => {
      const filtered = prev.filter(q => q !== query.trim());
      return [query.trim(), ...filtered].slice(0, 10);
    });
  }, [query]);

  const handleFollowUp = useCallback((followUpQuery: string) => {
    setQuery(followUpQuery);
    setSubmittedQuery(followUpQuery);
    setRecentQueries(prev => {
      const filtered = prev.filter(q => q !== followUpQuery);
      return [followUpQuery, ...filtered].slice(0, 10);
    });
  }, []);

  const handleSelectHit = useCallback((hit: EvidenceHit) => {
    setSelectedHit(hit);
    setContextOpen(true);
  }, []);

  // Keyboard shortcuts
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts({
    hits: searchResult?.hits || [],
    selectedHit,
    onSelectHit: handleSelectHit,
    onPinHit: () => {},
    onClearSelection: () => setSelectedHit(null),
  });

  const hasResults = searchResult && searchResult.hits.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Living Background */}
      <LivingBackground isSearching={isLoading} />
      
      {/* Cursor Spotlight Effect */}
      <CursorSpotlight intensity="subtle" />
      
      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <AppHeader 
          onOpenSettings={() => setSettingsOpen(true)} 
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 flex flex-col px-4 sm:px-8 py-8">
          {/* Hero section with search */}
          <div className={cn(
            "flex flex-col items-center justify-center transition-all duration-500",
            hasResults ? "pt-4 pb-6" : "flex-1 pb-24"
          )}>
            {/* Title - only show when no results */}
            {!hasResults && (
              <div className="text-center mb-8 animate-fade-in">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 gradient-rainbow-text">
                  Ask your library anything
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Search across O'Reilly, Manning, and Pearson books
                </p>
              </div>
            )}

            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              recentQueries={recentQueries}
            />

            {/* Status strip */}
            <div className="mt-4">
              <StatusStrip
                meta={searchResult?.meta || null}
                hitCount={searchResult?.hits.length || 0}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Results */}
          {hasResults && (
            <div className="flex-1 max-w-4xl mx-auto w-full">
              <EvidenceList
                hits={searchResult.hits}
                nearMiss={searchResult.near_miss}
                isLoading={isLoading}
                selectedId={selectedHit?.id}
                onSelect={handleSelectHit}
                pinnedIds={new Set()}
                onPin={() => {}}
              />
              
              {/* Follow-up input */}
              <div className="mt-8 pb-8">
                <FollowUpInput 
                  onSubmit={handleFollowUp}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        filters={filters}
        onFiltersChange={setFilters}
        availablePublishers={availablePublishers}
      />

      {/* Mobile Context Drawer */}
      <Drawer open={contextOpen && !!selectedHit} onOpenChange={(open) => { if (!open) setContextOpen(false); }}>
        <DrawerContent className="max-h-[85vh] bg-background/95 backdrop-blur-xl border-border/20">
          <div className="overflow-y-auto">
            <ContextPanel
              hit={selectedHit}
              onClose={() => {
                setSelectedHit(null);
                setContextOpen(false);
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
    </div>
  );
}
