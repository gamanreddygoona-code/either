import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { ThreatIntelEngine } from '../threatIntel';
import { PlaywrightBrowserAgent } from '../browserAgent';
import { logSecurityEvent } from '../security';

const execAsync = util.promisify(exec);
const WORKSPACE_ROOT = process.cwd();

export interface MCPToolParameter {
  type: string;
  description?: string;
  enum?: string[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  category: 'filesystem' | 'git' | 'browser' | 'database' | 'security' | 'connectors';
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPToolParameter>;
    required?: string[];
  };
}

export interface MCPToolExecutionResult {
  content: Array<{
    type: 'text' | 'json' | 'image';
    text?: string;
    json?: any;
    data?: string;
  }>;
  isError?: boolean;
}

/**
 * Standard Model Context Protocol (MCP) Server Hub
 */
export class MCPHub {
  private static instance: MCPHub;
  private tools: Map<string, { definition: MCPToolDefinition; handler: (args: any) => Promise<MCPToolExecutionResult> }> = new Map();

  private constructor() {
    this.registerStandardTools();
  }

  public static getInstance(): MCPHub {
    if (!MCPHub.instance) {
      MCPHub.instance = new MCPHub();
    }
    return MCPHub.instance;
  }

  private registerStandardTools() {
    // 1. Filesystem: read_file
    this.registerTool({
      name: 'fs_read_file',
      description: 'Read file contents from the workspace safely with path validation.',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to file in workspace' }
        },
        required: ['path']
      }
    }, async ({ path: reqPath }) => {
      const safePath = path.resolve(WORKSPACE_ROOT, reqPath);
      if (!safePath.startsWith(WORKSPACE_ROOT)) {
        return { isError: true, content: [{ type: 'text', text: 'Error: Path traversal outside workspace denied' }] };
      }
      if (!fs.existsSync(safePath)) {
        return { isError: true, content: [{ type: 'text', text: 'File not found: ' + reqPath }] };
      }
      const content = await fs.promises.readFile(safePath, 'utf8');
      return { content: [{ type: 'text', text: content.slice(0, 100000) }] };
    });

    // 2. Filesystem: write_file
    this.registerTool({
      name: 'fs_write_file',
      description: 'Write or update a file safely in the workspace.',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to file in workspace' },
          content: { type: 'string', description: 'Text content to write' }
        },
        required: ['path', 'content']
      }
    }, async ({ path: reqPath, content }) => {
      const safePath = path.resolve(WORKSPACE_ROOT, reqPath);
      if (!safePath.startsWith(WORKSPACE_ROOT)) {
        return { isError: true, content: [{ type: 'text', text: 'Error: Path traversal outside workspace denied' }] };
      }
      await fs.promises.mkdir(path.dirname(safePath), { recursive: true });
      await fs.promises.writeFile(safePath, content, 'utf8');
      logSecurityEvent({ user: 'MCP', action: 'FS_WRITE', verdict: 'ALLOWED', details: 'Wrote ' + reqPath });
      return { content: [{ type: 'text', text: 'Successfully wrote ' + content.length + ' characters to ' + reqPath }] };
    });

    // 3. Filesystem: list_directory
    this.registerTool({
      name: 'fs_list_dir',
      description: 'List contents of a workspace directory.',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative directory path (empty for root)' }
        }
      }
    }, async ({ path: reqPath = '' }) => {
      const target = path.resolve(WORKSPACE_ROOT, reqPath);
      if (!target.startsWith(WORKSPACE_ROOT) || !fs.existsSync(target)) {
        return { isError: true, content: [{ type: 'text', text: 'Invalid directory path' }] };
      }
      const entries = await fs.promises.readdir(target, { withFileTypes: true });
      const items = entries.map(e => ({ name: e.name, isDirectory: e.isDirectory() }));
      return { content: [{ type: 'json', json: items }] };
    });

    // 4. Git: git_status
    this.registerTool({
      name: 'git_status',
      description: 'Get working directory git porcelain status.',
      category: 'git',
      inputSchema: { type: 'object', properties: {} }
    }, async () => {
      try {
        const { stdout } = await execAsync('git status --porcelain', { cwd: WORKSPACE_ROOT });
        return { content: [{ type: 'text', text: stdout || 'Working tree clean' }] };
      } catch (err: any) {
        return { isError: true, content: [{ type: 'text', text: err.message }] };
      }
    });

    // 5. Git: git_diff
    this.registerTool({
      name: 'git_diff',
      description: 'Inspect current uncommitted git diffs.',
      category: 'git',
      inputSchema: {
        type: 'object',
        properties: {
          file: { type: 'string', description: 'Optional specific file path' }
        }
      }
    }, async ({ file = '' }) => {
      try {
        const cmd = file ? 'git diff ' + file : 'git diff';
        const { stdout } = await execAsync(cmd, { cwd: WORKSPACE_ROOT });
        return { content: [{ type: 'text', text: stdout || 'No diffs detected' }] };
      } catch (err: any) {
        return { isError: true, content: [{ type: 'text', text: err.message }] };
      }
    });

    // 6. Git: git_log
    this.registerTool({
      name: 'git_log',
      description: 'Retrieve recent git commit history.',
      category: 'git',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum commits to retrieve (default: 5)' }
        }
      }
    }, async ({ limit = 5 }) => {
      try {
        const count = Math.min(Math.max(1, limit), 20);
        const { stdout } = await execAsync('git log -n ' + count + ' --oneline', { cwd: WORKSPACE_ROOT });
        return { content: [{ type: 'text', text: stdout }] };
      } catch (err: any) {
        return { isError: true, content: [{ type: 'text', text: err.message }] };
      }
    });

    // 7. Browser: browser_navigate
    this.registerTool({
      name: 'browser_navigate',
      description: 'Autonomous Playwright headless browser navigation and token inspection.',
      category: 'browser',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Target URL to navigate' },
          goal: { type: 'string', description: 'Autonomous goal description' }
        },
        required: ['url', 'goal']
      }
    }, async ({ url, goal }) => {
      const agent = PlaywrightBrowserAgent.getInstance();
      const result = await agent.executeTask(url, goal);
      return {
        isError: !result.success,
        content: [
          { type: 'text', text: result.summary },
          { type: 'json', json: result }
        ]
      };
    });

    // 8. Security: threat_intel_query
    this.registerTool({
      name: 'threat_intel_query',
      description: 'Defensive threat intelligence lookup (HIBP k-anonymity, CISA KEV, Ahmia Tor, VirusTotal).',
      category: 'security',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['email', 'ip', 'domain', 'cve', 'onion'], description: 'Lookup type' },
          target: { type: 'string', description: 'Search term or indicator' }
        },
        required: ['type', 'target']
      }
    }, async ({ type, target }) => {
      const engine = ThreatIntelEngine.getInstance();
      let res;
      if (type === 'email') res = await engine.checkEmailBreach(target);
      else if (type === 'ip') res = await engine.checkVirusTotal(target, 'ip');
      else if (type === 'domain') res = await engine.checkVirusTotal(target, 'domain');
      else if (type === 'cve') res = await engine.searchCisaKev(target);
      else if (type === 'onion') res = await engine.searchAhmia(target);
      else return { isError: true, content: [{ type: 'text', text: 'Unsupported type: ' + type }] };

      return { content: [{ type: 'json', json: res }] };
    });

    // 9. Database / Storage: query_local_db
    this.registerTool({
      name: 'query_local_db',
      description: 'Query structured local workspace database records (connectors, telemetry, audit logs).',
      category: 'database',
      inputSchema: {
        type: 'object',
        properties: {
          collection: { type: 'string', enum: ['connectors', 'telemetry', 'audit_logs', 'trade_history'], description: 'Data collection' }
        },
        required: ['collection']
      }
    }, async ({ collection }) => {
      const dbDir = path.join(WORKSPACE_ROOT, '.either_storage');
      const file = path.join(dbDir, collection + '.json');
      if (fs.existsSync(file)) {
        const raw = await fs.promises.readFile(file, 'utf8');
        return { content: [{ type: 'json', json: JSON.parse(raw) }] };
      }
      return { content: [{ type: 'json', json: [] }] };
    });
  }

  public registerTool(definition: MCPToolDefinition, handler: (args: any) => Promise<MCPToolExecutionResult>) {
    this.tools.set(definition.name, { definition, handler });
  }

  public listTools(): MCPToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  public async callTool(name: string, args: any): Promise<MCPToolExecutionResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { isError: true, content: [{ type: 'text', text: 'MCP Tool not found: ' + name }] };
    }
    return await tool.handler(args || {});
  }
}