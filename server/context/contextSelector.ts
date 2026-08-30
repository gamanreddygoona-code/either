import { VectorEngine, RAGSearchResult } from '../rag/vectorEngine';
import { MemoryEngine, EpisodicMemory, SemanticMemory } from '../memory/memoryEngine';

export interface ContextItem {
  id: string;
  type: 'essential_file' | 'rag_chunk' | 'episodic_memory' | 'semantic_fact';
  source: string;
  content: string;
  relevance: number;
  tokens: number;
}

export interface OptimizedContext {
  query: string;
  tokenBudget: number;
  tokensUsed: number;
  items: ContextItem[];
  formattedPromptContext: string;
}

/**
 * Advanced Context Engineering & Token Budget Optimizer
 */
export class ContextSelector {
  private static instance: ContextSelector;

  private constructor() {}

  public static getInstance(): ContextSelector {
    if (!ContextSelector.instance) {
      ContextSelector.instance = new ContextSelector();
    }
    return ContextSelector.instance;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  public async buildOptimalContext(query: string, availableTokens: number = 4000): Promise<OptimizedContext> {
    const allCandidates: ContextItem[] = [];

    // 1. RAG Chunks from workspace codebase
    const rag = VectorEngine.getInstance();
    const ragResults = rag.search(query, 10);
    ragResults.forEach(r => {
      allCandidates.push({
        id: 'rag-' + r.id,
        type: 'rag_chunk',
        source: r.source,
        content: r.content,
        relevance: r.score,
        tokens: this.estimateTokens(r.content)
      });
    });

    // 2. Semantic Facts & User Preferences
    const mem = MemoryEngine.getInstance();
    const facts = mem.getSemanticFacts();
    facts.forEach(f => {
      const text = f.subject + ' ' + f.predicate + ' ' + f.object;
      allCandidates.push({
        id: 'sem-' + f.id,
        type: 'semantic_fact',
        source: 'semantic_memory',
        content: text,
        relevance: f.confidence,
        tokens: this.estimateTokens(text)
      });
    });

    // 3. Episodic Memory of past queries
    const pastEpisodes = mem.queryEpisodic(query, 5);
    pastEpisodes.forEach(e => {
      const text = 'Past interaction: ' + e.query + ' -> ' + e.summary;
      allCandidates.push({
        id: 'ep-' + e.id,
        type: 'episodic_memory',
        source: 'episodic_memory',
        content: text,
        relevance: 0.7,
        tokens: this.estimateTokens(text)
      });
    });

    // 4. Sort and fit within budget
    allCandidates.sort((a, b) => b.relevance - a.relevance);

    const selected: ContextItem[] = [];
    let totalTokens = 0;

    for (const item of allCandidates) {
      if (totalTokens + item.tokens <= availableTokens) {
        selected.push(item);
        totalTokens += item.tokens;
      }
    }

    const formattedPromptContext = selected.map(s => `[${s.type.toUpperCase()} from ${s.source}]:\n${s.content}`).join('\n\n---\n\n');

    return {
      query,
      tokenBudget: availableTokens,
      tokensUsed: totalTokens,
      items: selected,
      formattedPromptContext
    };
  }
}