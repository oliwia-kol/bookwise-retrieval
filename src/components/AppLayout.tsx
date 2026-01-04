import { useState, useCallback, useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { SearchBar } from './SearchBar';
import { FilterSidebar } from './FilterSidebar';
import { EvidenceList } from './EvidenceList';
import { ContextPanel } from './ContextPanel';
import { StatusStrip } from './StatusStrip';
import { useSearch, useHealth } from '@/hooks/useSearch';
import type { SearchFilters, EvidenceHit, Publisher } from '@/lib/types';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS: SearchFilters = {
  pubs: [],
  mode: 'quick',
  sort: 'Best evidence',
  jmin: 0.45,
  judge_mode: 'real',
  show_near_miss: true,
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [selectedHit, setSelectedHit] = useState<EvidenceHit | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedHit(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "border-r border-border/50 bg-sidebar transition-all duration-300 overflow-y-auto shrink-0",
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

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="p-4 sm:p-6 space-y-4 border-b border-border/50">
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
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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

        {/* Context Panel */}
        <aside 
          className={cn(
            "border-l border-border/50 bg-card/50 transition-all duration-300 overflow-hidden shrink-0",
            contextOpen && (selectedHit || pinnedHits.length > 0) ? "w-80" : "w-0"
          )}
        >
          <ContextPanel
            hit={selectedHit}
            onClose={() => setSelectedHit(null)}
            pinnedHits={pinnedHits}
            onUnpin={handlePinToggle}
          />
        </aside>
      </div>
    </div>
  );
}
