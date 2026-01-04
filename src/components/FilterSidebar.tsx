import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { SearchFilters, Publisher, SearchMode, SortOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availablePublishers: Publisher[];
  collapsed?: boolean;
}

const PUBLISHERS: { id: Publisher; label: string; color: string }[] = [
  { id: 'OReilly', label: "O'Reilly", color: 'bg-emerald-500' },
  { id: 'Manning', label: 'Manning', color: 'bg-red-500' },
  { id: 'Pearson', label: 'Pearson', color: 'bg-blue-500' },
];

export function FilterSidebar({ 
  filters, 
  onFiltersChange, 
  availablePublishers,
  collapsed = false 
}: FilterSidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const togglePublisher = (pub: Publisher) => {
    const newPubs = filters.pubs.includes(pub)
      ? filters.pubs.filter(p => p !== pub)
      : [...filters.pubs, pub];
    onFiltersChange({ ...filters, pubs: newPubs });
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-4">
        <Filter className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3">Publishers</h3>
        <div className="space-y-2">
          {PUBLISHERS.map((pub) => {
            const isAvailable = availablePublishers.includes(pub.id);
            const isSelected = filters.pubs.includes(pub.id);
            
            return (
              <label
                key={pub.id}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => isAvailable && togglePublisher(pub.id)}
                  disabled={!isAvailable}
                />
                <span className={cn("w-2 h-2 rounded-full", pub.color)} />
                <span className="text-sm">{pub.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">Search Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={filters.mode === 'quick' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('mode', 'quick')}
            className="w-full"
          >
            Quick
          </Button>
          <Button
            variant={filters.mode === 'exact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('mode', 'exact')}
            className="w-full"
          >
            Exact
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {filters.mode === 'quick' 
            ? 'Faster, top 8 results' 
            : 'Thorough, top 12 results'}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">Sort By</h3>
        <Select 
          value={filters.sort} 
          onValueChange={(v) => updateFilter('sort', v as SortOption)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Best evidence">Best Evidence (J-Score)</SelectItem>
            <SelectItem value="Semantic">Semantic (S-Score)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            Advanced Options
            {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Min J-Score</Label>
              <span className="text-sm text-muted-foreground">{filters.jmin.toFixed(2)}</span>
            </div>
            <Slider
              value={[filters.jmin]}
              onValueChange={([v]) => updateFilter('jmin', v)}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm">Judge Mode</Label>
            <Select 
              value={filters.judge_mode} 
              onValueChange={(v) => updateFilter('judge_mode', v as 'real' | 'proxy' | 'off')}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real">Real (LLM Judge)</SelectItem>
                <SelectItem value="proxy">Proxy (Fast)</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Near-Miss</Label>
            <Switch
              checked={filters.show_near_miss}
              onCheckedChange={(v) => updateFilter('show_near_miss', v)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
