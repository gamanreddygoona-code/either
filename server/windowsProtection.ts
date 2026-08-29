import fs from "fs";
import path from "path";
import os from "os";

// Powerful Windows Protection + AI Rules — keeps your PC safe
// This is the single source of truth for what the AI is allowed to do on your Windows machine.

export const WINDOWS_RULES = [
  { id: "R01", level: "BLOCK", title: "Never delete outside project without x-lb-token", desc: "File deletes / writes are restricted to PROJECT_ROOT unless EITHER_ADMIN_TOKEN + x-lb-token header is present. Prevents ransomware-style wipes.", mitigates: "Ransomware, data loss" },
  { id: "R02", level: "BLOCK", title: "Block dangerous commands", desc: "Sandbox blocks rm -rf, del /s, format, shutdown, mkfs, :(){ :|:&; }, PowerShell Remove-Item -Recurse -Force outside project.", mitigates: "Destructive commands" },
  { id: "R03", level: "ASK", title: "Ask before uncommon commands", desc: "If command not in allowlist (dir, git, npm, node, python...), ask 'Are you sure?' and require 'yes'.", mitigates: "Accidental execution" },
  { id: "R04", level: "BLOCK", title: "No .env / secrets exfiltration", desc: "AI may not read .env, .oauth/*, or send secrets to external hosts. Secrets stay local.", mitigates: "Secret theft" },
  { id: "R05", level: "ASK", title: "Ask before network exfiltration", desc: "Uploads to external hosts (non-allowlisted) require user confirmation. Allowlist: api.github.com, huggingface.co, api.notion.com, slack.com, discord.com, googleapis.com, binance, reddit.com, openai, googleai.", mitigates: "Data exfiltration" },
  { id: "R06", level: "ENFORCE", title: "Sandbox root = PROJECT_ROOT", desc: "All file ops are jailed to process.cwd() unless admin token. No access to C:\\Windows, C:\\Users\\*\\Documents outside project.", mitigates: "Directory traversal" },
  { id: "R07", level: "ENFORCE", title: "Timeout & maxBuffer", desc: "Every exec has 15s timeout + 1MB maxBuffer. Prevents fork bombs and log floods.", mitigates: "DoS, resource exhaustion" },
  { id: "R08", level: "LOG", title: "Log everything", desc: "Every command, file op, and network fetch is pushLog'd to daemonLogs (visible in DedicatedServerView).", mitigates: "Auditability" },
  { id: "R09", level: "BLOCK", title: "No dark web market facilitation", desc: "Dark Web OSINT is threat-intel only, logged with justification, .onion validated, no market instructions.", mitigates: "Abuse" },
  { id: "R10", level: "ENFORCE", title: "Monthly token guard", desc: "Start 100k/month hard limit via canConsumeTokens — 429 if over, no silent overage.", mitigates: "Cost, abuse" },
];

export const ALLOWLISTED_HOSTS = [
  "api.github.com", "huggingface.co", "api.notion.com", "slack.com", "discord.com",
  "www.googleapis.com", "gmail.googleapis.com", "api.binance.com", "www.reddit.com",
  "api.openai.com", "generativelanguage.googleapis.com", "oauth2.googleapis.com",
  "graph.facebook.com", "api.linear.app", "app.asana.com", "api.dropboxapi.com", "nla.zapier.com",
];

export function isPathAllowed(targetPath: string, projectRoot: string, hasAdminToken: boolean): { allowed: boolean; reason?: string } {
  const resolved = path.resolve(targetPath);
  const rel = path.relative(projectRoot, resolved);
  const inside = rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
  if (inside) return { allowed: true };
  if (hasAdminToken) return { allowed: true };
  return { allowed: false, reason: `Path "${resolved}" is outside project "${projectRoot}". Set EITHER_ADMIN_TOKEN and send x-lb-token to allow.` };
}

export function isCommandAllowed(cmd: string): { allowed: boolean; reason?: string; needsAsk?: boolean } {
  const blocked = [/rm\s+-rf/i, /del\s+.*\/s/i, /format\s+[a-z]:/i, /shutdown\s+\/[sg]/i, /mkfs/i, /:\(\)\{\s*:\|\:&\s*\}/, /Remove-Item.*-Recurse.*-Force/i, /ri\s+.*-Force/i];
  for (const pat of blocked) if (pat.test(cmd)) return { allowed: false, reason: `Blocked dangerous pattern: ${pat}` };
  const allowList = ["dir", "ls", "cat", "type", "echo", "git", "npm", "npx", "node", "python", "pip", "pwd", "whoami", "env", "set", "code", "ls -la", "dir /", "get-childitem"];
  const first = cmd.trim().split(/\s+/)[0].toLowerCase();
  const isAllowed = allowList.some(a => first === a.toLowerCase() || cmd.toLowerCase().startsWith(a.toLowerCase() + " "));
  if (!isAllowed) return { allowed: true, needsAsk: true, reason: "Uncommon command — needs user confirmation" };
  return { allowed: true };
}

export function isHostAllowed(url: string): { allowed: boolean; reason?: string } {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (ALLOWLISTED_HOSTS.some(h => host === h || host.endsWith("." + h))) return { allowed: true };
    // Allow localhost and private LAN for your servers
    if (host === "127.0.0.1" || host === "localhost" || host.startsWith("192.168.") || host.startsWith("10.")) return { allowed: true };
    return { allowed: false, reason: `Host ${host} not in allowlist. Ask before exfiltrating.` };
  } catch {
    return { allowed: false, reason: "Invalid URL" };
  }
}

export function getSystemHealth() {
  const cpus = os.cpus();
  return {
    hostname: os.hostname(),
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    cpuModel: cpus[0]?.model,
    cpus: cpus.length,
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    uptime: os.uptime(),
    user: os.userInfo().username,
    windowsProtection: "ACTIVE",
    rules: WINDOWS_RULES.length,
    allowlistedHosts: ALLOWLISTED_HOSTS.length,
  };
}

export function auditLogPath() {
  return path.join(process.cwd(), ".protection-audit.json");
}
