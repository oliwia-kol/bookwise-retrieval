import { useState } from 'react';
import { ChevronDown, ChevronUp, Sliders } from 'lucide-react';
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
import type { SearchFilters, Publisher, SortOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availablePublishers: Publisher[];
  collapsed?: boolean;
}

const PUBLISHERS: { id: Publisher; label: string; color: string }[] = [
  { id: 'OReilly', label: "O'Reilly", color: 'bg-emerald-500' },
  { id: 'Manning', label: 'Manning', color: 'bg-rose-500' },
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
        <Sliders className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
        <Sliders className="h-3.5 w-3.5" />
        Filters
      </div>

      {/* Publishers */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-foreground/80">Publishers</h3>
        <div className="space-y-2">
          {PUBLISHERS.map((pub) => {
            const isAvailable = availablePublishers.includes(pub.id);
            const isSelected = filters.pubs.includes(pub.id);
            
            return (
              <label
                key={pub.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                  "hover:bg-primary/5",
                  isSelected && "bg-primary/10",
                  !isAvailable && "opacity-40 cursor-not-allowed"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => isAvailable && togglePublisher(pub.id)}
                  disabled={!isAvailable}
                  className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className={cn("w-2 h-2 rounded-full", pub.color)} />
                <span className="text-sm">{pub.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Search Mode */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-foreground/80">Search Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={filters.mode === 'quick' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('mode', 'quick')}
            className={cn(
              "w-full text-xs font-medium transition-all",
              filters.mode === 'quick' 
                ? "bg-primary text-primary-foreground" 
                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            Quick
          </Button>
          <Button
            variant={filters.mode === 'exact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('mode', 'exact')}
            className={cn(
              "w-full text-xs font-medium transition-all",
              filters.mode === 'exact' 
                ? "bg-primary text-primary-foreground" 
                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            Exact
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {filters.mode === 'quick' 
            ? 'Fast · Top 8 results' 
            : 'Thorough · Top 12 results'}
        </p>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-foreground/80">Sort By</h3>
        <Select 
          value={filters.sort} 
          onValueChange={(v) => updateFilter('sort', v as SortOption)}
        >
          <SelectTrigger className="h-9 text-xs border-border/50 bg-card/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass">
            <SelectItem value="Best evidence" className="text-xs">Best Evidence (J-Score)</SelectItem>
            <SelectItem value="Semantic" className="text-xs">Semantic (S-Score)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Options */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between text-xs text-muted-foreground hover:text-foreground hover:bg-primary/5 h-8"
          >
            Advanced
            {advancedOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-5 pt-4">
          {/* Min J-Score */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-foreground/80">Min J-Score</Label>
              <span className="text-xs text-primary font-mono">{filters.jmin.toFixed(2)}</span>
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

          {/* Judge Mode */}
          <div className="space-y-3">
            <Label className="text-xs text-foreground/80">Judge Mode</Label>
            <Select 
              value={filters.judge_mode} 
              onValueChange={(v) => updateFilter('judge_mode', v as 'real' | 'proxy' | 'off')}
            >
              <SelectTrigger className="h-9 text-xs border-border/50 bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="real" className="text-xs">Real (LLM Judge)</SelectItem>
                <SelectItem value="proxy" className="text-xs">Proxy (Fast)</SelectItem>
                <SelectItem value="off" className="text-xs">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Near-Miss Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <Label className="text-xs text-foreground/80">Show Near-Miss</Label>
            <Switch
              checked={filters.show_near_miss}
              onCheckedChange={(v) => updateFilter('show_near_miss', v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
