import { ThreatIntelEngine } from './threatIntel';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_REGISTERED_TOOLS: MCPToolDefinition[] = [
  {
    name: 'gmail_search',
    description: 'Search authenticated Gmail inbox for emails, threads, sender details, and message bodies.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Gmail search query syntax (e.g. "is:unread", "from:support", "subject:invoice")' },
        maxResults: { type: 'number', description: 'Maximum number of emails to retrieve (default: 8)' }
      },
      required: ['query']
    }
  },
  {
    name: 'github_repos',
    description: 'Inspect authenticated GitHub repositories, commits, issues, and pull requests.',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Optional specific repository owner/name (e.g. "gamanreddygoona-code/either")' },
        type: { type: 'string', enum: ['repos', 'commits', 'pulls', 'issues'], description: 'Type of GitHub resource to inspect' }
      }
    }
  },
  {
    name: 'notion_search',
    description: 'Search connected Notion workspace pages, documents, wikis, and databases.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term to match against Notion page titles and content' }
      },
      required: ['query']
    }
  },
  {
    name: 'threat_intel_check',
    description: 'Run real-time dark web OSINT, breach analysis (HIBP), IP reputation (VirusTotal), or CISA KEV exploit lookup.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['email', 'ip', 'domain', 'cve', 'onion'], description: 'Type of target to analyze' },
        target: { type: 'string', description: 'Target value (email address, IP, domain name, CVE ID, or search keyword)' },
        justifiedReason: { type: 'string', description: 'Mandatory defensive research justification' }
      },
      required: ['type', 'target', 'justifiedReason']
    }
  }
];

export class MCPServer {
  private static instance: MCPServer;

  public static getInstance(): MCPServer {
    if (!MCPServer.instance) {
      MCPServer.instance = new MCPServer();
    }
    return MCPServer.instance;
  }

  public listTools(): MCPToolDefinition[] {
    return MCP_REGISTERED_TOOLS;
  }

  public async callTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'threat_intel_check': {
        const { type, target } = args;
        const engine = ThreatIntelEngine.getInstance();
        if (type === 'email') return await engine.checkEmailBreach(target);
        if (type === 'ip') return await engine.checkVirusTotal(target, 'ip');
        if (type === 'domain') return await engine.checkVirusTotal(target, 'domain');
        if (type === 'cve') return await engine.searchCisaKev(target);
        if (type === 'onion') return await engine.searchAhmia(target);
        throw new Error(`Unsupported threat intel target type: ${type}`);
      }
      case 'gmail_search': {
        return { message: 'Use /api/connectors/gmail/sync for full OAuth-authenticated sync.' };
      }
      case 'github_repos': {
        return { message: 'Use /api/connectors/github/sync for full repository sync.' };
      }
      case 'notion_search': {
        return { message: 'Use /api/connectors/notion/sync for full workspace sync.' };
      }
      default:
        throw new Error(`Unknown MCP tool: ${name}`);
    }
  }
}
