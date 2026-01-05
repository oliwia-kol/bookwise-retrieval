import { Download, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { EvidenceHit } from '@/lib/types';
import { exportAsCSV, exportAsJSON, exportAsBibTeX, downloadFile } from '@/lib/export';

interface ExportDropdownProps {
  hits: EvidenceHit[];
  query: string;
}

export function ExportDropdown({ hits, query }: ExportDropdownProps) {
  const handleExport = (format: 'csv' | 'json' | 'bibtex') => {
    const filename = `rag-search-${query.slice(0, 20).replace(/\s+/g, '-')}-${Date.now()}`;
    
    switch (format) {
      case 'csv':
        downloadFile(exportAsCSV(hits), `${filename}.csv`, 'text/csv');
        break;
      case 'json':
        downloadFile(exportAsJSON(hits), `${filename}.json`, 'application/json');
        break;
      case 'bibtex':
        downloadFile(exportAsBibTeX(hits), `${filename}.bib`, 'application/x-bibtex');
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 gap-1.5"
          disabled={hits.length === 0}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass border-border/30">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          className="gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('json')}
          className="gap-2 cursor-pointer"
        >
          <FileJson className="h-4 w-4 text-primary" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('bibtex')}
          className="gap-2 cursor-pointer"
        >
          <FileText className="h-4 w-4 text-purple-400" />
          Export as BibTeX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
