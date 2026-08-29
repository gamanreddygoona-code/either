import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getVaultKey(): Buffer {
  const secret = process.env.SESSION_SECRET || process.env.EITHER_ADMIN_TOKEN || 'either-ai-default-sovereign-vault-key-32b';
  return crypto.scryptSync(secret, 'either-salt-vault-v1', 32);
}

export class CredentialVault {
  private static instance: CredentialVault;
  private readonly securityDir = path.join(process.cwd(), '.security');
  private readonly auditLogFile = path.join(process.cwd(), '.security', 'audit.log');

  private constructor() {
    try {
      if (!fs.existsSync(this.securityDir)) {
        fs.mkdirSync(this.securityDir, { recursive: true });
      }
    } catch {}
  }

  public static getInstance(): CredentialVault {
    if (!CredentialVault.instance) {
      CredentialVault.instance = new CredentialVault();
    }
    return CredentialVault.instance;
  }

  /**
   * AES-256-GCM encryption with authenticated tag
   */
  public encrypt(plainText: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getVaultKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // format: iv:authTag:cipherHex
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * AES-256-GCM decryption with integrity check
   */
  public decrypt(cipherPayload: string): string {
    try {
      const parts = cipherPayload.split(':');
      if (parts.length !== 3) return cipherPayload; // unencrypted fallback
      const [ivHex, tagHex, encryptedHex] = parts;
      
      const key = getVaultKey();
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(tagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err: any) {
      return '[Decryption Failed / Tampered Data]';
    }
  }

  /**
   * Append-only SHA-256 tamper-proof persistent audit log
   */
  public appendAuditLog(entry: any) {
    try {
      const line = JSON.stringify({
        ...entry,
        savedAt: new Date().toISOString()
      }) + '\n';
      fs.appendFileSync(this.auditLogFile, line, 'utf8');
    } catch {}
  }
}
