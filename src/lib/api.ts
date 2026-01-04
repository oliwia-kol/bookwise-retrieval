import type { SearchFilters, SearchResponse, HealthResponse, EvidenceHit, Publisher } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_MOCK = !import.meta.env.VITE_API_URL;

// Mock data for development/demo
const MOCK_HITS: EvidenceHit[] = [
  {
    id: '1',
    title: 'Building RAG Systems',
    section: 'Chapter 3: Retrieval Strategies',
    snippet: 'Retrieval-augmented generation combines the strengths of retrieval systems with generative models, enabling more accurate and grounded responses...',
    full_text: 'Retrieval-augmented generation (RAG) combines the strengths of retrieval systems with generative models, enabling more accurate and grounded responses. The key insight is that by providing relevant context to an LLM, we can significantly improve the quality and factuality of generated text.\n\nThe retrieval component typically uses dense embeddings to find semantically similar documents, while the generation component synthesizes this information into coherent responses.',
    publisher: 'OReilly',
    book: 'Building LLM Applications',
    j_score: 0.87,
    s_score: 0.72,
    l_score: 0.65,
    tier: 'Strong',
    chunk_idx: 42,
  },
  {
    id: '2',
    title: 'Vector Search Fundamentals',
    section: 'Chapter 5: Embedding Models',
    snippet: 'Dense vector representations capture semantic meaning, allowing for similarity search that goes beyond keyword matching...',
    full_text: 'Dense vector representations capture semantic meaning, allowing for similarity search that goes beyond keyword matching. Modern embedding models like sentence-transformers can encode entire passages into fixed-size vectors that preserve semantic relationships.\n\nThe choice of embedding model significantly impacts retrieval quality. Models trained on diverse corpora tend to generalize better, while domain-specific fine-tuning can improve performance on specialized content.',
    publisher: 'Manning',
    book: 'Deep Learning for Search',
    j_score: 0.73,
    s_score: 0.81,
    l_score: 0.45,
    tier: 'Solid',
    chunk_idx: 128,
  },
  {
    id: '3',
    title: 'Hybrid Search Architecture',
    section: 'Chapter 7: Combining Dense and Sparse',
    snippet: 'Hybrid search merges lexical and semantic approaches using reciprocal rank fusion to leverage the strengths of both methods...',
    full_text: 'Hybrid search merges lexical and semantic approaches using reciprocal rank fusion (RRF) to leverage the strengths of both methods. Lexical search excels at exact term matching and rare words, while dense retrieval captures semantic similarity and handles synonyms naturally.\n\nThe RRF algorithm combines ranked lists by assigning scores based on rank position rather than raw scores, making it robust to score distribution differences between retrieval methods.',
    publisher: 'OReilly',
    book: 'Search Engine Design',
    j_score: 0.68,
    s_score: 0.69,
    l_score: 0.71,
    tier: 'Solid',
    chunk_idx: 89,
  },
  {
    id: '4',
    title: 'Reranking with Cross-Encoders',
    section: 'Chapter 4: Two-Stage Retrieval',
    snippet: 'Cross-encoder models provide more accurate relevance scoring by jointly encoding query and document pairs...',
    full_text: 'Cross-encoder models provide more accurate relevance scoring by jointly encoding query and document pairs. Unlike bi-encoders that encode queries and documents independently, cross-encoders can capture fine-grained interactions between them.\n\nThe trade-off is computational cost: cross-encoders are too slow for initial retrieval but excel as rerankers over a smaller candidate set retrieved by faster methods.',
    publisher: 'Pearson',
    book: 'Neural Information Retrieval',
    j_score: 0.52,
    s_score: 0.58,
    l_score: 0.42,
    tier: 'Weak',
    chunk_idx: 67,
  },
  {
    id: '5',
    title: 'Chunking Strategies',
    section: 'Chapter 2: Document Processing',
    snippet: 'Effective chunking balances context preservation with retrieval granularity, using overlapping windows or semantic boundaries...',
    full_text: 'Effective chunking balances context preservation with retrieval granularity, using overlapping windows or semantic boundaries. Fixed-size chunks are simple but may split important context, while semantic chunking respects document structure.\n\nOverlap between chunks helps preserve context that spans chunk boundaries. A common strategy is 20-30% overlap, though optimal values depend on the specific use case and content type.',
    publisher: 'Manning',
    book: 'RAG in Production',
    j_score: 0.61,
    s_score: 0.55,
    l_score: 0.48,
    tier: 'Solid',
    chunk_idx: 23,
  },
];

const MOCK_NEAR_MISS: EvidenceHit[] = [
  {
    id: '6',
    title: 'Query Expansion Techniques',
    section: 'Chapter 6: Query Processing',
    snippet: 'Query expansion improves recall by adding synonyms and related terms to the original query...',
    full_text: 'Query expansion improves recall by adding synonyms and related terms to the original query. This can be done using thesauri, word embeddings, or pseudo-relevance feedback from initial retrieval results.',
    publisher: 'OReilly',
    book: 'Search Engine Design',
    j_score: 0.42,
    s_score: 0.48,
    l_score: 0.35,
    tier: 'Poor',
    chunk_idx: 156,
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function searchAPI(query: string, filters: SearchFilters): Promise<SearchResponse> {
  // Use real API if configured
  if (!USE_MOCK) {
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...filters }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('API request failed, falling back to mock:', err);
      // Fall through to mock data
    }
  }

  await delay(600); // Simulate network latency

  // Filter by publisher
  let filteredHits = MOCK_HITS.filter(hit => 
    filters.pubs.length === 0 || filters.pubs.includes(hit.publisher)
  );

  // Filter by jmin
  filteredHits = filteredHits.filter(hit => hit.j_score >= filters.jmin);

  // Sort based on option
  if (filters.sort === 'Semantic') {
    filteredHits.sort((a, b) => b.s_score - a.s_score);
  } else {
    filteredHits.sort((a, b) => b.j_score - a.j_score);
  }

  // Adjust results based on mode
  const limit = filters.mode === 'quick' ? 3 : 5;
  filteredHits = filteredHits.slice(0, limit);

  return {
    ok: true,
    query,
    hits: filteredHits,
    near_miss: filters.show_near_miss ? MOCK_NEAR_MISS : [],
    coverage: filteredHits.length >= 3 ? 'HIGH' : filteredHits.length >= 1 ? 'MEDIUM' : 'LOW',
    confidence: filteredHits.length > 0 ? filteredHits[0].j_score : 0,
    answer: null,
    meta: {
      mode_cfg: {
        name: filters.mode,
        final_k: filters.mode === 'quick' ? 8 : 12,
        mmr_k: filters.mode === 'quick' ? 16 : 28,
        dense_k: filters.mode === 'quick' ? 24 : 40,
        lex_k: filters.mode === 'quick' ? 24 : 40,
      },
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
        after_judge: filteredHits.length,
      },
    },
  };
}

export async function fetchHealth(): Promise<HealthResponse> {
  // Use real API if configured
  if (!USE_MOCK) {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('Health check failed, falling back to mock:', err);
    }
  }

  await delay(200);

  return {
    ok: true,
    corpus_count: 3,
    publishers: ['OReilly', 'Manning', 'Pearson'] as Publisher[],
    engine_version: '1.0.0',
  };
}

export { API_BASE };
