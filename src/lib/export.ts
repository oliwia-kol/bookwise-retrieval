import type { EvidenceHit } from './types';

export function exportAsCSV(hits: EvidenceHit[]): string {
  const headers = ['Title', 'Section', 'Publisher', 'Book', 'Tier', 'J-Score', 'S-Score', 'L-Score', 'Snippet'];
  const rows = hits.map(hit => [
    `"${hit.title.replace(/"/g, '""')}"`,
    `"${hit.section.replace(/"/g, '""')}"`,
    hit.publisher,
    `"${hit.book.replace(/"/g, '""')}"`,
    hit.tier,
    hit.j_score.toFixed(3),
    hit.s_score.toFixed(3),
    hit.l_score.toFixed(3),
    `"${hit.snippet.replace(/"/g, '""')}"`,
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function exportAsJSON(hits: EvidenceHit[]): string {
  return JSON.stringify(hits, null, 2);
}

export function exportAsBibTeX(hits: EvidenceHit[]): string {
  return hits.map((hit, i) => {
    const key = `${hit.publisher.toLowerCase()}${hit.chunk_idx || i}`;
    return `@book{${key},
  title = {${hit.title}},
  author = {${hit.publisher}},
  chapter = {${hit.section}},
  note = {${hit.tier} evidence, J-score: ${hit.j_score.toFixed(3)}},
  abstract = {${hit.snippet.slice(0, 200)}...}
}`;
  }).join('\n\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
