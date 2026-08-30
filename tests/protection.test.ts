import { describe, it, expect } from 'vitest';
import path from 'path';

const ALLOWED_COMMANDS = new Set(['git', 'npm', 'node', 'ls', 'dir', 'cat', 'echo', 'mkdir', 'pwd']);
const ALLOWED_HOSTS = new Set(['github.com', 'api.github.com', 'api.binance.com', 'accounts.google.com']);

function isCommandAllowed(command: string): boolean {
  const base = command.trim().split(/\s+/)[0]?.toLowerCase();
  return ALLOWED_COMMANDS.has(base);
}

function isPathAllowed(targetPath: string, root: string = process.cwd()): boolean {
  const resolved = path.resolve(root, targetPath);
  return resolved.startsWith(path.resolve(root)) && !targetPath.includes('..');
}

function isHostAllowed(host: string): boolean {
  return ALLOWED_HOSTS.has(host.toLowerCase());
}

describe('Windows Protection Layer & Path Jail', () => {
  it('isCommandAllowed permits allowlisted commands only', () => {
    expect(isCommandAllowed('git status')).toBe(true);
    expect(isCommandAllowed('npm test')).toBe(true);
    expect(isCommandAllowed('rm -rf /')).toBe(false);
    expect(isCommandAllowed('format C:')).toBe(false);
  });

  it('isPathAllowed blocks directory traversal attempts', () => {
    expect(isPathAllowed('src/App.tsx')).toBe(true);
    expect(isPathAllowed('../../Windows/System32')).toBe(false);
    expect(isPathAllowed('../outside.txt')).toBe(false);
  });

  it('isHostAllowed permits allowlisted external hosts only', () => {
    expect(isHostAllowed('api.github.com')).toBe(true);
    expect(isHostAllowed('malicious-c2.net')).toBe(false);
  });
});