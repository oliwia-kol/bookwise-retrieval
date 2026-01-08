// RAG Search Types

export type Publisher = 'OReilly' | 'Manning' | 'Pearson';
export type SearchMode = 'quick' | 'exact';
export type SortOption = 'Best evidence' | 'Semantic';
export type JudgeTier = 'Strong' | 'Solid' | 'Weak' | 'Poor';
export type JudgeMode = 'real' | 'proxy' | 'off';
export type ConversationMode = 'search' | 'chat';

export interface SearchFilters {
  pubs: Publisher[];
  mode: SearchMode;
  sort: SortOption;
  jmin: number;
  judge_mode: JudgeMode;
  show_near_miss: boolean;
}

export interface EvidenceHit {
  id: string;
  title: string;
  section: string;
  snippet: string;
  full_text: string;
  publisher: Publisher;
  book: string;
  judge01: number;
  sem_score_n: number;
  lex_score_n: number;
  tier: JudgeTier;
  chunk_idx: number;
}

export interface ModeConfig {
  name: SearchMode;
  final_k: number;
  mmr_k: number;
  dense_k: number;
  lex_k: number;
}

export interface TimingMeta {
  total: number;
  embed: number;
  retrieve: number;
  judge: number;
}

export interface CountMeta {
  dense_hits: number;
  lex_hits: number;
  fused: number;
  after_judge: number;
}

export interface SearchMeta {
  mode_cfg: ModeConfig;
  t: TimingMeta;
  n: CountMeta;
}

export interface SearchResponse {
  ok: boolean;
  query: string;
  hits: EvidenceHit[];
  near_miss: EvidenceHit[];
  coverage: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  answer: string | null;
  no_evidence: boolean;
  meta: SearchMeta;
  error?: string;
}

export interface HealthResponse {
  ok: boolean;
  corpus_count: number;
  publishers: Publisher[];
  engine_version: string;
  engine_available: boolean;
  corpora_ok: boolean;
  ready: boolean;
  error?: string;
}

export interface ChatResponse {
  ok: boolean;
  answer: string;
  sources: EvidenceHit[];
  error?: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  evidence?: EvidenceHit[];
  timestamp: Date;
  isLoading?: boolean;
}
