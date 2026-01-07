import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  { category: 'Navigation', items: [
    { key: '/', description: 'Focus search' },
    { key: '?', description: 'Show shortcuts' },
  ]},
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-title text-foreground">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {SHORTCUTS.map(({ category, items }) => (
            <div key={category}>
              <h3 className="text-caption text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map(({ key, description }) => (
                  <div 
                    key={key} 
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-body text-foreground/80">{description}</span>
                    <kbd className="px-2 py-1 text-caption font-mono rounded bg-background border border-border/50 text-primary">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
