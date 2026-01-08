import { cn } from '@/lib/utils';
import type { Publisher } from '@/lib/types';

interface PublisherBadgeProps {
  publisher: Publisher;
  size?: 'sm' | 'md';
}

const PUBLISHER_STYLES: Record<Publisher, { gradient: string; glow: string; text: string }> = {
  OReilly: {
    gradient: 'from-[hsl(15_65%_62%)] to-[hsl(25_70%_55%)]',
    glow: 'shadow-[0_0_12px_hsl(15_65%_62%/0.4)]',
    text: "O'Reilly",
  },
  Manning: {
    gradient: 'from-[hsl(255_55%_70%)] to-[hsl(265_60%_65%)]',
    glow: 'shadow-[0_0_12px_hsl(255_55%_70%/0.4)]',
    text: 'Manning',
  },
  Pearson: {
    gradient: 'from-[hsl(185_55%_55%)] to-[hsl(195_60%_50%)]',
    glow: 'shadow-[0_0_12px_hsl(185_55%_55%/0.4)]',
    text: 'Pearson',
  },
};

export function PublisherBadge({ publisher, size = 'sm' }: PublisherBadgeProps) {
  const style = PUBLISHER_STYLES[publisher] || PUBLISHER_STYLES.OReilly;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold text-white',
        'bg-gradient-to-r',
        style.gradient,
        style.glow,
        size === 'sm' && 'px-2.5 py-0.5 text-[10px]',
        size === 'md' && 'px-3 py-1 text-xs'
      )}
    >
      {style.text}
    </span>
  );
}
