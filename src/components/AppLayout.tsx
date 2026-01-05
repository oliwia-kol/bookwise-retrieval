import { useState, useCallback } from 'react';
import { AppHeader } from './AppHeader';
import { SearchBar } from './SearchBar';
import { FilterSidebar } from './FilterSidebar';
import { EvidenceList } from './EvidenceList';
import { ContextPanel } from './ContextPanel';
import { StatusStrip } from './StatusStrip';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { AuroraBackground } from './effects/AuroraBackground';
import { CursorSpotlight } from './effects/CursorSpotlight';
import { useSearch, useHealth } from '@/hooks/useSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import type { SearchFilters, EvidenceHit, Publisher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [selectedHit, setSelectedHit] = useState<EvidenceHit | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

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

  const handleSelectHit = useCallback((hit: EvidenceHit) => {
    setSelectedHit(hit);
    setContextOpen(true);
  }, []);

  const handlePinToggle = useCallback((id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const pinnedHits = searchResult?.hits.filter(h => pinnedIds.has(h.id)) || [];

  // Keyboard shortcuts
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts({
    hits: searchResult?.hits || [],
    selectedHit,
    onSelectHit: handleSelectHit,
    onPinHit: handlePinToggle,
    onClearSelection: () => setSelectedHit(null),
  });

  const hasContextContent = selectedHit || pinnedHits.length > 0;

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Living Aurora Background */}
      <AuroraBackground 
        intensity="subtle" 
        isSearching={isLoading}
      />
      
      {/* Cursor Spotlight Effect */}
      <CursorSpotlight intensity="subtle" />
      
      {/* Main content - above aurora */}
      <div className="relative z-10 h-full flex flex-col">
        <AppHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onToggleDebug={() => setShowDebug(!showDebug)}
          showDebug={showDebug}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <aside 
            className={cn(
              "hidden lg:block border-r border-border/10 bg-background/50 backdrop-blur-xl transition-all duration-400 overflow-y-auto shrink-0",
              sidebarOpen ? "w-64" : "w-0"
            )}
          >
            {sidebarOpen && (
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                availablePublishers={availablePublishers}
              />
            )}
          </aside>

          {/* Mobile Sidebar Sheet */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-72 p-0 lg:hidden bg-background/95 backdrop-blur-xl border-border/20">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                availablePublishers={availablePublishers}
              />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 lg:p-8 space-y-4 border-b border-border/10 bg-background/30 backdrop-blur-sm">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                recentQueries={recentQueries}
              />
              {searchResult && (
                <StatusStrip
                  meta={searchResult.meta}
                  hitCount={searchResult.hits.length}
                  coverage={searchResult.coverage}
                  confidence={searchResult.confidence}
                  isLoading={isLoading}
                  hits={searchResult.hits}
                  query={submittedQuery}
                />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-8">
              <EvidenceList
                hits={searchResult?.hits || []}
                nearMiss={searchResult?.near_miss}
                isLoading={isLoading}
                selectedId={selectedHit?.id}
                onSelect={handleSelectHit}
                pinnedIds={pinnedIds}
                onPin={handlePinToggle}
              />
            </div>
          </main>

          {/* Desktop Context Panel */}
          <aside 
            className={cn(
              "hidden lg:block border-l border-border/10 bg-background/50 backdrop-blur-xl transition-all duration-400 overflow-hidden shrink-0",
              contextOpen && hasContextContent ? "w-80" : "w-0"
            )}
          >
            <ContextPanel
              hit={selectedHit}
              onClose={() => setSelectedHit(null)}
              pinnedHits={pinnedHits}
              onUnpin={handlePinToggle}
            />
          </aside>

          {/* Mobile Context Drawer */}
          <Drawer open={!!(contextOpen && hasContextContent)} onOpenChange={(open) => { if (!open) setContextOpen(false); }}>
            <DrawerContent className="lg:hidden max-h-[85vh] bg-background/95 backdrop-blur-xl border-border/20">
              <div className="overflow-y-auto">
                <ContextPanel
                  hit={selectedHit}
                  onClose={() => {
                    setSelectedHit(null);
                    setContextOpen(false);
                  }}
                  pinnedHits={pinnedHits}
                  onUnpin={handlePinToggle}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
    </div>
  );
}
