import { MCPHub, MCPToolDefinition } from '../mcp/mcpHub';

export type PluginPermission = 'fs:read' | 'fs:write' | 'net:fetch' | 'mcp:use' | 'trading:read' | 'security:audit';

export interface PluginToolDeclaration {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}

export interface EitherPluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  permissions: PluginPermission[];
  sandbox: boolean;
  installed: boolean;
  tools: PluginToolDeclaration[];
}

/**
 * Sovereign Plugin & Extension Marketplace Hub
 */
export class PluginMarketplace {
  private static instance: PluginMarketplace;
  private installedPlugins: Map<string, EitherPluginManifest> = new Map();
  private marketplaceCatalog: EitherPluginManifest[] = [];

  private constructor() {
    this.seedMarketplaceCatalog();
  }

  public static getInstance(): PluginMarketplace {
    if (!PluginMarketplace.instance) {
      PluginMarketplace.instance = new PluginMarketplace();
    }
    return PluginMarketplace.instance;
  }

  private seedMarketplaceCatalog() {
    const dockerPlugin: EitherPluginManifest = {
      id: 'either-docker-manager',
      name: 'Docker Container Swarm Manager',
      version: '1.2.0',
      author: 'Either Ecosystem',
      description: 'Manage local container lifecycle, inspect container logs, and orchestrate dev stacks.',
      permissions: ['fs:read', 'net:fetch', 'mcp:use'],
      sandbox: true,
      installed: false,
      tools: [
        {
          name: 'docker_list_containers',
          description: 'List active and stopped docker containers.',
          inputSchema: { type: 'object', properties: { all: { type: 'boolean' } } },
          handler: async () => ({ status: 'success', containers: [{ id: 'c1', image: 'postgres:16', state: 'running' }] })
        }
      ]
    };

    const sentryPlugin: EitherPluginManifest = {
      id: 'either-sentry-telemetry',
      name: 'Sentry Crash & Error Telemetry',
      version: '2.0.1',
      author: 'Either Security Labs',
      description: 'Stream live error telemetry, track stack traces, and evaluate automated crash fixes.',
      permissions: ['net:fetch', 'security:audit'],
      sandbox: true,
      installed: true,
      tools: [
        {
          name: 'sentry_fetch_issues',
          description: 'Fetch unresolved production issues.',
          inputSchema: { type: 'object', properties: { limit: { type: 'number' } } },
          handler: async ({ limit = 5 }) => ({ issues: [{ id: 'err-404', title: 'Route Not Found', count: 12 }] })
        }
      ]
    };

    this.marketplaceCatalog = [dockerPlugin, sentryPlugin];
    this.installedPlugins.set(sentryPlugin.id, sentryPlugin);
    this.registerPluginToolsToMCP(sentryPlugin);
  }

  private registerPluginToolsToMCP(plugin: EitherPluginManifest) {
    const mcp = MCPHub.getInstance();
    for (const tool of plugin.tools) {
      mcp.registerTool({
        name: tool.name,
        description: `[Plugin: ${plugin.name}] ${tool.description}`,
        category: 'connectors',
        inputSchema: tool.inputSchema as any
      }, async (args) => {
        const res = await tool.handler(args);
        return { content: [{ type: 'json', json: res }] };
      });
    }
  }

  public listMarketplace(): EitherPluginManifest[] {
    return this.marketplaceCatalog.map(p => ({
      ...p,
      installed: this.installedPlugins.has(p.id)
    }));
  }

  public installPlugin(pluginId: string): boolean {
    const target = this.marketplaceCatalog.find(p => p.id === pluginId);
    if (!target) return false;
    target.installed = true;
    this.installedPlugins.set(target.id, target);
    this.registerPluginToolsToMCP(target);
    return true;
  }

  public uninstallPlugin(pluginId: string): boolean {
    if (!this.installedPlugins.has(pluginId)) return false;
    this.installedPlugins.delete(pluginId);
    const target = this.marketplaceCatalog.find(p => p.id === pluginId);
    if (target) target.installed = false;
    return true;
  }
}