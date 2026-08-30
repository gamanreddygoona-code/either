import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const WORKSPACE_ROOT = process.cwd();
const MEMORY_STORAGE_DIR = path.join(WORKSPACE_ROOT, '.either_storage', 'memory');

try {
  if (!fs.existsSync(MEMORY_STORAGE_DIR)) {
    fs.mkdirSync(MEMORY_STORAGE_DIR, { recursive: true });
  }
} catch {}

export interface EpisodicMemory {
  id: string;
  timestamp: number;
  user: string;
  query: string;
  summary: string;
  actionsTaken: string[];
  outcome: 'success' | 'failed' | 'partial';
  tags: string[];
}

export interface SemanticMemory {
  id: string;
  category: 'preference' | 'style' | 'entity' | 'rule';
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  updatedAt: number;
}

export interface ProceduralWorkflow {
  id: string;
  name: string;
  triggerPattern: string;
  steps: string[];
  successCount: number;
  failureCount: number;
  lastExecuted: number;
}

export interface WorkingMemory {
  sessionId: string;
  currentGoal: string;
  activePlan: string[];
  contextVariables: Record<string, any>;
  updatedAt: number;
  ttlMs: number;
}

/**
 * Cognee / Mem0-style Multi-Layer Agent Memory System
 */
export class MemoryEngine {
  private static instance: MemoryEngine;
  private episodic: EpisodicMemory[] = [];
  private semantic: Map<string, SemanticMemory> = new Map();
  private procedural: Map<string, ProceduralWorkflow> = new Map();
  private working: Map<string, WorkingMemory> = new Map();

  private constructor() {
    this.loadPersistence();
    this.seedDefaultMemory();
  }

  public static getInstance(): MemoryEngine {
    if (!MemoryEngine.instance) {
      MemoryEngine.instance = new MemoryEngine();
    }
    return MemoryEngine.instance;
  }

  private loadPersistence() {
    try {
      const file = path.join(MEMORY_STORAGE_DIR, 'persistent_memory.json');
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.episodic)) this.episodic = data.episodic;
        if (Array.isArray(data.semantic)) data.semantic.forEach((s: SemanticMemory) => this.semantic.set(s.id, s));
        if (Array.isArray(data.procedural)) data.procedural.forEach((p: ProceduralWorkflow) => this.procedural.set(p.id, p));
      }
    } catch (e) {
      console.warn('[MemoryEngine] Init warning:', e);
    }
  }

  private savePersistence() {
    try {
      const file = path.join(MEMORY_STORAGE_DIR, 'persistent_memory.json');
      const payload = {
        episodic: this.episodic.slice(0, 100),
        semantic: Array.from(this.semantic.values()),
        procedural: Array.from(this.procedural.values()),
        savedAt: Date.now()
      };
      fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      console.warn('[MemoryEngine] Save warning:', e);
    }
  }

  private seedDefaultMemory() {
    if (this.semantic.size === 0) {
      this.setSemantic('pref_os', 'preference', 'workspace', 'runs_on', 'windows_11', 0.99);
      this.setSemantic('pref_privacy', 'rule', 'either_ai', 'enforces', 'zero_data_leaks', 1.0);
      this.setSemantic('pref_models', 'preference', 'default_model', 'is', 'gemini-3.5-flash', 0.95);
    }
    if (this.procedural.size === 0) {
      this.recordWorkflow('threat_intel_pipeline', 'threat.*|ransomware|onion|cve', [
        '1. Inspect AI Firewall boundaries',
        '2. Probe Tor SOCKS5H service',
        '3. Query CISA KEV & Abuse.ch IOCs',
        '4. Perform HIBP k-anonymity check',
        '5. Append SHA-256 block to Audit Ledger'
      ]);
    }
  }

  /* ================= 1. Episodic Memory (Past Events & Interventions) ================= */

  public recordEpisodic(user: string, query: string, summary: string, actionsTaken: string[], outcome: 'success' | 'failed' | 'partial', tags: string[] = []): EpisodicMemory {
    const mem: EpisodicMemory = {
      id: 'ep-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
      timestamp: Date.now(),
      user,
      query,
      summary,
      actionsTaken,
      outcome,
      tags
    };
    this.episodic.unshift(mem);
    if (this.episodic.length > 200) this.episodic.pop();
    this.savePersistence();
    return mem;
  }

  public queryEpisodic(query: string, limit: number = 5): EpisodicMemory[] {
    const qLower = query.toLowerCase();
    return this.episodic
      .filter(e => e.query.toLowerCase().includes(qLower) || e.summary.toLowerCase().includes(qLower) || e.tags.some(t => t.toLowerCase().includes(qLower)))
      .slice(0, limit);
  }

  /* ================= 2. Semantic Memory (Graph of Facts & Preferences) ================= */

  public setSemantic(id: string, category: SemanticMemory['category'], subject: string, predicate: string, object: string, confidence: number = 0.9): SemanticMemory {
    const mem: SemanticMemory = {
      id,
      category,
      subject,
      predicate,
      object,
      confidence,
      updatedAt: Date.now()
    };
    this.semantic.set(id, mem);
    this.savePersistence();
    return mem;
  }

  public getSemanticFacts(): SemanticMemory[] {
    return Array.from(this.semantic.values());
  }

  /* ================= 3. Procedural Memory (Playbooks & Workflows) ================= */

  public recordWorkflow(name: string, triggerPattern: string, steps: string[]): ProceduralWorkflow {
    const existing = this.procedural.get(name);
    const wf: ProceduralWorkflow = {
      id: name,
      name,
      triggerPattern,
      steps,
      successCount: existing ? existing.successCount + 1 : 1,
      failureCount: existing ? existing.failureCount : 0,
      lastExecuted: Date.now()
    };
    this.procedural.set(name, wf);
    this.savePersistence();
    return wf;
  }

  public matchWorkflow(intent: string): ProceduralWorkflow | undefined {
    for (const wf of this.procedural.values()) {
      const reg = new RegExp(wf.triggerPattern, 'i');
      if (reg.test(intent)) {
        return wf;
      }
    }
    return undefined;
  }

  /* ================= 4. Working Memory (Active Session Scratchpad) ================= */

  public setWorkingContext(sessionId: string, currentGoal: string, activePlan: string[], contextVariables: Record<string, any> = {}, ttlMs: number = 3600000) {
    this.working.set(sessionId, {
      sessionId,
      currentGoal,
      activePlan,
      contextVariables,
      updatedAt: Date.now(),
      ttlMs
    });
  }

  public getWorkingContext(sessionId: string): WorkingMemory | undefined {
    const mem = this.working.get(sessionId);
    if (!mem) return undefined;
    if (Date.now() - mem.updatedAt > mem.ttlMs) {
      this.working.delete(sessionId);
      return undefined;
    }
    return mem;
  }

  public getSummary() {
    return {
      episodicCount: this.episodic.length,
      semanticFacts: this.semantic.size,
      proceduralWorkflows: this.procedural.size,
      activeWorkingSessions: this.working.size
    };
  }
}