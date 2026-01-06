import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SearchFilters, Publisher, SortOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availablePublishers: Publisher[];
}

const PUBLISHERS: { id: Publisher; label: string; color: string }[] = [
  { id: 'OReilly', label: "O'Reilly", color: 'bg-[hsl(24_95%_53%)]' },
  { id: 'Manning', label: 'Manning', color: 'bg-[hsl(350_89%_60%)]' },
  { id: 'Pearson', label: 'Pearson', color: 'bg-[hsl(262_83%_58%)]' },
];

export function SettingsModal({ 
  open, 
  onOpenChange,
  filters, 
  onFiltersChange, 
  availablePublishers 
}: SettingsModalProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-border/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-title">
            <div className="h-8 w-8 rounded-lg gradient-warm flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            Search Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Publishers */}
          <div className="space-y-3">
            <Label className="text-caption">Publishers</Label>
            <div className="space-y-2">
              {PUBLISHERS.map((pub) => {
                const isAvailable = availablePublishers.includes(pub.id);
                const isSelected = filters.pubs.includes(pub.id);
                
                return (
                  <label
                    key={pub.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300",
                      "hover:bg-secondary/50",
                      isSelected && "bg-primary/10 border border-primary/30",
                      !isAvailable && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => isAvailable && togglePublisher(pub.id)}
                      disabled={!isAvailable}
                      className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className={cn("w-2.5 h-2.5 rounded-full", pub.color)} />
                    <span className="text-body">{pub.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Search Mode */}
          <div className="space-y-3">
            <Label className="text-caption">Search Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={filters.mode === 'quick' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('mode', 'quick')}
                className={cn(
                  "w-full text-caption transition-all duration-300",
                  filters.mode === 'quick' 
                    ? "btn-primary-vibrant" 
                    : "border-border/30 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                Quick
              </Button>
              <Button
                variant={filters.mode === 'exact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('mode', 'exact')}
                className={cn(
                  "w-full text-caption transition-all duration-300",
                  filters.mode === 'exact' 
                    ? "btn-primary-vibrant" 
                    : "border-border/30 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                Thorough
              </Button>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <Label className="text-caption">Sort Results</Label>
            <Select 
              value={filters.sort} 
              onValueChange={(v) => updateFilter('sort', v as SortOption)}
            >
              <SelectTrigger className="h-10 text-body border-border/30 bg-card/80 hover:border-primary/50 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/30">
                <SelectItem value="Best evidence" className="text-body">Best Match</SelectItem>
                <SelectItem value="Semantic" className="text-body">Semantic Similarity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-caption">Minimum Quality</Label>
              <span className="text-caption text-primary font-mono">{(filters.jmin * 100).toFixed(0)}%</span>
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

          {/* Near-Miss Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/20">
            <Label className="text-caption">Show related results</Label>
            <Switch
              checked={filters.show_near_miss}
              onCheckedChange={(v) => updateFilter('show_near_miss', v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
