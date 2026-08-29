import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const PROJECT_ROOT = process.cwd();
const SECURITY_DIR = path.join(PROJECT_ROOT, '.security');
const AUDIT_LOG_FILE = path.join(SECURITY_DIR, 'audit.log');

// Ensure .security directory exists
try {
  if (!fs.existsSync(SECURITY_DIR)) {
    fs.mkdirSync(SECURITY_DIR, { recursive: true });
  }
} catch {}

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || process.env.EITHER_ADMIN_TOKEN || 'either-ai-default-master-encryption-key-32b';
  return crypto.scryptSync(secret, 'either-salt-security-v1', 32);
}

/**
 * 1. AES-256-GCM encryption for stored credentials
 */
export function encryptSecret(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(cipherText: string): string {
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;
    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '[Decryption Failed]';
  }
}

/**
 * 2. Rate limiting: 100 requests/min per IP/user
 */
const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1';
  const now = Date.now();
  const current = rateLimitMap.get(ip);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
  } else {
    current.count += 1;
    if (current.count > MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Rate limit exceeded (100 requests/minute). Please slow down.',
        retryAfterSec: Math.ceil((current.resetTime - now) / 1000)
      });
    }
  }
  next();
}

/**
 * 3. Prompt Injection Detection (Regex & Semantic Pattern Scan)
 */
const INJECTION_PATTERNS = [
  /ignores+(alls+)?(previouss+)?(instructions|rules|systems+prompts|directives)/i,
  /yous+ares+nows+(ins+)?(unrestricted|jailbreak|dan|developer)s+mode/i,
  /reveals+(yours+)?(hiddens+)?(systems+prompt|masters+instructions|.envs+secrets)/i,
  /gives+mes+(admins+)?(passwords|apis+keys|envs+vars|token)/i,
  /hacks+(nasa|pentagon|fbi|system|database)/i,
  /exfiltrates+credentials/i,
  /bypasss+(alls+)?(firewall|securitys+rules|safetys+filter)/i
];

export function detectPromptInjection(prompt: string): { blocked: boolean; reason?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        blocked: true,
        reason: `Prompt Injection Detected matching rule: ${pattern.source}`
      };
    }
  }
  return { blocked: false };
}

/**
 * 4. Output Sanitization (Prevents key leakage in AI answers)
 */
export function sanitizeAiOutput(output: string): string {
  let clean = output;
  clean = clean.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, '[REDACTED_API_KEY]');
  clean = clean.replace(/ghp_[A-Za-z0-9]{36}/g, '[REDACTED_GITHUB_TOKEN]');
  clean = clean.replace(/xoxb-[0-9]{11,13}-[0-9]{11,13}-[A-Za-z0-9]{24}/g, '[REDACTED_SLACK_TOKEN]');
  clean = clean.replace(/sk-nry-[A-Za-z0-9_-]{40,}/g, '[REDACTED_ROUTER_KEY]');
  return clean;
}

/**
 * 5. Tamper-Proof Audit Log (SHA-256 Hashed, Append-Only)
 */
let lastAuditHash = '0000000000000000000000000000000000000000000000000000000000000000';

export function logSecurityEvent(event: {
  user: string;
  action: string;
  verdict: 'ALLOWED' | 'BLOCKED' | 'FLAGGED';
  details: string;
}) {
  const timestamp = new Date().toISOString();
  const rawString = `${timestamp}:${event.user}:${event.action}:${event.verdict}:${event.details}:${lastAuditHash}`;
  const hash = crypto.createHash('sha256').update(rawString).digest('hex');

  const entry = {
    timestamp,
    ...event,
    prevHash: lastAuditHash,
    hash
  };

  lastAuditHash = hash;

  try {
    fs.appendFileSync(AUDIT_LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
  } catch {}

  return entry;
}

/**
 * 6. Path Jail Enforcement
 */
export function ensurePathJail(targetPath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, targetPath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(`Path jail violation: ${targetPath} resolves outside project root.`);
  }
  return resolved;
}
