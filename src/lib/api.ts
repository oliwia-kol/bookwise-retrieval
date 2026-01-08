import type { SearchFilters, SearchResponse, HealthResponse, EvidenceHit, Publisher, ChatResponse } from './types';
import { supabase } from '@/integrations/supabase/client';

let _cachedApiBase: string | null = null;

async function getApiBase(): Promise<string> {
  // Return cached value if available
  if (_cachedApiBase !== null) return _cachedApiBase;

  // Check env var first
  const configured = (import.meta.env.VITE_API_URL || '').trim();
  if (configured) {
    _cachedApiBase = configured.replace(/\/+$/, '');
    return _cachedApiBase;
  }

  // Try to fetch from database
  try {
    const { data, error } = await supabase
      .from('backend_config')
      .select('api_url')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data?.api_url) {
      _cachedApiBase = data.api_url.replace(/\/+$/, '');
      console.log('[API] Using backend URL from database:', _cachedApiBase);
      return _cachedApiBase;
    }
  } catch (err) {
    console.warn('[API] Failed to fetch backend config:', err);
  }

  // Fallback to localhost in dev
  if (import.meta.env.DEV) {
    _cachedApiBase = 'http://localhost:8000';
    return _cachedApiBase;
  }

  _cachedApiBase = '';
  return _cachedApiBase;
}

// Force refresh of cached API base (call when URL might have changed)
export function clearApiBaseCache() {
  _cachedApiBase = null;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCKS === 'true';

const buildApiUrl = async (path: string): Promise<string> => {
  const base = await getApiBase();
  if (!base) return path;
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
};

// Topic-based mock data for contextual responses
const MOCK_DATA: Record<string, EvidenceHit[]> = {
  rag: [
    {
      id: 'rag-1',
      title: 'Building RAG Systems',
      section: 'Chapter 3: Retrieval Strategies',
      snippet: 'Retrieval-augmented generation combines the strengths of retrieval systems with generative models, enabling more accurate and grounded responses...',
      full_text: 'Retrieval-augmented generation (RAG) combines the strengths of retrieval systems with generative models, enabling more accurate and grounded responses. The key insight is that by providing relevant context to an LLM, we can significantly improve the quality and factuality of generated text.\n\nThe retrieval component typically uses dense embeddings to find semantically similar documents, while the generation component synthesizes this information into coherent responses.',
      publisher: 'OReilly',
      book: 'Building LLM Applications',
      judge01: 0.87,
      sem_score_n: 0.72,
      lex_score_n: 0.65,
      tier: 'Strong',
      chunk_idx: 42,
    },
    {
      id: 'rag-2',
      title: 'RAG Architecture Patterns',
      section: 'Chapter 5: System Design',
      snippet: 'A well-designed RAG architecture separates concerns between retrieval, ranking, and generation phases for better maintainability...',
      full_text: 'A well-designed RAG architecture separates concerns between retrieval, ranking, and generation phases for better maintainability. Each component can be independently optimized and scaled based on workload requirements.',
      publisher: 'Manning',
      book: 'RAG in Production',
      judge01: 0.79,
      sem_score_n: 0.81,
      lex_score_n: 0.58,
      tier: 'Strong',
      chunk_idx: 89,
    },
    {
      id: 'rag-3',
      title: 'Chunking for RAG',
      section: 'Chapter 2: Document Processing',
      snippet: 'Effective chunking balances context preservation with retrieval granularity, using overlapping windows or semantic boundaries...',
      full_text: 'Effective chunking balances context preservation with retrieval granularity, using overlapping windows or semantic boundaries. Fixed-size chunks are simple but may split important context.',
      publisher: 'Pearson',
      book: 'Neural Information Retrieval',
      judge01: 0.71,
      sem_score_n: 0.68,
      lex_score_n: 0.52,
      tier: 'Solid',
      chunk_idx: 23,
    },
  ],
  llm: [
    {
      id: 'llm-1',
      title: 'Understanding Large Language Models',
      section: 'Chapter 1: Foundations',
      snippet: 'Large Language Models (LLMs) are neural networks trained on vast text corpora to predict the next token, enabling emergent capabilities like reasoning and instruction following...',
      full_text: 'Large Language Models (LLMs) are neural networks trained on vast text corpora to predict the next token, enabling emergent capabilities like reasoning and instruction following. The transformer architecture, with its self-attention mechanism, allows these models to capture long-range dependencies in text.',
      publisher: 'OReilly',
      book: 'Building LLM Applications',
      judge01: 0.91,
      sem_score_n: 0.88,
      lex_score_n: 0.75,
      tier: 'Strong',
      chunk_idx: 12,
    },
    {
      id: 'llm-2',
      title: 'LLM Training and Fine-tuning',
      section: 'Chapter 4: Customization',
      snippet: 'Fine-tuning allows adapting pre-trained LLMs to specific domains or tasks using smaller, curated datasets...',
      full_text: 'Fine-tuning allows adapting pre-trained LLMs to specific domains or tasks using smaller, curated datasets. Techniques like LoRA reduce computational requirements by updating only a subset of model parameters.',
      publisher: 'Manning',
      book: 'Practical LLM Engineering',
      judge01: 0.84,
      sem_score_n: 0.79,
      lex_score_n: 0.68,
      tier: 'Strong',
      chunk_idx: 67,
    },
    {
      id: 'llm-3',
      title: 'LLM Inference Optimization',
      section: 'Chapter 7: Performance',
      snippet: 'Inference optimization techniques like quantization, batching, and KV-cache enable cost-effective LLM deployment...',
      full_text: 'Inference optimization techniques like quantization, batching, and KV-cache enable cost-effective LLM deployment at scale. 8-bit and 4-bit quantization can reduce memory requirements significantly with minimal quality loss.',
      publisher: 'Pearson',
      book: 'Neural Information Retrieval',
      judge01: 0.73,
      sem_score_n: 0.71,
      lex_score_n: 0.55,
      tier: 'Solid',
      chunk_idx: 145,
    },
  ],
  docker: [
    {
      id: 'docker-1',
      title: 'Docker Fundamentals',
      section: 'Chapter 1: Containerization Basics',
      snippet: 'Docker containers package applications with their dependencies, ensuring consistent behavior across development, testing, and production environments...',
      full_text: 'Docker containers package applications with their dependencies, ensuring consistent behavior across development, testing, and production environments. Unlike virtual machines, containers share the host OS kernel, making them lightweight and fast to start.',
      publisher: 'OReilly',
      book: 'Docker Deep Dive',
      judge01: 0.89,
      sem_score_n: 0.85,
      lex_score_n: 0.72,
      tier: 'Strong',
      chunk_idx: 15,
    },
    {
      id: 'docker-2',
      title: 'Docker Compose for Multi-Container Apps',
      section: 'Chapter 5: Orchestration',
      snippet: 'Docker Compose defines multi-container applications in YAML files, simplifying development workflows with single-command deployments...',
      full_text: 'Docker Compose defines multi-container applications in YAML files, simplifying development workflows with single-command deployments. Services, networks, and volumes can all be configured declaratively.',
      publisher: 'Manning',
      book: 'Docker in Practice',
      judge01: 0.82,
      sem_score_n: 0.78,
      lex_score_n: 0.61,
      tier: 'Strong',
      chunk_idx: 98,
    },
    {
      id: 'docker-3',
      title: 'Docker Security Best Practices',
      section: 'Chapter 8: Production Deployment',
      snippet: 'Container security requires attention to image provenance, minimal base images, and proper secret management...',
      full_text: 'Container security requires attention to image provenance, minimal base images, and proper secret management. Running containers as non-root users and using read-only filesystems reduces attack surface.',
      publisher: 'Pearson',
      book: 'Cloud Native Security',
      judge01: 0.75,
      sem_score_n: 0.69,
      lex_score_n: 0.58,
      tier: 'Solid',
      chunk_idx: 201,
    },
  ],
  react: [
    {
      id: 'react-1',
      title: 'React Component Patterns',
      section: 'Chapter 3: Advanced Patterns',
      snippet: 'Modern React emphasizes functional components with hooks, enabling cleaner state management and side effect handling...',
      full_text: 'Modern React emphasizes functional components with hooks, enabling cleaner state management and side effect handling. Custom hooks allow extracting reusable logic while maintaining component simplicity.',
      publisher: 'OReilly',
      book: 'Learning React',
      judge01: 0.88,
      sem_score_n: 0.84,
      lex_score_n: 0.71,
      tier: 'Strong',
      chunk_idx: 56,
    },
    {
      id: 'react-2',
      title: 'React Performance Optimization',
      section: 'Chapter 6: Performance',
      snippet: 'React.memo, useMemo, and useCallback help prevent unnecessary re-renders by memoizing components and values...',
      full_text: 'React.memo, useMemo, and useCallback help prevent unnecessary re-renders by memoizing components and values. However, premature optimization should be avoided—measure first to identify actual bottlenecks.',
      publisher: 'Manning',
      book: 'React Quickly',
      judge01: 0.81,
      sem_score_n: 0.77,
      lex_score_n: 0.64,
      tier: 'Strong',
      chunk_idx: 123,
    },
    {
      id: 'react-3',
      title: 'State Management in React',
      section: 'Chapter 4: Managing Application State',
      snippet: 'For complex applications, state management solutions like Redux, Zustand, or React Query provide structured approaches to data flow...',
      full_text: 'For complex applications, state management solutions like Redux, Zustand, or React Query provide structured approaches to data flow. React Query excels at server state while Redux handles client state.',
      publisher: 'Pearson',
      book: 'Full Stack React',
      judge01: 0.74,
      sem_score_n: 0.72,
      lex_score_n: 0.55,
      tier: 'Solid',
      chunk_idx: 87,
    },
  ],
  microservices: [
    {
      id: 'micro-1',
      title: 'Microservices Architecture',
      section: 'Chapter 1: Introduction',
      snippet: 'Microservices decompose applications into small, independently deployable services that communicate via APIs...',
      full_text: 'Microservices decompose applications into small, independently deployable services that communicate via APIs. Each service owns its data and can be developed, deployed, and scaled independently.',
      publisher: 'OReilly',
      book: 'Building Microservices',
      judge01: 0.90,
      sem_score_n: 0.86,
      lex_score_n: 0.73,
      tier: 'Strong',
      chunk_idx: 8,
    },
    {
      id: 'micro-2',
      title: 'Service Communication Patterns',
      section: 'Chapter 4: Inter-service Communication',
      snippet: 'Synchronous REST/gRPC and asynchronous messaging each have tradeoffs in terms of coupling, latency, and reliability...',
      full_text: 'Synchronous REST/gRPC and asynchronous messaging each have tradeoffs in terms of coupling, latency, and reliability. Event-driven architectures using message queues enable loose coupling and better resilience.',
      publisher: 'Manning',
      book: 'Microservices Patterns',
      judge01: 0.83,
      sem_score_n: 0.80,
      lex_score_n: 0.67,
      tier: 'Strong',
      chunk_idx: 92,
    },
    {
      id: 'micro-3',
      title: 'Distributed Tracing',
      section: 'Chapter 7: Observability',
      snippet: 'Distributed tracing tools like Jaeger and Zipkin help visualize request flows across service boundaries...',
      full_text: 'Distributed tracing tools like Jaeger and Zipkin help visualize request flows across service boundaries, essential for debugging in microservices architectures. Correlation IDs propagated through headers enable end-to-end request tracking.',
      publisher: 'Pearson',
      book: 'Cloud Native Patterns',
      judge01: 0.72,
      sem_score_n: 0.68,
      lex_score_n: 0.54,
      tier: 'Solid',
      chunk_idx: 167,
    },
  ],
  default: [
    {
      id: 'default-1',
      title: 'Vector Search Fundamentals',
      section: 'Chapter 5: Embedding Models',
      snippet: 'Dense vector representations capture semantic meaning, allowing for similarity search that goes beyond keyword matching...',
      full_text: 'Dense vector representations capture semantic meaning, allowing for similarity search that goes beyond keyword matching. Modern embedding models can encode entire passages into fixed-size vectors that preserve semantic relationships.',
      publisher: 'Manning',
      book: 'Deep Learning for Search',
      judge01: 0.78,
      sem_score_n: 0.82,
      lex_score_n: 0.55,
      tier: 'Solid',
      chunk_idx: 128,
    },
    {
      id: 'default-2',
      title: 'Hybrid Search Architecture',
      section: 'Chapter 7: Combining Dense and Sparse',
      snippet: 'Hybrid search merges lexical and semantic approaches using reciprocal rank fusion to leverage the strengths of both methods...',
      full_text: 'Hybrid search merges lexical and semantic approaches using reciprocal rank fusion (RRF) to leverage the strengths of both methods. Lexical search excels at exact term matching while dense retrieval handles synonyms naturally.',
      publisher: 'OReilly',
      book: 'Search Engine Design',
      judge01: 0.73,
      sem_score_n: 0.75,
      lex_score_n: 0.62,
      tier: 'Solid',
      chunk_idx: 89,
    },
    {
      id: 'default-3',
      title: 'Reranking with Cross-Encoders',
      section: 'Chapter 4: Two-Stage Retrieval',
      snippet: 'Cross-encoder models provide more accurate relevance scoring by jointly encoding query and document pairs...',
      full_text: 'Cross-encoder models provide more accurate relevance scoring by jointly encoding query and document pairs. Unlike bi-encoders that encode independently, cross-encoders capture fine-grained interactions.',
      publisher: 'Pearson',
      book: 'Neural Information Retrieval',
      judge01: 0.65,
      sem_score_n: 0.68,
      lex_score_n: 0.48,
      tier: 'Weak',
      chunk_idx: 67,
    },
  ],
};

// Keywords to topic mapping
const TOPIC_KEYWORDS: Record<string, string[]> = {
  rag: ['rag', 'retrieval', 'augmented', 'generation', 'retrieval-augmented'],
  llm: ['llm', 'large language model', 'gpt', 'transformer', 'language model', 'chatgpt', 'claude', 'gemini', 'fine-tuning', 'fine tuning'],
  docker: ['docker', 'container', 'containerization', 'dockerfile', 'compose', 'kubernetes', 'k8s'],
  react: ['react', 'component', 'hook', 'usestate', 'useeffect', 'jsx', 'redux', 'frontend'],
  microservices: ['microservice', 'microservices', 'service mesh', 'api gateway', 'distributed', 'grpc'],
};

function detectTopic(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        return topic;
      }
    }
  }
  
  return 'default';
}

const MOCK_NEAR_MISS: EvidenceHit[] = [
  {
    id: 'nm-1',
    title: 'Query Expansion Techniques',
    section: 'Chapter 6: Query Processing',
    snippet: 'Query expansion improves recall by adding synonyms and related terms to the original query...',
    full_text: 'Query expansion improves recall by adding synonyms and related terms to the original query. This can be done using thesauri, word embeddings, or pseudo-relevance feedback.',
    publisher: 'OReilly',
    book: 'Search Engine Design',
    judge01: 0.42,
    sem_score_n: 0.48,
    lex_score_n: 0.35,
    tier: 'Poor',
    chunk_idx: 156,
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buildModeConfig = (filters: SearchFilters) => ({
  name: filters.mode,
  final_k: filters.mode === 'quick' ? 8 : 12,
  mmr_k: filters.mode === 'quick' ? 16 : 28,
  dense_k: filters.mode === 'quick' ? 24 : 40,
  lex_k: filters.mode === 'quick' ? 24 : 40,
});

const buildSearchMeta = (filters: SearchFilters) => ({
  mode_cfg: buildModeConfig(filters),
  t: {
    total: 0.45,
    embed: 0.02,
    retrieve: 0.31,
    judge: 0.12,
  },
  n: {
    dense_hits: 24,
    lex_hits: 18,
    fused: 32,
    after_judge: 0,
  },
});

const normalizeHealthResponse = (data: HealthResponse): HealthResponse => {
  const engineAvailable = data.engine_available ?? data.ok;
  const corporaOk = data.corpora_ok ?? data.corpus_count > 0;

  return {
    ...data,
    engine_available: engineAvailable,
    corpora_ok: corporaOk,
    ready: data.ready ?? (engineAvailable && corporaOk),
  };
};

export async function searchAPI(query: string, filters: SearchFilters): Promise<SearchResponse> {
  if (!USE_MOCK) {
    try {
      const url = await buildApiUrl('/search');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...filters }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('API request failed:', err);
      return {
        ok: false,
        query,
        hits: [],
        near_miss: [],
        coverage: 'LOW',
        confidence: 0,
        answer: null,
        no_evidence: true,
        meta: buildSearchMeta(filters),
        error: 'Unable to reach the search service.',
      };
    }
  }

  await delay(600);

  // Detect topic from query
  const topic = detectTopic(query);
  const topicHits = MOCK_DATA[topic] || MOCK_DATA.default;

  // Filter by publisher
  let filteredHits = topicHits.filter(hit => 
    filters.pubs.length === 0 || filters.pubs.includes(hit.publisher)
  );

  // Filter by jmin
  filteredHits = filteredHits.filter(hit => hit.judge01 >= filters.jmin);

  // Sort based on option
  if (filters.sort === 'Semantic') {
    filteredHits.sort((a, b) => b.sem_score_n - a.sem_score_n);
  } else {
    filteredHits.sort((a, b) => b.judge01 - a.judge01);
  }

  // Adjust results based on mode
  const limit = filters.mode === 'quick' ? 3 : 5;
  filteredHits = filteredHits.slice(0, limit);

  const baseMeta = buildSearchMeta(filters);

  return {
    ok: true,
    query,
    hits: filteredHits,
    near_miss: filters.show_near_miss ? MOCK_NEAR_MISS : [],
    coverage: filteredHits.length >= 3 ? 'HIGH' : filteredHits.length >= 1 ? 'MEDIUM' : 'LOW',
    confidence: filteredHits.length > 0 ? filteredHits[0].judge01 : 0,
    answer: null,
    no_evidence: filteredHits.length === 0,
    meta: {
      ...baseMeta,
      n: {
        ...baseMeta.n,
        after_judge: filteredHits.length,
      },
    },
  };
}

export async function chatAPI(message: string, use_llm = false): Promise<ChatResponse> {
  if (!USE_MOCK) {
    try {
      const url = await buildApiUrl('/chat');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: [], use_llm }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('Chat request failed:', err);
      return {
        ok: false,
        answer: '',
        sources: [],
        error: 'Unable to reach the chat service.',
      };
    }
  }

  await delay(600);

  const topic = detectTopic(message);
  const topicHits = MOCK_DATA[topic] || MOCK_DATA.default;
  const sources = topicHits.slice(0, 3);

  return {
    ok: true,
    answer: sources.length
      ? `Here is a grounded summary based on ${sources.length} passages from your library.`
      : 'No relevant passages found.',
    sources,
  };
}

export async function fetchHealth(): Promise<HealthResponse> {
  if (!USE_MOCK) {
    try {
      const url = await buildApiUrl('/health');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return normalizeHealthResponse(data);
    } catch (err) {
      console.error('Health check failed:', err);
      return normalizeHealthResponse({
        ok: false,
        corpus_count: 0,
        publishers: [],
        engine_version: 'unavailable',
        engine_available: false,
        corpora_ok: false,
        ready: false,
        error: 'Health check failed.',
      });
    }
  }

  await delay(200);

  return normalizeHealthResponse({
    ok: true,
    corpus_count: 3,
    publishers: ['OReilly', 'Manning', 'Pearson'] as Publisher[],
    engine_version: '1.0.0',
    engine_available: true,
    corpora_ok: true,
    ready: true,
  });
}

export { getApiBase };
