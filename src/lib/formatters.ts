// Common English words + technical terms for word boundary detection
const COMMON_WORDS = new Set([
  // Articles & prepositions
  'the', 'a', 'an', 'and', 'or', 'for', 'with', 'from', 'that', 'this', 'into', 'your', 'to', 'of', 'in', 'on', 'by', 'as', 'at', 'is', 'it', 'be', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'about', 'above', 'after', 'again', 'against', 'all', 'also', 'am', 'any', 'because', 'before', 'below', 'between', 'both', 'but', 'cannot', 'come', 'could', 'did', 'does', 'doing', 'down', 'during', 'each', 'even', 'few', 'first', 'five', 'four', 'get', 'go', 'goes', 'going', 'got', 'had', 'has', 'have', 'he', 'her', 'here', 'hers', 'him', 'himself', 'his', 'how', 'however', 'i', 'if', 'into', 'its', 'itself', 'just', 'last', 'least', 'less', 'let', 'like', 'likely', 'made', 'make', 'makes', 'making', 'many', 'me', 'might', 'more', 'most', 'much', 'my', 'myself', 'never', 'new', 'no', 'nor', 'not', 'now', 'of', 'off', 'often', 'old', 'on', 'once', 'one', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'per', 'put', 'said', 'same', 'say', 'says', 'she', 'so', 'some', 'still', 'such', 'take', 'than', 'that', 'their', 'them', 'themselves', 'then', 'there', 'these', 'they', 'thing', 'things', 'think', 'those', 'three', 'through', 'thus', 'time', 'times', 'too', 'two', 'under', 'until', 'up', 'upon', 'us', 'use', 'used', 'uses', 'using', 'very', 'want', 'wants', 'was', 'way', 'ways', 'we', 'well', 'went', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'whose', 'why', 'will', 'with', 'within', 'without', 'work', 'works', 'would', 'year', 'years', 'yet', 'you', 'your', 'yours', 'yourself',
  
  // Tech terms - AI/ML
  'ai', 'ml', 'llm', 'llms', 'gpt', 'nlp', 'neural', 'network', 'networks', 'deep', 'learning', 'machine', 'model', 'models', 'training', 'inference', 'transformer', 'transformers', 'attention', 'embedding', 'embeddings', 'vector', 'vectors', 'token', 'tokens', 'tokenization', 'prompt', 'prompts', 'prompting', 'completion', 'completions', 'fine', 'tuning', 'finetuning', 'pretrained', 'pretraining', 'generative', 'generation', 'retrieval', 'augmented', 'rag', 'agent', 'agents', 'agentic', 'chain', 'chains', 'langchain', 'openai', 'anthropic', 'claude', 'chatgpt', 'gemini', 'llama', 'mistral', 'bert', 'diffusion', 'stable', 'multimodal', 'vision', 'language', 'speech', 'text', 'image', 'audio', 'video',
  
  // Tech terms - Programming
  'api', 'apis', 'sdk', 'sdks', 'code', 'coding', 'program', 'programming', 'developer', 'developers', 'development', 'software', 'hardware', 'application', 'applications', 'app', 'apps', 'web', 'mobile', 'cloud', 'server', 'servers', 'client', 'clients', 'database', 'databases', 'data', 'backend', 'frontend', 'fullstack', 'stack', 'framework', 'frameworks', 'library', 'libraries', 'package', 'packages', 'module', 'modules', 'function', 'functions', 'method', 'methods', 'class', 'classes', 'object', 'objects', 'interface', 'interfaces', 'type', 'types', 'variable', 'variables', 'constant', 'constants', 'array', 'arrays', 'string', 'strings', 'number', 'numbers', 'boolean', 'null', 'undefined', 'async', 'await', 'promise', 'promises', 'callback', 'callbacks', 'event', 'events', 'handler', 'handlers', 'listener', 'listeners', 'component', 'components', 'hook', 'hooks', 'state', 'props', 'render', 'rendering', 'dom', 'html', 'css', 'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab', 'ci', 'cd', 'devops', 'testing', 'test', 'tests', 'debug', 'debugging', 'deploy', 'deployment', 'production', 'staging', 'environment', 'environments',
  
  // Tech terms - Architecture
  'architecture', 'architectures', 'architecting', 'design', 'designs', 'designing', 'pattern', 'patterns', 'practice', 'practices', 'principle', 'principles', 'system', 'systems', 'platform', 'platforms', 'service', 'services', 'microservice', 'microservices', 'monolith', 'distributed', 'scalable', 'scalability', 'performance', 'optimization', 'security', 'authentication', 'authorization', 'encryption', 'protocol', 'protocols', 'http', 'https', 'rest', 'graphql', 'grpc', 'websocket', 'tcp', 'udp', 'dns', 'cdn', 'cache', 'caching', 'redis', 'memcached', 'queue', 'queues', 'messaging', 'kafka', 'rabbitmq', 'pub', 'sub', 'stream', 'streaming', 'batch', 'real', 'time', 'realtime', 'sync', 'async', 'synchronous', 'asynchronous', 'concurrent', 'concurrency', 'parallel', 'parallelism', 'thread', 'threads', 'process', 'processes',
  
  // Book/content terms
  'book', 'books', 'guide', 'guides', 'handbook', 'handbooks', 'manual', 'manuals', 'tutorial', 'tutorials', 'course', 'courses', 'chapter', 'chapters', 'section', 'sections', 'part', 'parts', 'introduction', 'intro', 'conclusion', 'summary', 'overview', 'appendix', 'index', 'reference', 'references', 'example', 'examples', 'exercise', 'exercises', 'solution', 'solutions', 'answer', 'answers', 'question', 'questions', 'playbook', 'cookbook', 'recipes', 'recipe', 'definitive', 'complete', 'comprehensive', 'practical', 'essential', 'essentials', 'fundamentals', 'basics', 'advanced', 'intermediate', 'beginner', 'expert', 'professional', 'enterprise', 'edition', 'version', 'release', 'update', 'updated',
  
  // Common action words
  'build', 'building', 'built', 'create', 'creating', 'created', 'implement', 'implementing', 'implementation', 'develop', 'developing', 'developed', 'write', 'writing', 'written', 'read', 'reading', 'run', 'running', 'execute', 'executing', 'execution', 'start', 'starting', 'stop', 'stopping', 'configure', 'configuring', 'configuration', 'setup', 'install', 'installing', 'installation', 'manage', 'managing', 'management', 'handle', 'handling', 'process', 'processing', 'transform', 'transforming', 'transformation', 'convert', 'converting', 'conversion', 'parse', 'parsing', 'validate', 'validating', 'validation', 'verify', 'verifying', 'verification', 'authenticate', 'authenticating', 'authorize', 'authorizing', 'connect', 'connecting', 'connection', 'disconnect', 'send', 'sending', 'receive', 'receiving', 'request', 'requesting', 'response', 'responding', 'query', 'querying', 'fetch', 'fetching', 'load', 'loading', 'save', 'saving', 'store', 'storing', 'storage', 'delete', 'deleting', 'update', 'updating', 'insert', 'inserting', 'select', 'selecting', 'filter', 'filtering', 'sort', 'sorting', 'search', 'searching', 'find', 'finding', 'get', 'getting', 'set', 'setting', 'add', 'adding', 'remove', 'removing', 'change', 'changing', 'modify', 'modifying', 'edit', 'editing', 'fix', 'fixing', 'improve', 'improving', 'optimize', 'optimizing', 'enhance', 'enhancing', 'extend', 'extending', 'expand', 'expanding', 'reduce', 'reducing', 'simplify', 'simplifying', 'refactor', 'refactoring', 'clean', 'cleaning', 'format', 'formatting', 'style', 'styling', 'structure', 'structuring', 'organize', 'organizing', 'organization',
  
  // Information & analysis
  'information', 'analysis', 'analyzing', 'analyze', 'insight', 'insights', 'metric', 'metrics', 'measure', 'measuring', 'measurement', 'monitor', 'monitoring', 'track', 'tracking', 'log', 'logging', 'logs', 'report', 'reporting', 'reports', 'dashboard', 'dashboards', 'visualization', 'visualize', 'visualizing', 'chart', 'charts', 'graph', 'graphs', 'table', 'tables', 'list', 'lists', 'item', 'items', 'record', 'records', 'entry', 'entries', 'field', 'fields', 'column', 'columns', 'row', 'rows', 'key', 'keys', 'value', 'values', 'pair', 'pairs', 'map', 'maps', 'mapping', 'set', 'sets', 'group', 'groups', 'grouping', 'category', 'categories', 'tag', 'tags', 'label', 'labels', 'name', 'names', 'title', 'titles', 'description', 'descriptions', 'content', 'contents', 'body', 'header', 'headers', 'footer', 'footers', 'nav', 'navigation', 'menu', 'menus', 'sidebar', 'toolbar', 'button', 'buttons', 'link', 'links', 'form', 'forms', 'input', 'inputs', 'output', 'outputs', 'result', 'results', 'error', 'errors', 'warning', 'warnings', 'info', 'success', 'failure', 'status', 'statuses', 'message', 'messages', 'notification', 'notifications', 'alert', 'alerts',
]);

// Greedy algorithm: find longest matching word starting at position
function findLongestWord(text: string, start: number): string | null {
  // Try decreasing lengths from the remaining text
  const remaining = text.slice(start);
  const maxLen = Math.min(remaining.length, 25); // Cap at 25 chars for efficiency
  
  for (let len = maxLen; len >= 2; len--) {
    const candidate = remaining.slice(0, len).toLowerCase();
    if (COMMON_WORDS.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

// Segment all-lowercase concatenated words using greedy matching
function greedyWordSplit(text: string): string[] {
  const words: string[] = [];
  let pos = 0;
  
  while (pos < text.length) {
    const match = findLongestWord(text, pos);
    if (match) {
      words.push(match);
      pos += match.length;
    } else {
      // No dictionary match - take single character and continue
      // This handles unknown words by building them char by char
      let unknownWord = '';
      while (pos < text.length) {
        const nextMatch = findLongestWord(text, pos);
        if (nextMatch && unknownWord.length > 0) {
          break; // Found next known word, stop collecting unknown
        }
        if (nextMatch && unknownWord.length === 0) {
          words.push(nextMatch);
          pos += nextMatch.length;
          break;
        }
        unknownWord += text[pos];
        pos++;
        
        // Check if we've collected a known word
        if (COMMON_WORDS.has(unknownWord.toLowerCase())) {
          words.push(unknownWord);
          unknownWord = '';
        }
      }
      if (unknownWord) {
        words.push(unknownWord);
      }
    }
  }
  
  return words;
}

// Capitalize first letter of each word
function titleCase(words: string[]): string {
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Format title with smart word segmentation
export function formatTitle(title: string): string {
  if (!title) return '';
  
  // If already has spaces, capitals, or separators - just clean up
  if (/[A-Z\s_-]/.test(title)) {
    return title
      // Insert space before uppercase letters (camelCase)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Insert space before numbers
      .replace(/([a-zA-Z])(\d)/g, '$1 $2')
      // Insert space after numbers
      .replace(/(\d)([a-zA-Z])/g, '$1 $2')
      // Replace underscores and hyphens with spaces
      .replace(/[_-]/g, ' ')
      // Normalize multiple spaces
      .replace(/\s+/g, ' ')
      // Capitalize first letter of each word
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }
  
  // All lowercase concatenated - use greedy word splitting
  const words = greedyWordSplit(title.toLowerCase());
  return titleCase(words);
}

// Format section reference (ch06.html → Chapter 6)
export function formatSection(section: string): string {
  if (!section) return '';
  
  // Match chapter patterns like ch06.html, chapter-3.html, etc.
  const chapterMatch = section.match(/ch(?:apter)?[-_]?(\d+)(?:[-_](\w+))?/i);
  if (chapterMatch) {
    const chNum = parseInt(chapterMatch[1], 10);
    const suffix = chapterMatch[2];
    if (suffix) {
      // ch07_security.html → Chapter 7: Security
      const formattedSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1).replace(/[-_]/g, ' ');
      return `Chapter ${chNum}: ${formattedSuffix}`;
    }
    return `Chapter ${chNum}`;
  }
  
  // Match part+chapter patterns like part02_ch05.html
  const partChapterMatch = section.match(/part[-_]?(\d+)[-_]?ch(?:apter)?[-_]?(\d+)/i);
  if (partChapterMatch) {
    return `Part ${parseInt(partChapterMatch[1], 10)}, Chapter ${parseInt(partChapterMatch[2], 10)}`;
  }
  
  // Match index patterns like ix01.html
  const indexMatch = section.match(/ix(\d+)/i);
  if (indexMatch) {
    return 'Index';
  }
  
  // Match appendix patterns
  const appendixMatch = section.match(/app(?:endix)?[-_]?([a-z\d]+)/i);
  if (appendixMatch) {
    return `Appendix ${appendixMatch[1].toUpperCase()}`;
  }
  
  // Match preface/intro patterns
  if (/pref(?:ace)?/i.test(section)) return 'Preface';
  if (/intro(?:duction)?/i.test(section)) return 'Introduction';
  if (/conclu(?:sion)?/i.test(section)) return 'Conclusion';
  if (/summar(?:y)?/i.test(section)) return 'Summary';
  
  // Remove file extension and format
  return section
    .replace(/\.\w+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// Clean up snippet text
export function formatSnippet(snippet: string): string {
  return snippet
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove leading punctuation or fragments
    .replace(/^[,;:\-–—.…]\s*/, '')
    // Remove leading lowercase word fragments (likely cut-off words)
    .replace(/^[a-z]{1,3}\s+/, '')
    // Clean up common artifacts
    .replace(/\s+([,;:.])/g, '$1')
    .trim();
}
