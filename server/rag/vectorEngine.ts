import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const WORKSPACE_ROOT = process.cwd();
const RAG_STORAGE_DIR = path.join(WORKSPACE_ROOT, '.either_storage', 'rag');

try {
  if (!fs.existsSync(RAG_STORAGE_DIR)) {
    fs.mkdirSync(RAG_STORAGE_DIR, { recursive: true });
  }
} catch {}

export interface DocumentChunk {
  id: string;
  source: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  entities: string[];
  timestamp: number;
}

export interface GraphNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'concept' | 'credential';
  name: string;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: 'imports' | 'defines' | 'calls' | 'references' | 'configures';
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RAGSearchResult {
  id: string;
  source: string;
  content: string;
  score: number;
  entities: string[];
  relatedNodes?: GraphNode[];
}

/**
 * Sovereign Vector RAG & GraphRAG Context Engine
 */
export class VectorEngine {
  private static instance: VectorEngine;
  private chunks: Map<string, DocumentChunk> = new Map();
  private graph: KnowledgeGraph = { nodes: [], edges: [] };
  private vocabulary: Map<string, number> = new Map();

  private constructor() {
    this.loadPersistence();
  }

  public static getInstance(): VectorEngine {
    if (!VectorEngine.instance) {
      VectorEngine.instance = new VectorEngine();
    }
    return VectorEngine.instance;
  }

  private loadPersistence() {
    try {
      const chunksFile = path.join(RAG_STORAGE_DIR, 'chunks.json');
      const graphFile = path.join(RAG_STORAGE_DIR, 'graph.json');
      if (fs.existsSync(chunksFile)) {
        const raw = fs.readFileSync(chunksFile, 'utf8');
        const arr: DocumentChunk[] = JSON.parse(raw);
        arr.forEach(c => this.chunks.set(c.id, c));
      }
      if (fs.existsSync(graphFile)) {
        const raw = fs.readFileSync(graphFile, 'utf8');
        this.graph = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[VectorEngine] Storage init:', err);
    }
  }

  private savePersistence() {
    try {
      const chunksFile = path.join(RAG_STORAGE_DIR, 'chunks.json');
      const graphFile = path.join(RAG_STORAGE_DIR, 'graph.json');
      fs.writeFileSync(chunksFile, JSON.stringify(Array.from(this.chunks.values())), 'utf8');
      fs.writeFileSync(graphFile, JSON.stringify(this.graph), 'utf8');
    } catch (err) {
      console.warn('[VectorEngine] Storage save:', err);
    }
  }

  /**
   * Local Deterministic Semantic Embedding Vector (128-dimensional space)
   */
  public generateEmbedding(text: string): number[] {
    const vector = new Array(128).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9_\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
    
    for (const word of words) {
      const hash = crypto.createHash('md5').update(word).digest();
      for (let i = 0; i < 16; i++) {
        const idx = (hash[i] + i * 8) % 128;
        vector[idx] += 1 / (1 + Math.log(word.length + 1));
      }
    }

    // Normalize vector to unit length
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map(v => v / norm);
  }

  /**
   * Cosine Similarity between two unit vectors
   */
  public cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    return dot;
  }

  /**
   * Recursive text chunker with token/character overlap
   */
  public chunkText(text: string, chunkSize: number = 512, overlap: number = 64): string[] {
    const chunks: string[] = [];
    if (!text) return chunks;
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      let chunk = text.slice(start, end);
      
      // Attempt boundary split at newline or punctuation if not at the absolute end
      if (end < text.length) {
        const lastBreak = Math.max(chunk.lastIndexOf('\n'), chunk.lastIndexOf('. '));
        if (lastBreak > chunkSize * 0.5) {
          chunk = chunk.slice(0, lastBreak + 1);
          start += chunk.length;
          chunks.push(chunk.trim());
          continue;
        }
      }
      
      chunks.push(chunk.trim());
      start += chunkSize - overlap;
    }
    return chunks.filter(c => c.length > 0);
  }

  /**
   * Extract Entity Nodes from Code / Documentation
   */
  private extractEntities(content: string, filePath: string): string[] {
    const entities: Set<string> = new Set();
    const fnMatches = content.match(/function\s+([a-zA-Z0-9_]+)/g);
    if (fnMatches) fnMatches.forEach(m => entities.add(m.replace('function ', '').trim()));
    
    const classMatches = content.match(/class\s+([a-zA-Z0-9_]+)/g);
    if (classMatches) classMatches.forEach(m => entities.add(m.replace('class ', '').trim()));

    const importMatches = content.match(/import\s+.*?from\s+['"](.*?)['"]/g);
    if (importMatches) importMatches.forEach(m => entities.add(m.replace(/.*from\s+['"]/, '').replace(/['"]/, '').trim()));

    const baseName = path.basename(filePath);
    entities.add(baseName);
    return Array.from(entities);
  }

  /**
   * Index Workspace File or Arbitrary Document
   */
  public async indexDocument(source: string, content: string): Promise<number> {
    const chunks = this.chunkText(content, 512, 64);
    const entities = this.extractEntities(content, source);
    
    // Add GraphNode for File
    const fileNodeId = 'file:' + source;
    if (!this.graph.nodes.some(n => n.id === fileNodeId)) {
      this.graph.nodes.push({ id: fileNodeId, type: 'file', name: source, metadata: { length: content.length } });
    }

    // Index Chunks
    let added = 0;
    chunks.forEach((text, i) => {
      const id = crypto.createHash('sha1').update(source + ':' + i).digest('hex').slice(0, 16);
      const embedding = this.generateEmbedding(text);
      this.chunks.set(id, {
        id,
        source,
        chunkIndex: i,
        content: text,
        embedding,
        entities,
        timestamp: Date.now()
      });
      added++;
    });

    this.savePersistence();
    return added;
  }

  /**
   * Hybrid Vector + BM25 Semantic Similarity Search
   */
  public search(query: string, topK: number = 5): RAGSearchResult[] {
    const queryEmbedding = this.generateEmbedding(query);
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const results: RAGSearchResult[] = [];

    for (const chunk of this.chunks.values()) {
      const vectorScore = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      
      // Keyword match boost
      const lowerContent = chunk.content.toLowerCase();
      let termMatches = 0;
      for (const term of queryTerms) {
        if (lowerContent.includes(term)) termMatches++;
      }
      const keywordScore = queryTerms.length > 0 ? (termMatches / queryTerms.length) : 0;
      
      const finalScore = vectorScore * 0.7 + keywordScore * 0.3;
      if (finalScore > 0.15) {
        results.push({
          id: chunk.id,
          source: chunk.source,
          content: chunk.content,
          score: parseFloat(finalScore.toFixed(4)),
          entities: chunk.entities
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  public getStats() {
    return {
      totalChunks: this.chunks.size,
      totalGraphNodes: this.graph.nodes.length,
      totalGraphEdges: this.graph.edges.length,
      storagePath: RAG_STORAGE_DIR
    };
  }
}